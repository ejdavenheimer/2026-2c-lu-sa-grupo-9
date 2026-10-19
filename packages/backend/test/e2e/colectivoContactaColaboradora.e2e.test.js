import { jest } from "@jest/globals";

/**
 * HU08 -> HU10 -> HU11, como un unico recorrido.
 *
 * El valor de este test frente a los de integracion es que ENCADENA: el id con
 * el que se contacta a la persona sale de la respuesta de la busqueda, no de un
 * dato que arma el test. Si el contrato entre un paso y el siguiente no encaja,
 * los tests por endpoint siguen en verde y el flujo real se corta igual.
 *
 * nodemailer y twilio se mockean antes de importar la app: NotificadorSender
 * instancia las estrategias en su constructor y la ruta lo arma al importarse.
 * Asi el recorrido es deterministico y no manda mensajes de verdad.
 */

const enviarMail = jest.fn(async () => ({ messageId: "msg-1" }));
const crearMensajeTwilio = jest.fn(async () => ({ sid: "SM1" }));

jest.unstable_mockModule("nodemailer", () => ({
    default: { createTransport: () => ({ sendMail: enviarMail }) }
}));

jest.unstable_mockModule("twilio", () => ({
    default: () => ({ messages: { create: crearMensajeTwilio } })
}));

const { default: request } = await import("supertest");
const { buildTestServer } = await import("../utils/buildTestServer.js");

const app = buildTestServer();

beforeEach(() => {
    enviarMail.mockClear();
    crearMensajeTwilio.mockClear();
});

async function unColectivoConUnProyectoYUnPerfil() {
    const react = (await request(app).post("/api/habilidades").send({ titulo: "React" })).body;
    const node = (await request(app).post("/api/habilidades").send({ titulo: "Node" })).body;

    const colectivo = (await request(app).post("/api/colectivos").send({
        nombre: "Fundacion Vida Barrial",
        descripcion: "Trabaja con comedores del conurbano",
        tipo: "Fundacion"
    })).body;

    const proyecto = (await request(app).post("/api/proyectos").send({
        titulo: "Portal Comunitario",
        descripcion: "Plataforma de difusion para el barrio",
        unidadCompromiso: "HORAS_SEMANALES",
        cantidadHoras: 10,
        modalidadesColaboracion: ["GRATUITA"],
        colectivoId: colectivo.id,
        habilidadesRequeridasCodigos: [react.codigo]
    })).body;

    const perfil = (await request(app).post(`/api/proyectos/${proyecto.id}/perfiles`).send({
        nombre: "Frontend",
        descripcion: "Alguien que construya la SPA",
        habilidadesRequeridasCodigos: [react.codigo],
        unidadCompromiso: "HORAS_SEMANALES",
        cantidadHoras: 5,
        modalidadesColaboracion: ["GRATUITA"]
    })).body;

    return { react, node, colectivo, proyecto, perfil };
}

const crearColaboradora = (datos) =>
    request(app).post("/api/personas-colaboradoras").send(datos).then((r) => r.body);

