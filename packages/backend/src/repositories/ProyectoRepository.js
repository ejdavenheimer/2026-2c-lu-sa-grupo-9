import {ProyectoModel} from "../schemas/ProyectoSchema.js";
import {ConflictError} from "../errors/AppError.js";

const refId = (x) => x?.id ?? x?.codigo ?? x;

const aRegistro = (p) => ({
    id: p.id,
    titulo: p.titulo,
    descripcion: p.descripcion,
    unidadCompromiso: p.unidadCompromiso,
    cantidadHoras: p.cantidadHoras,
    modalidadesColaboracion: p.modalidadesColaboracion,
    estado: p.estado,
    fechaAlta: p.fechaAlta,
    fechaCierre: p.fechaCierre,
    enlaceSistemaEnFuncionamiento: p.enlaceSistemaEnFuncionamiento,
    enlaceCodigoFuente: p.enlaceCodigoFuente,
    colectivo: refId(p.colectivo) ?? null,
    habilidadesRequeridas: (p.habilidadesRequeridas ?? []).map(refId),
    perfiles: (p.perfiles ?? []).map(refId),
    hitos: p.hitos,
    colaboraciones: p.colaboraciones,
});

const conReferencias = (query) =>
    query
        .populate({
            path: "colectivoDoc",
            select: "id nombre descripcion tipo ubicacion -_id",
            transform: (doc) => doc?.nombre ?? null,
        })
        .populate({
            path: "habilidadesDocs",
            select: "codigo -_id",
            transform: (doc) => doc?.codigo,
        })
        .populate("perfilesDocs")
        .populate({
            path: "colaboraciones.personaColaboradora",
            select: "id nombreFantasia nombre apellido",
        })
        .lean();

export class ProyectoRepository {


    static async guardar(proyecto) {
        if(!ProyectoModel) return proyecto;
        const proyectoExistente = await ProyectoModel.findOne({
            titulo: proyecto.titulo,
        });
        if(proyectoExistente){
            throw new ConflictError(`El proyecto con el titulo '${proyecto.titulo}' ya existe en la base de datos`);
        }

        await ProyectoModel.findOneAndUpdate(
            { id: proyecto.id },
            aRegistro(proyecto),
            { upsert: true, new: true }
        );

        return proyecto;
    }

    static async buscarTodos() {
        if(!ProyectoModel) return [];
        return await conReferencias(ProyectoModel.find());
    }

    static async buscarPorId(id) {
        if (!ProyectoModel) return null;
        return await conReferencias(ProyectoModel.findOne({ id }));
    }

    static async buscarPorHabilidadesRequeridas(codigos) {
        if (!ProyectoModel) return [];
        if (!Array.isArray(codigos) || codigos.length === 0) return [];
        return await conReferencias(
            ProyectoModel.find({ habilidadesRequeridas: { $in: codigos } })
        );
    }

    static async eliminarPorId(id) {
        if (!ProyectoModel) return false;
        const eliminado = await ProyectoModel.findOneAndDelete({ id }).lean();
        return eliminado !== null;
    }

    static async limpiar() {
        if (!ProyectoModel) return;
        await ProyectoModel.deleteMany({});
    }
}
