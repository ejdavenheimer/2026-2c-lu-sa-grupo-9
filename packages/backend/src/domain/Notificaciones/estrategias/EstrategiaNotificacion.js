export class EstrategiaNotificacion {
    async notificar({ destinatario, mensaje, notificacion }) {
        throw new Error("El método notificar() debe ser implementado por la subclase");
    }
}
 