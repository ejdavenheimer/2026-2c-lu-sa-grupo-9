import request from "supertest";
import { buildTestServer } from "./utils/buildTestServer.js";

const app = buildTestServer();

async function escenario() {
    const hab = (await request(app).post("/api/habilidades").send({ titulo: "React" })).body;
    const opcional = (await request(app).post("/api/habilidades").send({ titulo: "Cypress" })).body;
    const col = (await request(app).post("/api/colectivos")
        .send({ nombre: "ONG", descripcion: "d", tipo: "ONG" })).body;
    const proyecto = (await request(app).post("/api/proyectos").send({
        titulo: "Portal", descripcion: "d",
        unidadCompromiso: "HORAS_TOTALES", cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"],
        colectivoId: col.id, habilidadesRequeridasCodigos: [hab.codigo]
    })).body;
    return { hab, opcional, col, proyecto };
}

function datosPerfil(hab, overrides = {}) {
    return {
        nombre: "Frontend",
        descripcion: "Perfil de frontend",
        habilidadesRequeridasCodigos: [hab.codigo],
        unidadCompromiso: "HORAS_TOTALES",
        cantidadHoras: 5,
        modalidadesColaboracion: ["GRATUITA"],
        ...overrides
    };
}

async function crearPerfil(proyectoId, body) {
    return request(app).post(`/api/proyectos/${proyectoId}/perfiles`).send(body);
}

describe("POST /api/proyectos/:id/perfiles", () => {
    test("acepta habilidades opcionales ademas de las requeridas", async () => {
        const { hab, opcional, proyecto } = await escenario();

        const res = await crearPerfil(proyecto.id, datosPerfil(hab, {
            habilidadesOpcionalesCodigos: [opcional.codigo]
        }));

        expect(res.status).toBe(201);
        expect(res.body.habilidadesRequeridas.map((h) => h.codigo)).toEqual([hab.codigo]);
        expect(res.body.habilidadesOpcionales.map((h) => h.codigo)).toEqual([opcional.codigo]);
    });

    test("devuelve 400 si no se indica ninguna habilidad requerida", async () => {
        const { hab, proyecto } = await escenario();

        const res = await crearPerfil(proyecto.id, datosPerfil(hab, {
            habilidadesRequeridasCodigos: []
        }));

        expect([400, 422]).toContain(res.status);
    });

    test("devuelve 400 si la unidad de compromiso no es valida", async () => {
        const { hab, proyecto } = await escenario();

        const res = await crearPerfil(proyecto.id, datosPerfil(hab, {
            unidadCompromiso: "HORAS_LUNARES"
        }));

        expect([400, 422]).toContain(res.status);
    });

    test("devuelve 400 si se manda un campo que no existe", async () => {
        const { hab, proyecto } = await escenario();

        const res = await crearPerfil(proyecto.id, datosPerfil(hab, { campoInventado: "x" }));

        expect(res.status).toBe(400);
    });

    test("no se pueden agregar perfiles a un proyecto cerrado", async () => {
        const { hab, proyecto } = await escenario();
        await request(app).patch(`/api/proyectos/${proyecto.id}/cerrar`).send({});

        const res = await crearPerfil(proyecto.id, datosPerfil(hab));

        expect(res.status).toBe(409);
    });
});

describe("GET /api/proyectos/:id/perfiles", () => {
    test("devuelve lista vacia si el proyecto no tiene perfiles", async () => {
        const { proyecto } = await escenario();

        const res = await request(app).get(`/api/proyectos/${proyecto.id}/perfiles`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("devuelve los perfiles del proyecto", async () => {
        const { hab, proyecto } = await escenario();
        await crearPerfil(proyecto.id, datosPerfil(hab, { nombre: "Frontend" }));
        await crearPerfil(proyecto.id, datosPerfil(hab, { nombre: "Backend" }));

        const res = await request(app).get(`/api/proyectos/${proyecto.id}/perfiles`);

        expect(res.status).toBe(200);
        expect(res.body.map((p) => p.nombre).sort()).toEqual(["Backend", "Frontend"]);
    });

    test("devuelve 404 si el proyecto no existe", async () => {
        const res = await request(app).get("/api/proyectos/no-existe/perfiles");

        expect(res.status).toBe(404);
    });
});

describe("GET /api/proyectos/:id/perfiles/:perfilId", () => {
    test("devuelve el perfil si existe", async () => {
        const { hab, proyecto } = await escenario();
        const perfil = (await crearPerfil(proyecto.id, datosPerfil(hab))).body;

        const res = await request(app).get(`/api/proyectos/${proyecto.id}/perfiles/${perfil.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(perfil.id);
        expect(res.body.nombre).toBe("Frontend");
    });

    test("devuelve 404 si el perfil no pertenece al proyecto", async () => {
        const { proyecto } = await escenario();

        const res = await request(app).get(`/api/proyectos/${proyecto.id}/perfiles/no-existe`);

        expect(res.status).toBe(404);
    });
});

describe("PUT /api/proyectos/:id/perfiles/:perfilId", () => {
    test("modifica los datos del perfil y persisten", async () => {
        const { hab, proyecto } = await escenario();
        const perfil = (await crearPerfil(proyecto.id, datosPerfil(hab))).body;

        const res = await request(app)
            .put(`/api/proyectos/${proyecto.id}/perfiles/${perfil.id}`)
            .send({ nombre: "Frontend Senior", cantidadHoras: 20 });

        expect(res.status).toBe(200);
        expect(res.body.nombre).toBe("Frontend Senior");
        expect(res.body.cantidadHoras).toBe(20);

        const releido = await request(app).get(`/api/proyectos/${proyecto.id}/perfiles/${perfil.id}`);
        expect(releido.body.nombre).toBe("Frontend Senior");
        expect(releido.body.cantidadHoras).toBe(20);
    });

    test("devuelve 404 si el perfil no existe", async () => {
        const { proyecto } = await escenario();

        const res = await request(app)
            .put(`/api/proyectos/${proyecto.id}/perfiles/no-existe`)
            .send({ nombre: "X" });

        expect(res.status).toBe(404);
    });

    test("devuelve 400 si se manda un campo que no existe", async () => {
        const { hab, proyecto } = await escenario();
        const perfil = (await crearPerfil(proyecto.id, datosPerfil(hab))).body;

        const res = await request(app)
            .put(`/api/proyectos/${proyecto.id}/perfiles/${perfil.id}`)
            .send({ campoInventado: "x" });

        expect(res.status).toBe(400);
    });
});

describe("DELETE /api/proyectos/:id/perfiles/:perfilId", () => {
    test("elimina el perfil del proyecto", async () => {
        const { hab, proyecto } = await escenario();
        const perfil = (await crearPerfil(proyecto.id, datosPerfil(hab))).body;

        const res = await request(app).delete(`/api/proyectos/${proyecto.id}/perfiles/${perfil.id}`);

        expect([200, 204]).toContain(res.status);

        const listado = await request(app).get(`/api/proyectos/${proyecto.id}/perfiles`);
        expect(listado.body).toEqual([]);
    });

    test("devuelve 404 si el perfil no existe", async () => {
        const { proyecto } = await escenario();

        const res = await request(app).delete(`/api/proyectos/${proyecto.id}/perfiles/no-existe`);

        expect(res.status).toBe(404);
    });
});
