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

    notificarPorMedio(medio, notificacion) {
        if (!medio || !medio.tipo) {
            throw new Error("El medio de contacto debe indicar un tipo");
        }

        const estrategia = this.estrategias[medio.tipo];

        if (!estrategia) {
            console.warn(`[NotificadorSender] No existe estrategia configurada para el tipo de medio: ${medio.tipo}`);
            return false;
        }
        //TODO revisar
        estrategia.notificar({
            destinatario: medio.valor,
            mensaje: notificacion.contenido,
            notificacion
        });

        notificacion.registrarMedioUtilizado(medio);
        return true;
    }

    replicarPorMedios(medios = [], notificacion) {
        const resultados = [];
        for (const medio of medios) {
            const enviado = this.notificarPorMedio(medio, notificacion);
            resultados.push({ medio, enviado });
        }
        return resultados;
    }
}
