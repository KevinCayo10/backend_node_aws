import pool from "../../core/db.js";

export const createCustomerService = async ({ name, email, phone }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      "INSERT INTO Customer (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );
    if (result.length === 0) {
      throw new Error("Failed to create customer");
    }
    const customer = result[0];
    return customer;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
};

export const getCustomerByIdService = async (id) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query("SELECT * FROM Customer WHERE id = ?", [
      id,
    ]);
    if (result.length === 0) {
      throw new Error("Customer not found");
    }
    const customer = result[0];
    return customer;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
};

export const searchCustomersService = async ({ search, cursor, limit }) => {
  const conn = await pool.getConnection();
  try {
    const offset = (cursor - 1) * limit;
    const limitClause = limit ? `LIMIT ${offset}, ${limit}` : "";

    const [result] = await conn.query(
      `SELECT * FROM Customer WHERE name LIKE ? OR email LIKE ? ${limitClause}`,
      [`%${search}%`, `%${search}%`]
    );
    if (result.length === 0) {
      throw new Error("No customers found");
    }
    const customers = result;
    return customers;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
};

export const updateCustomerService = async (id, { name, email, phone }) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      "UPDATE Customer SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, id]
    );
    if (result.length === 0) {
      throw new Error("Customer not found");
    }
    const customer = result[0];
    return customer;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
};

export const deleteCustomerService = async (id) => {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query("DELETE FROM Customer WHERE id = ?", [
      id,
    ]);
    if (result.length === 0) {
      throw new Error("Customer not found");
    }
    const customer = result[0];
    return customer;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    await conn.release();
  }
};
