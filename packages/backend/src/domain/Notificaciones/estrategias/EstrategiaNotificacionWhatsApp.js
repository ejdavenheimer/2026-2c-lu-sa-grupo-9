import twilio from "twilio";
import { EstrategiaNotificacion } from "./EstrategiaNotificacion.js";

const PREFIJO_WHATSAPP = "whatsapp:";

export class EstrategiaNotificacionWhatsApp extends EstrategiaNotificacion {
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
            throw new Error("El número de WhatsApp es requerido");
        }

        // Twilio exige el prefijo "whatsapp:" en el destinatario.
        // Nota: en el sandbox con números de Argentina puede requerir probar con o sin el 9 tras +54.
        const destinatarioFormateado = destinatario.startsWith(PREFIJO_WHATSAPP)
            ? destinatario
            : `${PREFIJO_WHATSAPP}${destinatario}`;

        const response = await this.#obtenerClient().messages.create({
            body: mensaje,
            from: process.env.TWILIO_WHATSAPP_FROM,
            to: destinatarioFormateado
        });

        return {
            medio: "WHATSAPP",
            destinatario,
            enviado: true,
            fechaEnvio: new Date(),
            sid: response.sid
        };
    }
}
