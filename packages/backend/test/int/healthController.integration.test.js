import request from "supertest";
import { buildTestServer } from "./utils/buildTestServer.js";

const app = buildTestServer();

describe("GET /api/health", () => {
    test("devuelve 200 con el estado del servicio", async () => {
        const res = await request(app).get("/api/health");

        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
        expect(res.body.timestamp).toBeDefined();
    });

    test("el timestamp es una fecha ISO valida", async () => {
        const res = await request(app).get("/api/health");

        expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });
});
