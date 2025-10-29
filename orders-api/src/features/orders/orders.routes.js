import { Router } from "express";
import { z } from "zod";
import {
  createOrder,
  getOrder,
  listOrders,
  confirmOrder,
  cancelOrder,
} from "./orders.controller.js";
import { requireServiceToken } from "../../core/auth_middleware.js";

const ordersRoutes = Router();

const validate = (schema, source = "body") => (req, res, next) => {
  try {
    const data = schema.parse(req[source]);
    if (source === "body") req.body = data;
    if (source === "params") req.params = data;
    if (source === "query") req.query = data;
    next();
  } catch (e) {
    return res.status(400).json({
      status: false,
      message: "Validation error",
      errors: e.errors ?? e.message,
    });
  }
};

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive(),
});

const createOrderBody = z.object({
  customerId: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1),
});

const idParam = z.object({ id: z.coerce.number().int().positive() });

const listOrdersQuery = z.object({
  status: z.enum(["CREATED", "CONFIRMED", "CANCELED"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

ordersRoutes.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Customers routes",
    data: [],
  });
});

ordersRoutes.post("/", validate(createOrderBody, "body"), createOrder);
ordersRoutes.get("/:id", validate(idParam, "params"), getOrder);
ordersRoutes.get("/", validate(listOrdersQuery, "query"), listOrders);
ordersRoutes.post("/:id/confirm", validate(idParam, "params"), confirmOrder);
ordersRoutes.post("/:id/cancel", validate(idParam, "params"), cancelOrder);

export default ordersRoutes;
