import twilio from "twilio";
import { EstrategiaNotificacion } from "./EstrategiaNotificacion.js";

export class EstrategiaNotificacionSMS extends EstrategiaNotificacion {
    /**
     * @param {{ client?: { messages: { create: Function } } }} [opciones]
     *   client: permite inyectar un cliente de Twilio (por ejemplo un mock en tests).
     */
    constructor({ client = null } = {}) {
        super();
        this.client = client;
    }

    #obtenerClient() {
        if (!this.client) {
            this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
        return this.client;
    }

    async notificar({ destinatario, mensaje, notificacion }) {
        if (!destinatario) {
            throw new Error("El número de SMS es requerido");
        }

        const response = await this.#obtenerClient().messages.create({
            body: mensaje,
            from: process.env.TWILIO_SMS_FROM,
            to: destinatario // Formato E.164, ej: +54911...
        });

        return {
            medio: "SMS",
            destinatario,
            enviado: true,
            fechaEnvio: new Date(),
            sid: response.sid
        };
    }
}
