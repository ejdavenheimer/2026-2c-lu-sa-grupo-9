import request from "supertest";
import { buildTestServer } from "./utils/buildTestServer.js";

const app = buildTestServer();

// HU08: una organizacion busca colaboradores acordes a un perfil del proyecto.
// HU09: una persona colaboradora busca proyectos que encajen con sus habilidades.

async function crearHabilidad(titulo) {
    const res = await request(app).post("/api/habilidades").send({ titulo });
    return res.body;
}

async function crearColectivo(nombre = "Colectivo Comunitario") {
    const res = await request(app)
        .post("/api/colectivos")
        .send({ nombre, descripcion: "desc", tipo: "ONG" });
    return res.body;
}

async function crearProyecto(titulo, colectivo, habilidad) {
    const res = await request(app).post("/api/proyectos").send({
        titulo,
        descripcion: "desc",
        unidadCompromiso: "HORAS_TOTALES",
        cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"],
        colectivoId: colectivo.id,
        habilidadesRequeridasCodigos: [habilidad.codigo]
    });
    return res.body;
}

async function crearPerfil(proyectoId, nombre, requeridas, opcionales = []) {
    const res = await request(app).post(`/api/proyectos/${proyectoId}/perfiles`).send({
        nombre,
        descripcion: nombre,
        habilidadesRequeridasCodigos: requeridas.map((h) => h.codigo),
        habilidadesOpcionalesCodigos: opcionales.map((h) => h.codigo),
        unidadCompromiso: "HORAS_TOTALES",
        cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"]
    });
    return res.body;
}

async function crearPersona(nombreFantasia, habilidades) {
    const res = await request(app).post("/api/personas-colaboradoras").send({
        nombreFantasia,
        habilidades: habilidades.map((h) => ({ codigo: h.codigo, titulo: h.titulo }))
    });
    return res.body;
}

describe("GET /api/proyectos/:id/perfiles/:perfilId/colaboradores-compatibles (HU08)", () => {
    test("devuelve a quienes cumplen todas las habilidades requeridas", async () => {
        const react = await crearHabilidad("React");
        const node = await crearHabilidad("Node");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        const perfil = await crearPerfil(proyecto.id, "Fullstack", [react, node]);

        const completa = await crearPersona("DevFull", [react, node]);
        await crearPersona("DevParcial", [react]);

        const res = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles`
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].personaColaboradora.id).toBe(completa.id);
    });

    test("con estricto=false incluye a quien cumple alguna requerida", async () => {
        const react = await crearHabilidad("React");
        const node = await crearHabilidad("Node");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        const perfil = await crearPerfil(proyecto.id, "Fullstack", [react, node]);

        await crearPersona("DevFull", [react, node]);
        await crearPersona("DevParcial", [react]);

        const res = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles?estricto=false`
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    test("no expone el historial de colaboraciones del candidato", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        const perfil = await crearPerfil(proyecto.id, "Frontend", [react]);
        await crearPersona("DevAna", [react]);

        const res = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles`
        );

        expect(res.body[0].personaColaboradora.colaboraciones).toBeUndefined();
    });

    test("devuelve lista vacia si no hay candidatos, no un 404", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        const perfil = await crearPerfil(proyecto.id, "Frontend", [react]);

        const res = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles`
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("respeta el limite de resultados", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        const perfil = await crearPerfil(proyecto.id, "Frontend", [react]);
        await crearPersona("Dev1", [react]);
        await crearPersona("Dev2", [react]);
        await crearPersona("Dev3", [react]);

        const res = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles?limite=2`
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });

    test("devuelve 404 si el perfil no pertenece al proyecto", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);

        const res = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/perfil-inexistente/colaboradores-compatibles`
        );

        expect(res.status).toBe(404);
    });

    test("devuelve 400 si el query string es invalido", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        const perfil = await crearPerfil(proyecto.id, "Frontend", [react]);

        const res = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles?estricto=quizas`
        );

        expect([400, 422]).toContain(res.status);
    });
});

describe("GET /api/personas-colaboradoras/:id/proyectos-compatibles (HU09)", () => {
    test("devuelve el par proyecto y perfil que matcheo", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        const perfil = await crearPerfil(proyecto.id, "Frontend", [react]);
        const persona = await crearPersona("DevAna", [react]);

        const res = await request(app).get(
            `/api/personas-colaboradoras/${persona.id}/proyectos-compatibles`
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].proyecto.id).toBe(proyecto.id);
        expect(res.body[0].perfil.id).toBe(perfil.id);
        expect(res.body[0].perfil.nombre).toBe("Frontend");
    });

    test("un proyecto con dos perfiles compatibles devuelve dos propuestas", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        await crearPerfil(proyecto.id, "Frontend", [react]);
        await crearPerfil(proyecto.id, "Mobile", [react]);
        const persona = await crearPersona("DevAna", [react]);

        const res = await request(app).get(
            `/api/personas-colaboradoras/${persona.id}/proyectos-compatibles`
        );

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body.map((r) => r.perfil.nombre).sort()).toEqual(["Frontend", "Mobile"]);
    });

    test("excluye los proyectos cerrados: no tiene sentido ofrecerlos", async () => {
        const react = await crearHabilidad("React");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Portal", colectivo, react);
        await crearPerfil(proyecto.id, "Frontend", [react]);
        const persona = await crearPersona("DevAna", [react]);

        await request(app).patch(`/api/proyectos/${proyecto.id}/cerrar`).send({});

        const res = await request(app).get(
            `/api/personas-colaboradoras/${persona.id}/proyectos-compatibles`
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("no devuelve proyectos cuyos perfiles piden otras habilidades", async () => {
        const react = await crearHabilidad("React");
        const cobol = await crearHabilidad("Cobol");
        const colectivo = await crearColectivo();
        const proyecto = await crearProyecto("Legado", colectivo, cobol);
        await crearPerfil(proyecto.id, "Mainframe", [cobol]);
        const persona = await crearPersona("DevAna", [react]);

        const res = await request(app).get(
            `/api/personas-colaboradoras/${persona.id}/proyectos-compatibles`
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("devuelve 404 si la persona no existe", async () => {
        const res = await request(app).get(
            "/api/personas-colaboradoras/no-existe/proyectos-compatibles"
        );

        expect(res.status).toBe(404);
    });
});
