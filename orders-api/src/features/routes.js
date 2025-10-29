import { Router } from "express";
import ordersRoutes from "./orders/orders.routes.js";
import productRoutes from "./products/products.routes.js";
const routes = Router();

routes.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    data: [],
  });
});

routes.use("/orders", ordersRoutes);
routes.use("/products", productRoutes);

export default routes;
