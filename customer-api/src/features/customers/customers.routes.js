import { Router } from "express";
import { z } from "zod";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomerByIdInternal,
  searchCustomers,
  updateCustomer,
} from "./customers.controller.js";
import { requireServiceToken } from "../../core/auth_middleware.js";

const customersRoutes = Router();

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

const createCustomerBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
});

const updateCustomerBody = createCustomerBody.partial();
const idParam = z.object({ id: z.coerce.number().int().positive() });
const searchQuery = z.object({
  search: z.string().min(1).optional(),
  cursor: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

customersRoutes.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Customers routes",
    data: [],
  });
});

customersRoutes.post("/", validate(createCustomerBody, "body"), createCustomer);
customersRoutes.get("/:id", validate(idParam, "params"), getCustomerById);
customersRoutes.get("/", validate(searchQuery, "query"), searchCustomers);
customersRoutes.put("/:id", validate(idParam, "params"), validate(updateCustomerBody, "body"), updateCustomer);
customersRoutes.delete("/:id", validate(idParam, "params"), deleteCustomer);

// internal endpoint for orders-api usage
customersRoutes.get(
  "/internal/:id",
  requireServiceToken,
  validate(idParam, "params"),
  getCustomerByIdInternal
);

export default customersRoutes;
