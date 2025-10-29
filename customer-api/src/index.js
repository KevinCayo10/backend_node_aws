import express from "express";
import cors from "cors";
import routes from "./features/routes.js";

class Server {
  constructor() {
    this.app = express();
    this.initMiddlewares();
    this.initRoutes();
  }

  initMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
  }

  initRoutes() {
    this.app.use("/api/v1", routes);
    this.app.use((req, res) => {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });
  }

  initServer() {
    const port = Number(process.env.PORT) || 3001;
    this.app.listen(port, () => {
      console.log(`Server is running on http://127.0.0.1:${port}`);
    });
  }
}

const server = new Server();
server.initServer();
