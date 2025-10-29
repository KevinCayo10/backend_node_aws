import { createSchema } from "./orders.model.js";
import { cancelOrderService, confirmOrderService, createOrderService } from "./orders.services.js";

export const createOrder = async (req, res, next) => {
  try {
    const dto = req.body;
    const order = await createOrderService(dto);
    res.status(201).json({
      status: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await getOrderService(id);
    res.json({
      status: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const orders = await listOrdersService();
    res.json({
      status: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const key = req.headers["x-idempotency-key"];
    if (!key) {
      return res.status(400).json({
        status: false,
        message: "Idempotency key is required",
      });
    }
    const order = await confirmOrderService(id, key);
    res.json({
      status: true,
      message: "Order confirmed successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const key = req.headers["x-idempotency-key"];
    if (!key) {
      return res.status(400).json({
        status: false,
        message: "Idempotency key is required",
      });
    }
    const order = await cancelOrderService(id, key);
    res.json({
      status: true,
      message: "Order canceled successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
