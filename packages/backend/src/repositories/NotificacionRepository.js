import { NotificacionModel } from "../schemas/NotificacionSchema.js";

const aRegistro = (n) => ({
    id: n.id,
    contenido: n.contenido,
    fecha: n.fecha,
    leida: n.leida,
    colectivoId: n.colectivo?.id || n.colectivoId,
    personaColaboradoraId: n.personaColaboradora?.id || n.personaColaboradoraId,
    perfilId: n.perfil?.id || n.perfilId,
    mediosExternosUtilizados: n.mediosExternosUtilizados
});

export class NotificacionRepository {
    static async guardar(notificacion) {
        if (!NotificacionModel) return notificacion;
        await NotificacionModel.findOneAndUpdate(
            { id: notificacion.id },
            aRegistro(notificacion),
            { upsert: true, new: true }
        );
        return notificacion;
    }

    static async buscarPorId(id) {
        if (!NotificacionModel) return null;
        return await NotificacionModel.findOne({ id }).lean();
    }

    static async buscarTodos(filtro = {}) {
        if (!NotificacionModel) return [];
        return await NotificacionModel.find(filtro).sort({ fecha: -1 }).lean();
    }

    static async eliminarPorId(id) {
        if (!NotificacionModel) return false;
        const res = await NotificacionModel.deleteOne({ id });
        return res.deletedCount > 0;
    }

    static async limpiar() {
        if (!NotificacionModel) return;
        await NotificacionModel.deleteMany({});
    }
}

