import { Router } from "express";
import { z } from "zod";
import { createProduct, deleteProduct, getProductById, listProducts, updateProduct } from "./products.controller.js";
const productRoutes = Router();

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

const idParam = z.object({ id: z.coerce.number().int().positive() });
const listQuery = z.object({
  search: z.string().optional(),
  cursor: z.coerce.number().int().nonnegative().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const createBody = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  priceCents: z.coerce.number().int().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
});

const updateBody = createBody.partial();

productRoutes.get("/", validate(listQuery, "query"), listProducts);
productRoutes.get("/:id", validate(idParam, "params"), getProductById);
productRoutes.post("/", validate(createBody, "body"), createProduct);
productRoutes.put("/:id", validate(idParam, "params"), validate(updateBody, "body"), updateProduct);
productRoutes.delete("/:id", validate(idParam, "params"), deleteProduct);

export default productRoutes;
