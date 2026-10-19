import request from "supertest";
import { buildTestServer } from "./utils/buildTestServer.js";

const app = buildTestServer();

async function crearPersona(overrides = {}) {
    const res = await request(app).post("/api/personas-colaboradoras").send({
        nombreFantasia: "DevAna",
        ...overrides
    });
    return res;
}

describe("POST /api/personas-colaboradoras", () => {
    test("crea la persona con nombre de fantasia y devuelve 201", async () => {
        const res = await crearPersona();

        expect(res.status).toBe(201);
        expect(res.body.nombreFantasia).toBe("DevAna");
        expect(res.body.id).toBeDefined();
    });

    test("permite registrarse con nombre y apellido en vez de fantasia", async () => {
        const res = await crearPersona({ nombreFantasia: undefined, nombre: "Juan", apellido: "Perez" });

        expect(res.status).toBe(201);
        expect(res.body.nombre).toBe("Juan");
        expect(res.body.apellido).toBe("Perez");
    });

    test("devuelve 422 si no hay fantasia, ni nombre y apellido, ni cuentas", async () => {
        const res = await request(app).post("/api/personas-colaboradoras").send({ presentacion: "hola" });

        expect(res.status).toBe(422);
    });

    test("normaliza los pronombres sin duplicados ni vacios", async () => {
        const res = await crearPersona({ pronombres: ["elle", "elle", " ", "ella"] });

        expect(res.status).toBe(201);
        expect(res.body.pronombres).toEqual(["elle", "ella"]);
    });

    test("devuelve 400 si se manda un campo que no existe", async () => {
        const res = await crearPersona({ campoInventado: "algo" });

        expect(res.status).toBe(400);
    });
});

describe("GET /api/personas-colaboradoras", () => {
    test("devuelve una lista vacia si no hay personas", async () => {
        const res = await request(app).get("/api/personas-colaboradoras");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("devuelve las personas cargadas", async () => {
        await crearPersona({ nombreFantasia: "DevUno" });
        await crearPersona({ nombreFantasia: "DevDos" });

        const res = await request(app).get("/api/personas-colaboradoras");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
    });
});

describe("GET /api/personas-colaboradoras/:id", () => {
    test("devuelve 200 con la persona si existe", async () => {
        const creada = await crearPersona();

        const res = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(creada.body.id);
    });

    test("devuelve 404 si no existe", async () => {
        const res = await request(app).get("/api/personas-colaboradoras/no-existe");

        expect(res.status).toBe(404);
    });
});

describe("PUT /api/personas-colaboradoras/:id", () => {
    test("actualiza la presentacion y los pronombres", async () => {
        const creada = await crearPersona();

        const res = await request(app)
            .put(`/api/personas-colaboradoras/${creada.body.id}`)
            .send({ presentacion: "Backend dev", pronombres: ["elle"] });

        expect(res.status).toBe(200);
        expect(res.body.presentacion).toBe("Backend dev");
        expect(res.body.pronombres).toEqual(["elle"]);
    });

    test("devuelve 404 si la persona no existe", async () => {
        const res = await request(app)
            .put("/api/personas-colaboradoras/no-existe")
            .send({ presentacion: "x" });

        expect(res.status).toBe(404);
    });
});

describe("DELETE /api/personas-colaboradoras/:id", () => {
    test("elimina la persona y devuelve 204", async () => {
        const creada = await crearPersona();

        const res = await request(app).delete(`/api/personas-colaboradoras/${creada.body.id}`);

        expect(res.status).toBe(204);

        const buscada = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}`);
        expect(buscada.status).toBe(404);
    });

    test("devuelve 404 si la persona no existe", async () => {
        const res = await request(app).delete("/api/personas-colaboradoras/no-existe");

        expect(res.status).toBe(404);
    });
});

describe("POST /api/personas-colaboradoras/:id/habilidades", () => {
    test("agrega la habilidad a la persona", async () => {
        const creada = await crearPersona();

        const res = await request(app)
            .post(`/api/personas-colaboradoras/${creada.body.id}/habilidades`)
            .send({ codigo: "react", titulo: "React", descripcion: "Frontend" });

        expect(res.status).toBe(200);
        expect(res.body.habilidades.map((h) => h.codigo)).toContain("react");
    });

    test("la habilidad queda persistida", async () => {
        const creada = await crearPersona();
        await request(app)
            .post(`/api/personas-colaboradoras/${creada.body.id}/habilidades`)
            .send({ codigo: "react", titulo: "React" });

        const res = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}`);
        expect(res.body.habilidades.map((h) => h.codigo)).toContain("react");
    });

    test("devuelve 422 si ya tiene una habilidad con ese codigo", async () => {
        const creada = await crearPersona();
        const habilidad = { codigo: "react", titulo: "React" };
        await request(app).post(`/api/personas-colaboradoras/${creada.body.id}/habilidades`).send(habilidad);

        const res = await request(app)
            .post(`/api/personas-colaboradoras/${creada.body.id}/habilidades`)
            .send(habilidad);

        expect([409, 422]).toContain(res.status);
    });
});