describe("Un colectivo busca una colaboradora y la contacta", () => {
    test("recorrido completo: busca (HU08), contacta (HU10) y se replica por sus medios (HU11)", async () => {
        const { react, colectivo, proyecto, perfil } = await unColectivoConUnProyectoYUnPerfil();

        // Hay dos personas: una encaja con el perfil y acepta ser contactada,
        // la otra no tiene la habilidad.
        const ana = await crearColaboradora({
            nombreFantasia: "Ana Dev",
            habilidades: [{ codigo: react.codigo, titulo: react.titulo }],
            mensajesInternos: true,
            mediosDeContacto: [
                { tipo: "EMAIL", valor: "ana@ejemplo.com" },
                { tipo: "SMS", valor: "+5491100000000" }
            ]
        });
        await crearColaboradora({ nombreFantasia: "Beto Disenador" });

        // HU08: el colectivo busca candidatos para su perfil.
        const busqueda = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles`
        );

        expect(busqueda.status).toBe(200);
        expect(busqueda.body).toHaveLength(1);

        // El id sale de la busqueda. Este es el enganche que los tests por
        // endpoint no ejercitan.
        const candidata = busqueda.body[0].personaColaboradora;
        expect(candidata.id).toBe(ana.id);

        // HU10: contacta a quien encontro.
        const envio = await request(app).post("/api/notificaciones").send({
            colectivoId: colectivo.id,
            personaColaboradoraId: candidata.id,
            perfilId: perfil.id,
            contenido: "Nos encantaria que te sumes al Portal Comunitario"
        });

        expect(envio.status).toBe(201);
        expect(envio.body.leida).toBe(false);

        // HU11: la notificacion se replico por los medios registrados.
        expect(enviarMail).toHaveBeenCalledTimes(1);
        expect(enviarMail.mock.calls[0][0].to).toBe("ana@ejemplo.com");
        expect(crearMensajeTwilio).toHaveBeenCalledTimes(1);
        expect(crearMensajeTwilio.mock.calls[0][0].to).toBe("+5491100000000");

        // La persona ve el mensaje en su bandeja interna.
        const bandeja = await request(app).get(`/api/notificaciones?destinatarioId=${candidata.id}`);
        expect(bandeja.status).toBe(200);
        expect(bandeja.body).toHaveLength(1);
        expect(bandeja.body[0].contenido).toBe("Nos encantaria que te sumes al Portal Comunitario");

        // Y queda registro de por donde se replico.
        expect(bandeja.body[0].mediosExternosUtilizados.map((m) => m.tipo).sort())
            .toEqual(["EMAIL", "SMS"]);

        // La lee, y el estado persiste.
        await request(app).patch(`/api/notificaciones/${envio.body.id}`).send({ leida: true });

        const sinLeer = await request(app).get(
            `/api/notificaciones?destinatarioId=${candidata.id}&soloNoLeidas=true`
        );
        expect(sinLeer.body).toEqual([]);
    });

    test("si la persona no acepto mensajes internos, no se la contacta ni se replica (HU06)", async () => {
        const { react, colectivo, proyecto, perfil } = await unColectivoConUnProyectoYUnPerfil();

        const reservada = await crearColaboradora({
            nombreFantasia: "Cris Reservada",
            habilidades: [{ codigo: react.codigo, titulo: react.titulo }],
            mensajesInternos: false,
            mediosDeContacto: [{ tipo: "EMAIL", valor: "cris@ejemplo.com" }]
        });

        // Aparece en la busqueda: es compatible con el perfil.
        const busqueda = await request(app).get(
            `/api/proyectos/${proyecto.id}/perfiles/${perfil.id}/colaboradores-compatibles`
        );
        expect(busqueda.body.map((r) => r.personaColaboradora.id)).toContain(reservada.id);

        // Pero no se la puede contactar.
        const envio = await request(app).post("/api/notificaciones").send({
            colectivoId: colectivo.id,
            personaColaboradoraId: reservada.id,
            perfilId: perfil.id,
            contenido: "Hola"
        });

        expect(envio.status).toBe(422);
        expect(enviarMail).not.toHaveBeenCalled();

        const bandeja = await request(app).get(`/api/notificaciones?destinatarioId=${reservada.id}`);
        expect(bandeja.body).toEqual([]);
    });

    test("si cambia de opinion y habilita los mensajes, pasa a ser contactable (HU06)", async () => {
        const { react, colectivo, proyecto, perfil } = await unColectivoConUnProyectoYUnPerfil();

        const dani = await crearColaboradora({
            nombreFantasia: "Dani",
            habilidades: [{ codigo: react.codigo, titulo: react.titulo }],
            mensajesInternos: false
        });

        const mensaje = {
            colectivoId: colectivo.id,
            personaColaboradoraId: dani.id,
            perfilId: perfil.id,
            contenido: "Te interesa?"
        };

        expect((await request(app).post("/api/notificaciones").send(mensaje)).status).toBe(422);

        // Habilita la mensajeria interna desde su perfil.
        const actualizacion = await request(app)
            .put(`/api/personas-colaboradoras/${dani.id}`)
            .send({ mensajesInternos: true });
        expect(actualizacion.status).toBe(200);

        expect((await request(app).post("/api/notificaciones").send(mensaje)).status).toBe(201);
    });

    test("sin medios de contacto registrados, el mensaje interno llega igual (HU11)", async () => {
        const { react, colectivo, proyecto, perfil } = await unColectivoConUnProyectoYUnPerfil();

        const eva = await crearColaboradora({
            nombreFantasia: "Eva",
            habilidades: [{ codigo: react.codigo, titulo: react.titulo }],
            mensajesInternos: true
        });

        const envio = await request(app).post("/api/notificaciones").send({
            colectivoId: colectivo.id,
            personaColaboradoraId: eva.id,
            perfilId: perfil.id,
            contenido: "Hola Eva"
        });

        expect(envio.status).toBe(201);
        expect(enviarMail).not.toHaveBeenCalled();
        expect(crearMensajeTwilio).not.toHaveBeenCalled();

        const bandeja = await request(app).get(`/api/notificaciones?destinatarioId=${eva.id}`);
        expect(bandeja.body).toHaveLength(1);
    });

    test("si falla el envio externo, el mensaje interno se conserva (HU11)", async () => {
        // El medio externo es best-effort: que no se pueda mandar el mail no
        // puede hacer perder la notificacion dentro de la plataforma.
        enviarMail.mockRejectedValueOnce(new Error("SMTP caido"));

        const { react, colectivo, proyecto, perfil } = await unColectivoConUnProyectoYUnPerfil();

        const fran = await crearColaboradora({
            nombreFantasia: "Fran",
            habilidades: [{ codigo: react.codigo, titulo: react.titulo }],
            mensajesInternos: true,
            mediosDeContacto: [{ tipo: "EMAIL", valor: "fran@ejemplo.com" }]
        });

        const envio = await request(app).post("/api/notificaciones").send({
            colectivoId: colectivo.id,
            personaColaboradoraId: fran.id,
            perfilId: perfil.id,
            contenido: "Hola Fran"
        });

        expect(envio.status).toBe(201);

        const bandeja = await request(app).get(`/api/notificaciones?destinatarioId=${fran.id}`);
        expect(bandeja.body).toHaveLength(1);

        const medio = bandeja.body[0].mediosExternosUtilizados.find((m) => m.tipo === "EMAIL");
        expect(medio.exitoso).toBe(false);
    });
});
