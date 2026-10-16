import nodemailer from "nodemailer";
import { EstrategiaNotificacion } from "./EstrategiaNotificacion.js";

export class EstrategiaNotificacionEmail extends EstrategiaNotificacion {
    /**
     * @param {{ transporter?: { sendMail: Function } }} [opciones]
     *   transporter: permite inyectar un transporter (por ejemplo un mock en tests).
     */
    constructor({ transporter = null } = {}) {
        super();
        this.transporter = transporter;
    }

    #obtenerTransporter() {
        if (!this.transporter) {
            const puerto = Number(process.env.SMTP_PORT) || 587;
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: puerto,
                secure: puerto === 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        }
        return this.transporter;
    }

    async notificar({ destinatario, mensaje, notificacion }) {
        if (!destinatario) {
            throw new Error("El destinatario de email es requerido");
        }

        const info = await this.#obtenerTransporter().sendMail({
            from: process.env.SMTP_USER,
            to: destinatario,
            subject: "Nueva notificación de Código a Voluntad",
            text: mensaje
        });

        return {
            medio: "EMAIL",
            destinatario,
            enviado: true,
            fechaEnvio: new Date(),
            messageId: info.messageId
        };
    }
}