describe("medios de contacto", () => {
    const email = { tipo: "EMAIL", valor: "ana@ejemplo.com" };

    test("NO se exponen en el detalle publico de la persona", async () => {
        // El enunciado pide que queden registrados internamente pero que no se
        // muestren de forma publica en la plataforma.
        const creada = await crearPersona({ mediosDeContacto: [email] });

        const res = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}`);

        expect(res.status).toBe(200);
        expect(res.body.mediosDeContacto).toBeUndefined();
    });

    test("tampoco se exponen en el listado", async () => {
        await crearPersona({ mediosDeContacto: [email] });

        const res = await request(app).get("/api/personas-colaboradoras");

        expect(res.body[0].mediosDeContacto).toBeUndefined();
    });

    test("se consultan por su endpoint interno", async () => {
        const creada = await crearPersona({ mediosDeContacto: [email] });

        const res = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual([email]);
    });

    test("se agrega uno nuevo y queda persistido", async () => {
        const creada = await crearPersona();

        const res = await request(app)
            .post(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`)
            .send(email);

        expect(res.status).toBe(201);

        const medios = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`);
        expect(medios.body).toEqual([email]);
    });

    test("se actualiza el valor de un medio existente", async () => {
        const creada = await crearPersona({ mediosDeContacto: [email] });

        const res = await request(app)
            .patch(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`)
            .send({ tipo: "EMAIL", valor: "nuevo@ejemplo.com" });

        expect(res.status).toBe(200);

        const medios = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`);
        expect(medios.body).toEqual([{ tipo: "EMAIL", valor: "nuevo@ejemplo.com" }]);
    });

    test("se elimina por tipo y devuelve 204", async () => {
        const creada = await crearPersona({ mediosDeContacto: [email] });

        const res = await request(app)
            .delete(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto/EMAIL`);

        expect(res.status).toBe(204);

        const medios = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`);
        expect(medios.body).toEqual([]);
    });

    test("devuelve 404 al eliminar un tipo que la persona no tiene", async () => {
        const creada = await crearPersona({ mediosDeContacto: [email] });

        const res = await request(app)
            .delete(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto/SMS`);

        expect(res.status).toBe(404);
    });

    test("agregar una habilidad no borra los medios de contacto", async () => {
        // Los services reconstruian la persona desde toJSON(), que omite los
        // medios a proposito. Al volver a guardarla, se borraban de la base.
        const creada = await crearPersona({ mediosDeContacto: [email] });

        await request(app)
            .post(`/api/personas-colaboradoras/${creada.body.id}/habilidades`)
            .send({ codigo: "react", titulo: "React" });

        const medios = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`);
        expect(medios.body).toEqual([email]);
    });

    test("actualizar el perfil no borra los medios de contacto", async () => {
        const creada = await crearPersona({ mediosDeContacto: [email] });

        await request(app)
            .put(`/api/personas-colaboradoras/${creada.body.id}`)
            .send({ presentacion: "Backend dev" });

        const medios = await request(app).get(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`);
        expect(medios.body).toEqual([email]);
    });

    test("devuelve 422 si el tipo de medio es invalido", async () => {
        const creada = await crearPersona();

        const res = await request(app)
            .post(`/api/personas-colaboradoras/${creada.body.id}/medios-contacto`)
            .send({ tipo: "FAX", valor: "123" });

        expect([400, 422]).toContain(res.status);
    });
});
