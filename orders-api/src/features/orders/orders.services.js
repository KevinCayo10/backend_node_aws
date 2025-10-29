"use strict";
import pool from "../../core/db.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const createOrderService = async ({ customerId, items }) => {
  const conn = await pool.getConnection();
  try {
    console.log(
      "🦁 - INFO - Customer API URL:",
      `${process.env.CUSTOMER_API_URL}/customers/internal/${customerId}`
    );
    const resp = await axios.get(
      `${process.env.CUSTOMER_API_URL}/customers/internal/${customerId}`
    );

    if (resp.status !== 200) {
      throw new Error("Customer not found");
    }
    const customer = resp.data;
    if (!customer) {
      throw new Error("Customer not found");
    }

    let total = 0;
    for (const it of items) {
      const [rows] = await conn.query("SELECT * FROM Product WHERE id = ?", [
        it.productId,
      ]);
      if (rows.length === 0) {
        throw new Error("Product not found");
      }
      const product = rows[0];
      if (product.stock < it.qty) {
        throw new Error("Product out of stock");
      }
      total += product.priceCents * it.qty;
      const stock = product.stock - it.qty;
      const [result] = await conn.query(
        "UPDATE Product SET stock = ? WHERE id = ?",
        [stock, it.productId]
      );
    }

    // create order
    const result = await conn.query(
      "INSERT INTO `Order` (customerId, status, totalCents) VALUES (?, ?, ?)",
      [customerId, "CREATED", total]
    );
    const order = result[0];
    // create order items
    for (const it of items) {
      const [rows] = await conn.query("SELECT * FROM Product WHERE id = ?", [
        it.productId,
      ]);
      if (rows.length === 0) {
        throw new Error("Product not found");
      }
      const product = rows[0];
      if (product.stock < it.qty) {
        throw new Error("Product out of stock");
      }
      await conn.query(
        "INSERT INTO OrderItem (orderId, productId, qty, unitPriceCents, subtotalCents) VALUES (?, ?, ?, ?, ?)",
        [
          order.insertId,
          it.productId,
          it.qty,
          product.priceCents,
          product.priceCents * it.qty,
        ]
      );
    }
    await conn.commit();
    return order;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
};

export const confirmOrderService = async (orderId, key) => {
  const [exists] = await pool.query(
    "SELECT * FROM IdempotencyKey WHERE `key` = ?",
    [key]
  );
  if (exists.length) {
    return JSON.parse(exists[0].responseBody);
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query("SELECT * FROM `Order` WHERE id = ?", [
      orderId,
    ]);
    const order = rows[0];
    console.log("🦁 - INFO - Order:", order);
    if (!order) throw new Error("Order not found");
    console.log("🦁 - INFO - Order status:", order.status);
    if (order.status === "CONFIRMED") return order;
    console.log("🦁 - INFO - Updating order status to CONFIRMED");
    await conn.query('UPDATE `Order` SET status = "CONFIRMED" WHERE id = ?', [
      orderId,
    ]);
    console.log("🦁 - INFO - Order status updated to CONFIRMED");
    const [items] = await conn.query(
      "SELECT * FROM `OrderItem` WHERE orderId = ?",
      [orderId]
    );
    console.log("🦁 - INFO - Items:", items);
    const response = { id: orderId, status: "CONFIRMED", items };
    await conn.query(
      "INSERT INTO `IdempotencyKey` (`key`, targetType, targetId, status, responseBody) VALUES (?, ?, ?, ?, ?)",
      [key, "ORDER_CONFIRM", Number(orderId), "DONE", JSON.stringify(response)]
    );

    await conn.commit();
    return response;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const cancelOrderService = async (orderId, key) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [exists] = await conn.query(
      "SELECT * FROM IdempotencyKey WHERE `key` = ?",
      [key]
    );
    if (exists.length) {
      return JSON.parse(exists[0].responseBody);
    }
    const [rows] = await conn.query("SELECT * FROM `Order` WHERE id = ?", [
      orderId,
    ]);
    const order = rows[0];
    if (!order) throw new Error("Order not found");

    const [items] = await conn.query(
      "SELECT * FROM OrderItem WHERE orderId = ?",
      [orderId]
    );
    for (const it of items) {
      await conn.query("UPDATE Product SET stock = stock + ? WHERE id = ?", [
        it.qty,
        it.productId,
      ]);
    }

    await conn.query('UPDATE `Order` SET status = "CANCELED" WHERE id = ?', [
      orderId,
    ]);
    await conn.commit();
    return { id: orderId, status: "CANCELED" };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
};
