import request from "supertest";
import { buildTestServer } from "./utils/buildTestServer.js";

const app = buildTestServer();

async function crearColectivo(nombre = "ONG Test") {
    const res = await request(app)
        .post("/api/colectivos")
        .send({ nombre, descripcion: "desc", tipo: "ONG" });
    return res.body;
}

async function crearHabilidad(titulo = "Desarrollo Web React") {
    const res = await request(app).post("/api/habilidades").send({ titulo });
    return res.body;
}

async function crearProyecto({ titulo = "Portal Comunitario", colectivo, habilidad } = {}) {
    const col = colectivo ?? (await crearColectivo());
    const hab = habilidad ?? (await crearHabilidad());
    const res = await request(app).post("/api/proyectos").send({
        titulo,
        descripcion: "desc",
        unidadCompromiso: "HORAS_TOTALES",
        cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"],
        colectivoId: col.id,
        habilidadesRequeridasCodigos: [hab.codigo]
    });
    return { proyecto: res.body, colectivo: col, habilidad: hab, res };
}

describe("POST /api/proyectos", () => {
    test("crea el proyecto y devuelve 201", async () => {
        const { res } = await crearProyecto();

        expect(res.status).toBe(201);
        expect(res.body.titulo).toBe("Portal Comunitario");
        expect(res.body.estado).toBe("PUBLICADO");
        expect(res.body.id).toBeDefined();
    });

    test("devuelve 400 si el colectivoId no viene", async () => {
        const hab = await crearHabilidad();
        const res = await request(app).post("/api/proyectos").send({
            titulo: "Sin colectivo",
            descripcion: "desc",
            unidadCompromiso: "HORAS_TOTALES",
            cantidadHoras: 10,
            modalidadesColaboracion: ["GRATUITA"],
            habilidadesRequeridasCodigos: [hab.codigo]
        });

        expect(res.status).toBe(400);
    });

    test("devuelve 422 si el colectivoId no existe", async () => {
        const hab = await crearHabilidad();
        const res = await request(app).post("/api/proyectos").send({
            titulo: "Colectivo fantasma",
            descripcion: "desc",
            unidadCompromiso: "HORAS_TOTALES",
            cantidadHoras: 10,
            modalidadesColaboracion: ["GRATUITA"],
            colectivoId: "no-existe",
            habilidadesRequeridasCodigos: [hab.codigo]
        });

        expect([404, 422]).toContain(res.status);
    });
});

describe("GET /api/proyectos/:id", () => {
    test("devuelve 404 si no existe", async () => {
        const res = await request(app).get("/api/proyectos/no-existe");

        expect(res.status).toBe(404);
    });

    test("cantidadHoras vuelve como numero, no como string", async () => {
        // El schema declaraba cantidadHoras como String y Mongo lo casteaba,
        // asi que un 10 se releia como "10".
        const { proyecto } = await crearProyecto();

        const res = await request(app).get(`/api/proyectos/${proyecto.id}`);

        expect(res.status).toBe(200);
        expect(res.body.cantidadHoras).toBe(10);
        expect(typeof res.body.cantidadHoras).toBe("number");
    });

    test("el colectivo viene como objeto, segun documenta docs/API.md", async () => {
        const { proyecto, colectivo } = await crearProyecto();

        const res = await request(app).get(`/api/proyectos/${proyecto.id}`);

        expect(res.body.colectivo).toMatchObject({
            id: colectivo.id,
            nombre: colectivo.nombre
        });
    });
});

