import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./src/config/swagger.js";
import route from "./src/routes/router.js";
import { notFoundHandler } from "./src/middlewares/notFoundHandler.js"
import { errorLogger } from "./src/middlewares/errorLogger.js"
import { errorHandler } from "./src/middlewares/errorHandler.js"
import { MongoDBClient } from "./src/config/database.js";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : true,
  }),
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', route);

// Middlewares
app.use(notFoundHandler)
app.use(errorLogger)
app.use(errorHandler)

const start = async () => {
  await MongoDBClient.connect();

  app.listen(process.env.SERVER_PORT, () => {
    console.log(`Backend escuchando en puerto ${process.env.SERVER_PORT}`);
    console.log(`Documentación Swagger disponible en http://localhost:${process.env.SERVER_PORT}/api-docs`);
  });
};

start();

