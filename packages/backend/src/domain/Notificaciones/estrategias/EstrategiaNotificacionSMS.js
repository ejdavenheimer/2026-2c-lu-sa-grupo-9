import { EstrategiaNotificacion } from "./EstrategiaNotificacion.js";

export class EstrategiaNotificacionSMS extends EstrategiaNotificacion {
    notificar({ destinatario, mensaje, notificacion }) {
        if (!destinatario) {
            throw new Error("El número de SMS es requerido");
        }

        // Simulación de envío por SMS
        console.log(`[SMS] Enviando SMS a ${destinatario}: "${mensaje}"`);

        return {
            medio: "SMS",
            destinatario,
            enviado: true,
            fechaEnvio: new Date()
        };
    }
}
