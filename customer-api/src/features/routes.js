import { Router } from "express";
import customersRoutes from "./customers/customers.routes.js";
const routes = Router();

routes.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    data: [],
  });
});

routes.use("/customers", customersRoutes);

export default routes;
