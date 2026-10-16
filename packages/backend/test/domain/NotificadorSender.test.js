import { jest } from "@jest/globals";
import { NotificadorSender } from "../../src/domain/Notificaciones/estrategias/NotificadorSender.js";
import { EstrategiaNotificacionEmail } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionEmail.js";
import { EstrategiaNotificacionWhatsApp } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionWhatsApp.js";
import { EstrategiaNotificacionSMS } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionSMS.js";
import { Notificacion } from "../../src/domain/Notificaciones/Notificacion.js";
import { TipoMedioContacto } from "../../src/domain/enums.js";

const crearSender = ({ email, sms, whatsapp } = {}) =>
    new NotificadorSender({
        [TipoMedioContacto.EMAIL]: new EstrategiaNotificacionEmail({
            transporter: { sendMail: email ?? jest.fn().mockResolvedValue({ messageId: "id-email" }) }
        }),
        [TipoMedioContacto.SMS]: new EstrategiaNotificacionSMS({
            client: { messages: { create: sms ?? jest.fn().mockResolvedValue({ sid: "SM-sms" }) } }
        }),
        [TipoMedioContacto.WHATSAPP]: new EstrategiaNotificacionWhatsApp({
            client: { messages: { create: whatsapp ?? jest.fn().mockResolvedValue({ sid: "SM-wa" }) } }
        })
    });

describe("NotificadorSender", () => {
    let notificacion;

    beforeEach(() => {
        notificacion = new Notificacion({
            contenido: "Mensaje de prueba",
            colectivo: { id: "col-1", nombre: "Colectivo Test" },
            personaColaboradora: { id: "colab-1", nombre: "Ana" },
            perfil: { id: "perf-1", nombre: "Perfil Test" }
        });
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("replica por múltiples medios y registra exitoso: true", async () => {
        const sender = crearSender();
        const spy = jest.spyOn(notificacion, "registrarMedioUtilizado");

        const medios = [
            { tipo: TipoMedioContacto.EMAIL, valor: "persona@test.com" },
            { tipo: TipoMedioContacto.WHATSAPP, valor: "+5491122334455" },
            { tipo: TipoMedioContacto.SMS, valor: "+5491199887766" }
        ];

        const resultados = await sender.replicarPorMedios(medios, notificacion);

        expect(resultados).toHaveLength(3);
        expect(resultados.every((r) => r.enviado)).toBe(true);
        expect(spy).toHaveBeenCalledTimes(3);
        spy.mock.calls.forEach(([registro]) => expect(registro.exitoso).toBe(true));
        expect(notificacion.mediosExternosUtilizados).toHaveLength(3);
    });

    test("captura el error del proveedor, registra exitoso: false con el mensaje y devuelve false", async () => {
        const sender = crearSender({
            sms: jest.fn().mockRejectedValue(new Error("Invalid 'To' Phone Number"))
        });
        const spy = jest.spyOn(notificacion, "registrarMedioUtilizado");

        const enviado = await sender.notificarPorMedio(
            { tipo: TipoMedioContacto.SMS, valor: "123" },
            notificacion
        );

        expect(enviado).toBe(false);
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            tipo: TipoMedioContacto.SMS,
            valor: "123",
            exitoso: false,
            error: "Invalid 'To' Phone Number"
        }));
    });

    test("un fallo en un proveedor no rompe replicarPorMedios", async () => {
        const sender = crearSender({
            email: jest.fn().mockRejectedValue(new Error("Invalid login: 535"))
        });
        const spy = jest.spyOn(notificacion, "registrarMedioUtilizado");

        const medios = [
            { tipo: TipoMedioContacto.EMAIL, valor: "persona@test.com" },
            { tipo: TipoMedioContacto.SMS, valor: "+5491199887766" },
            { tipo: TipoMedioContacto.WHATSAPP, valor: "+5491122334455" }
        ];

        const resultados = await sender.replicarPorMedios(medios, notificacion);

        expect(resultados.map((r) => r.enviado)).toEqual([false, true, true]);
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            tipo: TipoMedioContacto.EMAIL, exitoso: false, error: "Invalid login: 535"
        }));
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            tipo: TipoMedioContacto.SMS, exitoso: true
        }));
        expect(spy).toHaveBeenCalledWith(expect.objectContaining({
            tipo: TipoMedioContacto.WHATSAPP, exitoso: true
        }));
        expect(notificacion.mediosExternosUtilizados).toHaveLength(3);
    });

    test("tolera fallos de una estrategia arbitraria sin romper el flujo", async () => {
        const sender = new NotificadorSender({
            [TipoMedioContacto.EMAIL]: { notificar: jest.fn().mockResolvedValue({ fechaEnvio: new Date() }) },
            [TipoMedioContacto.SMS]: { notificar: jest.fn().mockRejectedValue(new Error("Fallo de red en SMS")) }
        });

        const resultados = await sender.replicarPorMedios([
            { tipo: TipoMedioContacto.EMAIL, valor: "persona@test.com" },
            { tipo: TipoMedioContacto.SMS, valor: "+5491199887766" }
        ], notificacion);

        expect(resultados.map((r) => r.enviado)).toEqual([true, false]);
        expect(notificacion.mediosExternosUtilizados[0].exitoso).toBe(true);
        expect(notificacion.mediosExternosUtilizados[1].exitoso).toBe(false);
        expect(notificacion.mediosExternosUtilizados[1].error).toBe("Fallo de red en SMS");
    });

    test("devuelve false si no hay estrategia para el tipo de medio", async () => {
        jest.spyOn(console, "warn").mockImplementation(() => {});
        const sender = new NotificadorSender({});
        sender.estrategias = {};

        const enviado = await sender.notificarPorMedio({ tipo: "PALOMA", valor: "x" }, notificacion);

        expect(enviado).toBe(false);
    });
});
