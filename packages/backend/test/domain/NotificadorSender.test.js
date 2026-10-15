import { jest } from "@jest/globals";
import { NotificadorSender } from "../../src/domain/Notificaciones/estrategias/NotificadorSender.js";
import { EstrategiaNotificacionEmail } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionEmail.js";
import { EstrategiaNotificacionWhatsApp } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionWhatsApp.js";
import { EstrategiaNotificacionSMS } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionSMS.js";
import { Notificacion } from "../../src/domain/Notificaciones/Notificacion.js";
import { TipoMedioContacto } from "../../src/domain/enums.js";

describe("NotificadorSender y Estrategias", () => {
    let notificacion;

    beforeEach(() => {
        notificacion = new Notificacion({
            contenido: "Mensaje de prueba",
            colectivo: { id: "col-1", nombre: "Colectivo Test" },
            personaColaboradora: { id: "colab-1", nombre: "Ana" },
            perfil: { id: "perf-1", nombre: "Perfil Test" }
        });
    });

    test("EstrategiaNotificacionEmail envía exitosamente", async () => {
        const estrategia = new EstrategiaNotificacionEmail();
        const resultado = await estrategia.notificar({
            destinatario: "user@test.com",
            mensaje: "Hola",
            notificacion
        });

        expect(resultado.enviado).toBe(true);
        expect(resultado.medio).toBe("EMAIL");
        expect(resultado.destinatario).toBe("user@test.com");
    });

    test("EstrategiaNotificacionWhatsApp envía exitosamente", async () => {
        const estrategia = new EstrategiaNotificacionWhatsApp();
        const resultado = await estrategia.notificar({
            destinatario: "+5491112345678",
            mensaje: "Hola WhatsApp",
            notificacion
        });

        expect(resultado.enviado).toBe(true);
        expect(resultado.medio).toBe("WHATSAPP");
    });

    test("EstrategiaNotificacionSMS envía exitosamente", async () => {
        const estrategia = new EstrategiaNotificacionSMS();
        const resultado = await estrategia.notificar({
            destinatario: "+5491187654321",
            mensaje: "Hola SMS",
            notificacion
        });

        expect(resultado.enviado).toBe(true);
        expect(resultado.medio).toBe("SMS");
    });

    test("NotificadorSender replica por múltiples medios y registra resultados", async () => {
        const sender = new NotificadorSender();

        const medios = [
            { tipo: TipoMedioContacto.EMAIL, valor: "persona@test.com" },
            { tipo: TipoMedioContacto.WHATSAPP, valor: "+5491122334455" },
            { tipo: TipoMedioContacto.SMS, valor: "+5491199887766" }
        ];

        const resultados = await sender.replicarPorMedios(medios, notificacion);

        expect(resultados).toHaveLength(3);
        expect(resultados.every((r) => r.enviado)).toBe(true);
        expect(notificacion.mediosExternosUtilizados).toHaveLength(3);
        expect(notificacion.mediosExternosUtilizados[0].exitoso).toBe(true);
    });

    test("NotificadorSender tolera fallos en una estrategia sin romper el flujo", async () => {
        const mockEstrategiaFallida = {
            notificar: jest.fn().mockRejectedValue(new Error("Fallo de red en SMS"))
        };

        const sender = new NotificadorSender({
            [TipoMedioContacto.SMS]: mockEstrategiaFallida
        });

        const medios = [
            { tipo: TipoMedioContacto.EMAIL, valor: "persona@test.com" },
            { tipo: TipoMedioContacto.SMS, valor: "+5491199887766" }
        ];

        const resultados = await sender.replicarPorMedios(medios, notificacion);

        expect(resultados).toHaveLength(2);
        expect(resultados[0].enviado).toBe(true);
        expect(resultados[1].enviado).toBe(false);

        expect(notificacion.mediosExternosUtilizados).toHaveLength(2);
        expect(notificacion.mediosExternosUtilizados[0].exitoso).toBe(true);
        expect(notificacion.mediosExternosUtilizados[1].exitoso).toBe(false);
        expect(notificacion.mediosExternosUtilizados[1].error).toBe("Fallo de red en SMS");
    });
});
