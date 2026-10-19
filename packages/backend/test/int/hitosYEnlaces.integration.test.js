import request from "supertest";
import { buildTestServer } from "../utils/buildTestServer.js";

const app = buildTestServer();

// Trazabilidad de la segunda entrega: en los proyectos se carga periodicamente
// el porcentaje de concrecion, los logros/hitos y los enlaces al sistema en
// funcionamiento y a su codigo fuente.

async function crearProyecto() {
    const hab = (await request(app).post("/api/habilidades").send({ titulo: "React" })).body;
    const col = (await request(app).post("/api/colectivos")
        .send({ nombre: "ONG", descripcion: "d", tipo: "ONG" })).body;
    const proyecto = (await request(app).post("/api/proyectos").send({
        titulo: "Portal", descripcion: "d",
        unidadCompromiso: "HORAS_TOTALES", cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"],
        colectivoId: col.id, habilidadesRequeridasCodigos: [hab.codigo]
    })).body;
    return proyecto;
}

const registrarHito = (proyectoId, porcentajeConcrecion, descripcion) =>
    request(app).post(`/api/proyectos/${proyectoId}/hitos`).send({ porcentajeConcrecion, descripcion });

describe("GET /api/proyectos/:id/hitos", () => {
    test("devuelve lista vacia si el proyecto no tiene hitos", async () => {
        const proyecto = await crearProyecto();

        const res = await request(app).get(`/api/proyectos/${proyecto.id}/hitos`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("devuelve 404 si el proyecto no existe", async () => {
        const res = await request(app).get("/api/proyectos/no-existe/hitos");

        expect(res.status).toBe(404);
    });
});

describe("POST /api/proyectos/:id/hitos", () => {
    test("devuelve 400 si falta la descripcion", async () => {
        const proyecto = await crearProyecto();

        const res = await request(app)
            .post(`/api/proyectos/${proyecto.id}/hitos`)
            .send({ porcentajeConcrecion: 50 });

        expect([400, 422]).toContain(res.status);
    });

    test("devuelve 400 si el porcentaje esta fuera de rango", async () => {
        const proyecto = await crearProyecto();

        const res = await registrarHito(proyecto.id, 150, "Imposible");

        expect([400, 422]).toContain(res.status);
    });

    test("no se pueden registrar hitos en un proyecto cerrado", async () => {
        const proyecto = await crearProyecto();
        await request(app).patch(`/api/proyectos/${proyecto.id}/cerrar`).send({});

        const res = await registrarHito(proyecto.id, 50, "Tarde");

        expect(res.status).toBe(409);
    });
});

describe("GET /api/proyectos/:id/hitos/:hitoId", () => {
    test("devuelve el hito si existe", async () => {
        const proyecto = await crearProyecto();
        const hito = (await registrarHito(proyecto.id, 50, "Primer hito")).body;

        const res = await request(app).get(`/api/proyectos/${proyecto.id}/hitos/${hito.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(hito.id);
        expect(res.body.porcentajeConcrecion).toBe(50);
    });

    test("devuelve 404 si el hito no existe", async () => {
        const proyecto = await crearProyecto();

        const res = await request(app).get(`/api/proyectos/${proyecto.id}/hitos/no-existe`);

        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/proyectos/:id/hitos/:hitoId", () => {
    test("actualiza la descripcion del hito y persiste", async () => {
        const proyecto = await crearProyecto();
        const hito = (await registrarHito(proyecto.id, 50, "Primer hito")).body;

        const res = await request(app)
            .patch(`/api/proyectos/${proyecto.id}/hitos/${hito.id}`)
            .send({ descripcion: "Primer hito corregido" });

        expect(res.status).toBe(200);

        const releido = await request(app).get(`/api/proyectos/${proyecto.id}/hitos/${hito.id}`);
        expect(releido.body.descripcion).toBe("Primer hito corregido");
    });

    test("devuelve 404 si el hito no existe", async () => {
        const proyecto = await crearProyecto();

        const res = await request(app)
            .patch(`/api/proyectos/${proyecto.id}/hitos/no-existe`)
            .send({ descripcion: "x" });

        expect(res.status).toBe(404);
    });
});

describe("DELETE /api/proyectos/:id/hitos/:hitoId", () => {
    test("elimina el hito del proyecto", async () => {
        const proyecto = await crearProyecto();
        const hito = (await registrarHito(proyecto.id, 50, "Primer hito")).body;

        const res = await request(app).delete(`/api/proyectos/${proyecto.id}/hitos/${hito.id}`);

        expect([200, 204]).toContain(res.status);

        const listado = await request(app).get(`/api/proyectos/${proyecto.id}/hitos`);
        expect(listado.body).toEqual([]);
    });

    test("devuelve 404 si el hito no existe", async () => {
        const proyecto = await crearProyecto();

        const res = await request(app).delete(`/api/proyectos/${proyecto.id}/hitos/no-existe`);

        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/proyectos/:id/enlaces", () => {
    test("carga los enlaces al sistema y al codigo fuente", async () => {
        const proyecto = await crearProyecto();

        const res = await request(app)
            .patch(`/api/proyectos/${proyecto.id}/enlaces`)
            .send({
                enlaceSistemaEnFuncionamiento: "https://portal.example.org",
                enlaceCodigoFuente: "https://github.com/ong/portal"
            });

        expect(res.status).toBe(200);

        const releido = await request(app).get(`/api/proyectos/${proyecto.id}`);
        expect(releido.body.enlaceSistemaEnFuncionamiento).toBe("https://portal.example.org");
        expect(releido.body.enlaceCodigoFuente).toBe("https://github.com/ong/portal");
    });

    test("devuelve 400 si el enlace no es una URL valida", async () => {
        const proyecto = await crearProyecto();

        const res = await request(app)
            .patch(`/api/proyectos/${proyecto.id}/enlaces`)
            .send({ enlaceCodigoFuente: "no-es-una-url" });

        expect([400, 422]).toContain(res.status);
    });

    test("devuelve 404 si el proyecto no existe", async () => {
        const res = await request(app)
            .patch("/api/proyectos/no-existe/enlaces")
            .send({ enlaceCodigoFuente: "https://github.com/ong/portal" });

        expect(res.status).toBe(404);
    });
});
