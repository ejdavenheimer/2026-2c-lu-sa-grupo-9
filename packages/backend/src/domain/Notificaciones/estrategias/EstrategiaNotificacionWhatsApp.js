import { EstrategiaNotificacion } from "./EstrategiaNotificacion.js";

export class EstrategiaNotificacionWhatsApp extends EstrategiaNotificacion {
    notificar({ destinatario, mensaje, notificacion }) {
        if (!destinatario) {
            throw new Error("El número de WhatsApp es requerido");
        }

        // Simulación de envío por WhatsApp
        console.log(`[WhatsApp] Enviando mensaje a ${destinatario}: "${mensaje}"`);

        return {
            medio: "WHATSAPP",
            destinatario,
            enviado: true,
            fechaEnvio: new Date()
        };
    }
}
