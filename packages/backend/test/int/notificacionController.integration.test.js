import request from "supertest";
import { buildTestServer } from "../utils/buildTestServer.js";

const app = buildTestServer();

// HU10: las organizaciones contactan colaboradoras acordes a un perfil, pero
// solo si la persona acepto ser contactada por la mensajeria interna.

async function escenario({ mensajesInternos = true, mediosDeContacto = [] } = {}) {
    const hab = (await request(app).post("/api/habilidades").send({ titulo: "React" })).body;
    const colectivo = (await request(app).post("/api/colectivos")
        .send({ nombre: "ONG", descripcion: "d", tipo: "ONG" })).body;
    const proyecto = (await request(app).post("/api/proyectos").send({
        titulo: "Portal", descripcion: "d",
        unidadCompromiso: "HORAS_TOTALES", cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"],
        colectivoId: colectivo.id, habilidadesRequeridasCodigos: [hab.codigo]
    })).body;
    const perfil = (await request(app).post(`/api/proyectos/${proyecto.id}/perfiles`).send({
        nombre: "Frontend", descripcion: "Perfil de frontend",
        habilidadesRequeridasCodigos: [hab.codigo],
        unidadCompromiso: "HORAS_TOTALES", cantidadHoras: 5,
        modalidadesColaboracion: ["GRATUITA"]
    })).body;
    const persona = (await request(app).post("/api/personas-colaboradoras").send({
        nombreFantasia: "DevAna",
        habilidades: [{ codigo: hab.codigo, titulo: hab.titulo }],
        mensajesInternos,
        mediosDeContacto
    })).body;
    return { colectivo, perfil, persona };
}

const enviar = (datos) => request(app).post("/api/notificaciones").send(datos);

function mensaje({ colectivo, perfil, persona }, overrides = {}) {
    return {
        colectivoId: colectivo.id,
        personaColaboradoraId: persona.id,
        perfilId: perfil.id,
        contenido: "Nos interesaria contar con vos en el proyecto",
        replicarMediosExternos: false,
        ...overrides
    };
}

describe("POST /api/notificaciones", () => {
    test("envia la notificacion interna y devuelve 201", async () => {
        const ctx = await escenario();

        const res = await enviar(mensaje(ctx));

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();
        expect(res.body.contenido).toBe("Nos interesaria contar con vos en el proyecto");
        expect(res.body.leida).toBe(false);
    });

    test("devuelve 422 si la persona no acepto mensajes internos", async () => {
        const ctx = await escenario({ mensajesInternos: false });

        const res = await enviar(mensaje(ctx));

        expect(res.status).toBe(422);
        expect(res.body.message).toMatch(/no ha aceptado/i);
    });

    test("devuelve 400 si falta el contenido", async () => {
        const ctx = await escenario();

        const res = await enviar(mensaje(ctx, { contenido: "" }));

        expect([400, 422]).toContain(res.status);
    });

    test("devuelve 404 si el colectivo no existe", async () => {
        const ctx = await escenario();

        const res = await enviar(mensaje(ctx, { colectivoId: "no-existe" }));

        expect(res.status).toBe(404);
    });

    test("devuelve 404 si la persona colaboradora no existe", async () => {
        const ctx = await escenario();

        const res = await enviar(mensaje(ctx, { personaColaboradoraId: "no-existe" }));

        expect(res.status).toBe(404);
    });

    test("devuelve 404 si el perfil no existe", async () => {
        const ctx = await escenario();

        const res = await enviar(mensaje(ctx, { perfilId: "no-existe" }));

        expect(res.status).toBe(404);
    });

    test("devuelve 400 si se manda un campo que no existe", async () => {
        const ctx = await escenario();

        const res = await enviar(mensaje(ctx, { campoInventado: "x" }));

        expect(res.status).toBe(400);
    });
});

describe("GET /api/notificaciones", () => {
    test("devuelve lista vacia si no hay notificaciones", async () => {
        const res = await request(app).get("/api/notificaciones");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("devuelve las notificaciones enviadas", async () => {
        const ctx = await escenario();
        await enviar(mensaje(ctx));

        const res = await request(app).get("/api/notificaciones");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    test("filtra por destinatario", async () => {
        const ctx = await escenario();
        await enviar(mensaje(ctx));

        const propias = await request(app).get(`/api/notificaciones?destinatarioId=${ctx.persona.id}`);
        const ajenas = await request(app).get("/api/notificaciones?destinatarioId=otro-id");

        expect(propias.body).toHaveLength(1);
        expect(ajenas.body).toEqual([]);
    });

    test("filtra las no leidas", async () => {
        const ctx = await escenario();
        const creada = (await enviar(mensaje(ctx))).body;

        const antes = await request(app).get("/api/notificaciones?soloNoLeidas=true");
        expect(antes.body).toHaveLength(1);

        await request(app).patch(`/api/notificaciones/${creada.id}`).send({ leida: true });

        const despues = await request(app).get("/api/notificaciones?soloNoLeidas=true");
        expect(despues.body).toEqual([]);
    });
});

describe("GET /api/notificaciones/:id", () => {
    test("devuelve la notificacion si existe", async () => {
        const ctx = await escenario();
        const creada = (await enviar(mensaje(ctx))).body;

        const res = await request(app).get(`/api/notificaciones/${creada.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(creada.id);
    });

    test("devuelve 404 si no existe", async () => {
        const res = await request(app).get("/api/notificaciones/no-existe");

        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/notificaciones/:id", () => {
    test("marca la notificacion como leida y persiste", async () => {
        const ctx = await escenario();
        const creada = (await enviar(mensaje(ctx))).body;

        const res = await request(app).patch(`/api/notificaciones/${creada.id}`).send({ leida: true });

        expect(res.status).toBe(200);

        const releida = await request(app).get(`/api/notificaciones/${creada.id}`);
        expect(releida.body.leida).toBe(true);
    });

    test("devuelve 400 si leida no es booleano", async () => {
        const ctx = await escenario();
        const creada = (await enviar(mensaje(ctx))).body;

        const res = await request(app).patch(`/api/notificaciones/${creada.id}`).send({ leida: "si" });

        expect([400, 422]).toContain(res.status);
    });

    test("devuelve 404 si la notificacion no existe", async () => {
        const res = await request(app).patch("/api/notificaciones/no-existe").send({ leida: true });

        expect(res.status).toBe(404);
    });
});
