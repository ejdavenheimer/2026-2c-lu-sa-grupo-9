import request from "supertest";
import { buildTestServer } from "../utils/buildTestServer.js";
import { ColectivoRepository } from "../../src/repositories/ColectivoRepository.js";

const app = buildTestServer();

function datosColectivo(overrides = {}) {
    return {
        nombre: "Fundacion Barrial",
        descripcion: "Trabaja con comedores del conurbano",
        tipo: "Fundacion",
        ...overrides
    };
}

describe("POST /api/colectivos", () => {
    beforeEach(async () => {
        await ColectivoRepository.limpiar();
    });

    test("crea el colectivo y devuelve 201 con un id generado", async () => {
        const res = await request(app)
            .post("/api/colectivos")
            .send(datosColectivo())
            .set("Content-Type", "application/json");

        expect(res.status).toBe(201);
        expect(res.body.nombre).toBe("Fundacion Barrial");
        expect(res.body.tipo).toBe("Fundacion");
        expect(res.body.id).toBeDefined();
    });

    test("acepta una ubicacion opcional", async () => {
        const res = await request(app)
            .post("/api/colectivos")
            .send(datosColectivo({
                ubicacion: { pais: "Argentina", provincia: "Buenos Aires", ciudad: "Lanus" }
            }));

        expect(res.status).toBe(201);
        expect(res.body.ubicacion).toBeDefined();
    });

    test("devuelve 400 si falta el nombre", async () => {
        const datos = datosColectivo();
        delete datos.nombre;

        const res = await request(app).post("/api/colectivos").send(datos);

        expect(res.status).toBe(400);
        expect(res.body.status).toBe("fail");
    });

    test("devuelve 400 si falta el tipo", async () => {
        const datos = datosColectivo();
        delete datos.tipo;

        const res = await request(app).post("/api/colectivos").send(datos);

        expect(res.status).toBe(400);
    });

    test("devuelve 400 si se manda un campo que no existe", async () => {
        const res = await request(app)
            .post("/api/colectivos")
            .send(datosColectivo({ campoInventado: "algo" }));

        expect(res.status).toBe(400);
    });
});

describe("GET /api/colectivos", () => {
    beforeEach(async () => {
        await ColectivoRepository.limpiar();
    });

    test("devuelve una lista vacia si no hay colectivos", async () => {
        const res = await request(app).get("/api/colectivos");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("devuelve los colectivos cargados", async () => {
        await request(app).post("/api/colectivos").send(datosColectivo({ nombre: "Colectivo A" }));
        await request(app).post("/api/colectivos").send(datosColectivo({ nombre: "Colectivo B" }));

        const res = await request(app).get("/api/colectivos");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body.map((c) => c.nombre)).toEqual(
            expect.arrayContaining(["Colectivo A", "Colectivo B"])
        );
    });
});

describe("GET /api/colectivos/:id", () => {
    beforeEach(async () => {
        await ColectivoRepository.limpiar();
    });

    test("devuelve 200 con el colectivo si existe", async () => {
        const creado = await request(app).post("/api/colectivos").send(datosColectivo());

        const res = await request(app).get(`/api/colectivos/${creado.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(creado.body.id);
        expect(res.body.nombre).toBe("Fundacion Barrial");
    });

    test("devuelve 404 si el id no existe", async () => {
        const res = await request(app).get("/api/colectivos/id-inexistente");

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/no se encontr/i);
    });
});
