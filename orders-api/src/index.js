import express from "express";
import cors from "cors";
import routes from "./features/routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

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
    // Docs
    try {
      const openapiPath = path.resolve(process.cwd(), "openapi.yaml");
      const yamlText = fs.readFileSync(openapiPath, "utf8");
      const spec = YAML.parse(yamlText);
      this.app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(spec));
    } catch (e) {
      console.warn("OpenAPI spec not loaded:", e.message);
    }

    this.app.use("/api/v1", routes);
    this.app.use((req, res) => {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });
  }

  initServer() {
    const port = Number(process.env.PORT) || 3002;
    this.app.listen(port, () => {
      console.log(`Server is running on http://127.0.0.1:${port}`);
    });
  }
}

const server = new Server();
server.initServer();
