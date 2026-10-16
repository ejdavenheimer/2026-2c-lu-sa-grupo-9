import { jest } from "@jest/globals";
import { EstrategiaNotificacionEmail } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionEmail.js";
import { EstrategiaNotificacionSMS } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionSMS.js";
import { EstrategiaNotificacionWhatsApp } from "../../src/domain/Notificaciones/estrategias/EstrategiaNotificacionWhatsApp.js";

const VARIABLES = {
    SMTP_USER: "origen@gmail.com",
    SMTP_PASS: "pass-app",
    TWILIO_SMS_FROM: "+1234567890",
    TWILIO_WHATSAPP_FROM: "whatsapp:+14155238886"
};

describe("Estrategias de notificación externas", () => {
    let entornoOriginal;

    beforeEach(() => {
        entornoOriginal = {};
        Object.entries(VARIABLES).forEach(([k, v]) => {
            entornoOriginal[k] = process.env[k];
            process.env[k] = v;
        });
    });

    afterEach(() => {
        Object.keys(VARIABLES).forEach((k) => {
            if (entornoOriginal[k] === undefined) delete process.env[k];
            else process.env[k] = entornoOriginal[k];
        });
    });

    describe("EstrategiaNotificacionEmail", () => {
        test("lanza error si falta destinatario", async () => {
            const transporter = { sendMail: jest.fn() };

            await expect(new EstrategiaNotificacionEmail({ transporter }).notificar({ mensaje: "Hola" }))
                .rejects.toThrow("El destinatario de email es requerido");
            expect(transporter.sendMail).not.toHaveBeenCalled();
        });

        test("envía vía transporter", async () => {
            const transporter = { sendMail: jest.fn().mockResolvedValue({ messageId: "<abc@mail>" }) };

            const resultado = await new EstrategiaNotificacionEmail({ transporter }).notificar({
                destinatario: "user@test.com",
                mensaje: "Hola"
            });

            expect(transporter.sendMail).toHaveBeenCalledWith({
                from: "origen@gmail.com",
                to: "user@test.com",
                subject: "Nueva notificación de Código a Voluntad",
                text: "Hola"
            });
            expect(resultado).toMatchObject({
                medio: "EMAIL", destinatario: "user@test.com", enviado: true, messageId: "<abc@mail>"
            });
            expect(resultado.fechaEnvio).toBeInstanceOf(Date);
        });

        test("propaga el error del proveedor", async () => {
            const transporter = { sendMail: jest.fn().mockRejectedValue(new Error("Invalid login")) };

            await expect(new EstrategiaNotificacionEmail({ transporter })
                .notificar({ destinatario: "user@test.com", mensaje: "Hola" }))
                .rejects.toThrow("Invalid login");
        });
    });

    describe("EstrategiaNotificacionSMS", () => {
        test("lanza error si falta destinatario", async () => {
            const client = { messages: { create: jest.fn() } };

            await expect(new EstrategiaNotificacionSMS({ client }).notificar({ mensaje: "Hola" }))
                .rejects.toThrow("El número de SMS es requerido");
            expect(client.messages.create).not.toHaveBeenCalled();
        });

        test("envía vía Twilio", async () => {
            const client = { messages: { create: jest.fn().mockResolvedValue({ sid: "SM123" }) } };

            const resultado = await new EstrategiaNotificacionSMS({ client })
                .notificar({ destinatario: "+5491187654321", mensaje: "Hola SMS" });

            expect(client.messages.create).toHaveBeenCalledWith({
                body: "Hola SMS",
                from: "+1234567890",
                to: "+5491187654321"
            });
            expect(resultado).toMatchObject({
                medio: "SMS", destinatario: "+5491187654321", enviado: true, sid: "SM123"
            });
        });

        test("propaga el error del proveedor", async () => {
            const client = { messages: { create: jest.fn().mockRejectedValue(new Error("Invalid 'To' number")) } };

            await expect(new EstrategiaNotificacionSMS({ client })
                .notificar({ destinatario: "123", mensaje: "Hola" }))
                .rejects.toThrow("Invalid 'To' number");
        });
    });

    describe("EstrategiaNotificacionWhatsApp", () => {
        test("lanza error si falta destinatario", async () => {
            const client = { messages: { create: jest.fn() } };

            await expect(new EstrategiaNotificacionWhatsApp({ client }).notificar({ mensaje: "Hola" }))
                .rejects.toThrow("El número de WhatsApp es requerido");
            expect(client.messages.create).not.toHaveBeenCalled();
        });

        test("prefija 'whatsapp:' al destinatario si no lo tiene", async () => {
            const client = { messages: { create: jest.fn().mockResolvedValue({ sid: "SM456" }) } };

            const resultado = await new EstrategiaNotificacionWhatsApp({ client })
                .notificar({ destinatario: "+5491112345678", mensaje: "Hola WA" });

            expect(client.messages.create).toHaveBeenCalledWith({
                body: "Hola WA",
                from: "whatsapp:+14155238886",
                to: "whatsapp:+5491112345678"
            });
            expect(resultado).toMatchObject({
                medio: "WHATSAPP", destinatario: "+5491112345678", enviado: true, sid: "SM456"
            });
        });

        test("no duplica el prefijo si ya está presente", async () => {
            const client = { messages: { create: jest.fn().mockResolvedValue({ sid: "SM789" }) } };

            await new EstrategiaNotificacionWhatsApp({ client })
                .notificar({ destinatario: "whatsapp:+5491112345678", mensaje: "Hola" });

            expect(client.messages.create.mock.calls[0][0].to).toBe("whatsapp:+5491112345678");
        });

        test("propaga el error del proveedor", async () => {
            const client = { messages: { create: jest.fn().mockRejectedValue(new Error("Authenticate")) } };

            await expect(new EstrategiaNotificacionWhatsApp({ client })
                .notificar({ destinatario: "+5491112345678", mensaje: "Hola" }))
                .rejects.toThrow("Authenticate");
        });
    });
});
