import { TipoMedioContacto } from "../../enums.js";
import { EstrategiaNotificacionEmail } from "./EstrategiaNotificacionEmail.js";
import { EstrategiaNotificacionWhatsApp } from "./EstrategiaNotificacionWhatsApp.js";
import { EstrategiaNotificacionSMS } from "./EstrategiaNotificacionSMS.js";

export class NotificadorSender {
    constructor(estrategias = {}) {
        this.estrategias = {
            [TipoMedioContacto.EMAIL]: new EstrategiaNotificacionEmail(),
            [TipoMedioContacto.WHATSAPP]: new EstrategiaNotificacionWhatsApp(),
            [TipoMedioContacto.SMS]: new EstrategiaNotificacionSMS(),
            ...estrategias
        };
    }

    async notificarPorMedio(medio, notificacion) {
        if (!medio || !medio.tipo) {
            throw new Error("El medio de contacto debe indicar un tipo");
        }

        const estrategia = this.estrategias[medio.tipo];

        if (!estrategia) {
            console.warn(`[NotificadorSender] No existe estrategia configurada para el tipo de medio: ${medio.tipo}`);
            return false;
        }
        try {
            const resultado = await estrategia.notificar({
                destinatario: medio.valor,
                mensaje: notificacion.contenido,
                notificacion
            });
            notificacion.registrarMedioUtilizado({
                tipo: medio.tipo,
                valor: medio.valor,
                fechaEnvio: resultado.fechaEnvio || new Date(),
                exitoso: true
            });
            return true;
        } catch (error) {
            console.error(`[NotificadorSender] Falló el envío por ${medio.tipo} a ${medio.valor}:`, error.message);
            notificacion.registrarMedioUtilizado({
                tipo: medio.tipo,
                valor: medio.valor,
                fechaEnvio: new Date(),
                exitoso: false,
                error: error.message
            });
            return false;
        }
    }

    async replicarPorMedios(medios = [], notificacion) {
        const resultados = [];
        for (const medio of medios) {
            const enviado = await this.notificarPorMedio(medio, notificacion);
            resultados.push({ medio, enviado });
        }
        return resultados;
    }
}
