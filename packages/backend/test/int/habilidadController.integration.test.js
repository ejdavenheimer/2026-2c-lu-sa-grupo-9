import request from "supertest";
import { buildTestServer } from "../utils/buildTestServer.js";
import { HabilidadRepository } from "../../src/repositories/HabilidadRepository.js";

const app = buildTestServer();

function datosHabilidad(overrides = {}) {
    return {
        titulo: "Desarrollo Web React",
        descripcion: "Construccion de SPAs con React",
        ...overrides
    };
}

describe("POST /api/habilidades", () => {
    beforeEach(async () => {
        await HabilidadRepository.limpiar();
    });

    test("crea la habilidad y devuelve 201 con el codigo normalizado", async () => {
        const res = await request(app)
            .post("/api/habilidades")
            .send(datosHabilidad())
            .set("Content-Type", "application/json");

        expect(res.status).toBe(201);
        expect(res.body.titulo).toBe("Desarrollo Web React");
        expect(res.body.codigo).toBe("desarrollo_web_react");
        expect(res.body.descripcion).toBe("Construccion de SPAs con React");
    });

    test("la habilidad creada queda persistida y se puede listar", async () => {
        await request(app).post("/api/habilidades").send(datosHabilidad());

        const res = await request(app).get("/api/habilidades");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].codigo).toBe("desarrollo_web_react");
    });

    test("devuelve 400 si falta el titulo", async () => {
        const res = await request(app)
            .post("/api/habilidades")
            .send({ descripcion: "sin titulo" });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe("fail");
        expect(res.body.message).toMatch(/titulo|título/i);
    });

    test("devuelve 422 si el titulo esta vacio", async () => {
        const res = await request(app)
            .post("/api/habilidades")
            .send(datosHabilidad({ titulo: "" }));

        expect(res.status).toBe(422);
        expect(res.body.status).toBe("fail");
    });

    test("devuelve 400 si se manda un campo que no existe", async () => {
        const res = await request(app)
            .post("/api/habilidades")
            .send(datosHabilidad({ campoInventado: "algo" }));

        expect(res.status).toBe(400);
    });

    test("devuelve 409 si ya existe una habilidad con el mismo codigo", async () => {
        await request(app).post("/api/habilidades").send(datosHabilidad());

        const res = await request(app).post("/api/habilidades").send(datosHabilidad());

        expect(res.status).toBe(409);
        expect(res.body.message).toMatch(/ya existe/i);
    });
});

describe("GET /api/habilidades", () => {
    beforeEach(async () => {
        await HabilidadRepository.limpiar();
    });

    test("devuelve una lista vacia si no hay habilidades", async () => {
        const res = await request(app).get("/api/habilidades");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("devuelve todas las habilidades cargadas", async () => {
        await request(app).post("/api/habilidades").send(datosHabilidad({ titulo: "Testing E2E con Cypress" }));
        await request(app).post("/api/habilidades").send(datosHabilidad({ titulo: "Conocimientos de Pandas" }));

        const res = await request(app).get("/api/habilidades");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body.map((h) => h.codigo)).toEqual(
            expect.arrayContaining(["testing_e2e_con_cypress", "conocimientos_de_pandas"])
        );
    });
});

describe("GET /api/habilidades/:codigo", () => {
    beforeEach(async () => {
        await HabilidadRepository.limpiar();
    });

    test("devuelve 200 con la habilidad si existe", async () => {
        await request(app).post("/api/habilidades").send(datosHabilidad());

        const res = await request(app).get("/api/habilidades/desarrollo_web_react");

        expect(res.status).toBe(200);
        expect(res.body.titulo).toBe("Desarrollo Web React");
    });

    test("devuelve 404 si no existe", async () => {
        const res = await request(app).get("/api/habilidades/no_existe");

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/no se encontr/i);
    });
});

describe("PUT /api/habilidades/:codigo", () => {
    beforeEach(async () => {
        await HabilidadRepository.limpiar();
    });

    test("actualiza el titulo y la descripcion", async () => {
        await request(app).post("/api/habilidades").send(datosHabilidad());

        const res = await request(app)
            .put("/api/habilidades/desarrollo_web_react")
            .send({ titulo: "React Avanzado", descripcion: "Hooks y performance" });

        expect(res.status).toBe(200);
        expect(res.body.titulo).toBe("React Avanzado");
        expect(res.body.descripcion).toBe("Hooks y performance");
    });

    test("devuelve 400 si se manda un campo que no existe", async () => {
        await request(app).post("/api/habilidades").send(datosHabilidad());

        const res = await request(app)
            .put("/api/habilidades/desarrollo_web_react")
            .send({ campoInventado: "algo" });

        expect(res.status).toBe(400);
    });
});

describe("DELETE /api/habilidades/:codigo", () => {
    beforeEach(async () => {
        await HabilidadRepository.limpiar();
    });

    test("elimina la habilidad y devuelve 204", async () => {
        await request(app).post("/api/habilidades").send(datosHabilidad());

        const res = await request(app).delete("/api/habilidades/desarrollo_web_react");

        expect(res.status).toBe(204);

        const listado = await request(app).get("/api/habilidades");
        expect(listado.body).toEqual([]);
    });

    test("devuelve 404 si la habilidad no existe", async () => {
        const res = await request(app).delete("/api/habilidades/no_existe");

        expect(res.status).toBe(404);
    });
});

describe("rutas inexistentes", () => {
    test("devuelve 404 con el formato de error de la app", async () => {
        const res = await request(app).get("/api/ruta-que-no-existe");

        expect(res.status).toBe(404);
        expect(res.body.status).toBe("fail");
        expect(res.body.message).toMatch(/no encontrada/i);
    });
});
