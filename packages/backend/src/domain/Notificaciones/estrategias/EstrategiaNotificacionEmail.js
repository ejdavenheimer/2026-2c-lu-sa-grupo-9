import { EstrategiaNotificacion } from "./EstrategiaNotificacion.js";

export class EstrategiaNotificacionEmail extends EstrategiaNotificacion {
    notificar({ destinatario, mensaje, notificacion }) {
        if (!destinatario) {
            throw new Error("El destinatario de email es requerido");
        }

        // Simulación de envío de correo electrónico
        console.log(`[Email] Enviando correo a ${destinatario} con mensaje: "${mensaje}"`);

        return {
            medio: "EMAIL",
            destinatario,
            enviado: true,
            fechaEnvio: new Date()
        };
    }
}
