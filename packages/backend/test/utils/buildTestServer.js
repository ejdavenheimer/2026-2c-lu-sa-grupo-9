import express from "express";
import route from "../../src/routes/router.js";
import { notFoundHandler } from "../../src/middlewares/notFoundHandler.js";
import { errorHandler } from "../../src/middlewares/errorHandler.js";

/**
 * Arma la misma app que index.js, pero sin app.listen() ni la conexion a Mongo,
 * para poder pegarle con supertest.
 *
 * No incluye errorLogger a proposito: solo hace console.error y llama a next(err),
 * no toca la respuesta. Dejarlo ensuciaria la salida de los tests con un stack
 * trace por cada caso de error, sin cambiar lo que se verifica.
 *
 * Tampoco monta swagger, que no es parte de la API.
 */
export function buildTestServer() {
    const app = express();

    app.use(express.json());
    app.use("/api", route);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