describe("POST /api/proyectos/:id/perfiles", () => {
    test("crea el perfil y devuelve 201", async () => {
        // Regresion: devolvia 500 porque el repositorio entregaba documentos
        // crudos de Mongo y el service llamaba a proyecto.agregarPerfil().
        const { proyecto, habilidad } = await crearProyecto();

        const res = await request(app)
            .post(`/api/proyectos/${proyecto.id}/perfiles`)
            .send({
                nombre: "Frontend",
                descripcion: "Perfil de frontend",
                habilidadesRequeridasCodigos: [habilidad.codigo],
                unidadCompromiso: "HORAS_TOTALES",
                cantidadHoras: 5,
                modalidadesColaboracion: ["GRATUITA"]
            });

        expect(res.status).toBe(201);
        expect(res.body.nombre).toBe("Frontend");
        expect(res.body.id).toBeDefined();
    });

    test("el perfil creado queda asociado al proyecto", async () => {
        const { proyecto, habilidad } = await crearProyecto();

        await request(app).post(`/api/proyectos/${proyecto.id}/perfiles`).send({
            nombre: "Frontend",
            descripcion: "Perfil de frontend",
            habilidadesRequeridasCodigos: [habilidad.codigo],
            unidadCompromiso: "HORAS_TOTALES",
            cantidadHoras: 5,
            modalidadesColaboracion: ["GRATUITA"]
        });

        const perfiles = await request(app).get(`/api/proyectos/${proyecto.id}/perfiles`);
        expect(perfiles.status).toBe(200);
        expect(perfiles.body).toHaveLength(1);

        const detalle = await request(app).get(`/api/proyectos/${proyecto.id}`);
        expect(detalle.body.perfiles).toHaveLength(1);
    });

    test("devuelve 404 si el proyecto no existe", async () => {
        const habilidad = await crearHabilidad();

        const res = await request(app)
            .post("/api/proyectos/no-existe/perfiles")
            .send({
                nombre: "Frontend",
                descripcion: "Perfil de frontend",
                habilidadesRequeridasCodigos: [habilidad.codigo],
                unidadCompromiso: "HORAS_TOTALES",
                cantidadHoras: 5,
                modalidadesColaboracion: ["GRATUITA"]
            });

        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/proyectos/:id/cerrar", () => {
    test("cierra el proyecto y el estado persiste al releerlo", async () => {
        // Regresion: el constructor de Proyecto fuerza estado PUBLICADO, asi
        // que sin restaurarlo al reconstruir, un proyecto cerrado "revivia".
        const { proyecto } = await crearProyecto();

        const cierre = await request(app).patch(`/api/proyectos/${proyecto.id}/cerrar`).send({});
        expect(cierre.status).toBe(200);

        const releido = await request(app).get(`/api/proyectos/${proyecto.id}`);
        expect(releido.body.estado).toBe("CERRADO");
    });
});

describe("hitos de un proyecto", () => {
    async function registrarHito(proyectoId, porcentajeConcrecion, descripcion) {
        return request(app)
            .post(`/api/proyectos/${proyectoId}/hitos`)
            .send({ porcentajeConcrecion, descripcion });
    }

    test("el porcentaje de concrecion sobrevive al guardado", async () => {
        // Regresion: Hito guarda el porcentaje en un campo privado
        // (#porcentajeConcrecion) expuesto por un getter del prototipo. Al
        // pasar la instancia cruda a Mongoose, que castea leyendo propiedades
        // propias enumerables, el porcentaje se descartaba en silencio.
        const { proyecto } = await crearProyecto();

        const res = await registrarHito(proyecto.id, 50, "Primer hito");
        expect(res.status).toBe(201);

        const hitos = await request(app).get(`/api/proyectos/${proyecto.id}/hitos`);
        expect(hitos.status).toBe(200);
        expect(hitos.body).toHaveLength(1);
        expect(hitos.body[0].porcentajeConcrecion).toBe(50);
    });

    test("se puede registrar un segundo hito con mayor porcentaje", async () => {
        // Sin el porcentaje persistido, validarHito comparaba contra undefined
        // y era imposible registrar un segundo hito.
        const { proyecto } = await crearProyecto();

        await registrarHito(proyecto.id, 50, "Primer hito");
        const segundo = await registrarHito(proyecto.id, 70, "Segundo hito");

        expect(segundo.status).toBe(201);

        const hitos = await request(app).get(`/api/proyectos/${proyecto.id}/hitos`);
        expect(hitos.body.map((h) => h.porcentajeConcrecion)).toEqual([50, 70]);
    });

    test("rechaza un hito con porcentaje menor al anterior", async () => {
        const { proyecto } = await crearProyecto();

        await registrarHito(proyecto.id, 70, "Primer hito");
        const res = await registrarHito(proyecto.id, 50, "Retroceso");

        expect(res.status).toBe(422);
    });
});

describe("POST /api/proyectos/:id/colaboraciones", () => {
    async function crearPersonaCon(habilidad, nombreFantasia) {
        const res = await request(app).post("/api/personas-colaboradoras").send({
            nombreFantasia,
            habilidades: [{ codigo: habilidad.codigo, titulo: habilidad.titulo }]
        });
        return res.body;
    }

    test("la colaboracion queda persistida", async () => {
        // Regresion: el controller no hacia await del service, asi que
        // respondia 201 con una Promise serializada ({}) antes de guardar.
        // Ademas el schema no declaraba id ni esAnonima y, en strict mode,
        // Mongoose los descartaba en silencio.
        const { proyecto, habilidad } = await crearProyecto();
        const persona = await crearPersonaCon(habilidad, "DevAna");

        const res = await request(app)
            .post(`/api/proyectos/${proyecto.id}/colaboraciones`)
            .send({ personaColaboradoraId: persona.id });

        expect(res.status).toBe(201);
        expect(res.body.id).toBeDefined();

        const detalle = await request(app).get(`/api/proyectos/${proyecto.id}`);
        expect(detalle.body.colaboraciones).toHaveLength(1);
        expect(detalle.body.colaboraciones[0].personaColaboradora.id).toBe(persona.id);
    });

    test("una contribucion anonima no revela quien la realizo", async () => {
        // El enunciado pide que figure en la plataforma pero sin indicar quien
        // la hizo. Proyecto.toJSON() armaba el objeto ignorando esAnonima.
        const { proyecto, habilidad } = await crearProyecto();
        const persona = await crearPersonaCon(habilidad, "DevAnonimo");

        await request(app)
            .post(`/api/proyectos/${proyecto.id}/colaboraciones`)
            .send({ personaColaboradoraId: persona.id, esAnonima: true });

        const detalle = await request(app).get(`/api/proyectos/${proyecto.id}`);
        expect(detalle.body.colaboraciones).toHaveLength(1);
        expect(detalle.body.colaboraciones[0].esAnonima).toBe(true);
        expect(detalle.body.colaboraciones[0].personaColaboradora).toBeNull();
    });

    test("devuelve 422 si la persona no tiene ninguna habilidad requerida", async () => {
        // El error ocurre dentro del service. Sin el await, el 201 se enviaba
        // antes y este caso quedaba sin cubrir.
        const { proyecto } = await crearProyecto();
        const otra = await crearHabilidad("Cobol");
        const persona = await crearPersonaCon(otra, "DevCobol");

        const res = await request(app)
            .post(`/api/proyectos/${proyecto.id}/colaboraciones`)
            .send({ personaColaboradoraId: persona.id });

        expect(res.status).toBe(422);
    });

    test("devuelve 404 si la persona no existe", async () => {
        const { proyecto } = await crearProyecto();

        const res = await request(app)
            .post(`/api/proyectos/${proyecto.id}/colaboraciones`)
            .send({ personaColaboradoraId: "no-existe" });

        expect(res.status).toBe(404);
    });

    test("no se puede anotar en un proyecto cerrado", async () => {
        const { proyecto, habilidad } = await crearProyecto();
        const persona = await crearPersonaCon(habilidad, "DevTarde");
        await request(app).patch(`/api/proyectos/${proyecto.id}/cerrar`).send({});

        const res = await request(app)
            .post(`/api/proyectos/${proyecto.id}/colaboraciones`)
            .send({ personaColaboradoraId: persona.id });

        expect(res.status).toBe(409);
    });
});
