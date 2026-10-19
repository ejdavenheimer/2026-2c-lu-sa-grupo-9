import {ProyectoModel} from "../schemas/ProyectoSchema.js";
import {ConflictError} from "../errors/AppError.js";
import {Proyecto} from "../domain/Proyecto.js";
import {Perfil} from "../domain/Perfil.js";
import {Colectivo} from "../domain/Colectivo.js";
import {Habilidad} from "../domain/Habilidad.js";
import {PerfilModel} from "../schemas/PerfilSchema.js";

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
        })
        .populate({
            path: "habilidadesDocs",
            select: "codigo titulo descripcion -_id",
        })
        .populate("perfilesDocs")
        .populate({
            path: "colaboraciones.personaColaboradora",
            select: "id nombreFantasia nombre apellido",
        })
        .lean();

/**
 * Reconstruye la entidad de dominio a partir del documento de Mongo.
 *
 * El repositorio devuelve instancias de Proyecto y no documentos crudos: los
 * services llaman a agregarPerfil(), obtenerPerfil() y evaluarPerfilesPara()
 * sobre lo que devuelve, y con un lean() eso explota con
 * "proyecto.X is not a function".
 */
const aDominio = (doc) => {
    if (!doc) return null;

    const colectivoDoc = doc.colectivoDoc;
    const colectivo = colectivoDoc
        ? new Colectivo({
            id: colectivoDoc.id,
            nombre: colectivoDoc.nombre,
            descripcion: colectivoDoc.descripcion,
            tipo: colectivoDoc.tipo,
            ubicacion: colectivoDoc.ubicacion,
        })
        // Si el colectivo todavia no esta en la base, se conserva al menos la
        // referencia: el constructor de Proyecto exige un colectivo truthy.
        : (doc.colectivo ? { id: doc.colectivo } : null);

    // habilidadesDocs puede traer nulls: son codigos referenciados que todavia
    // no tienen un documento Habilidad que los respalde.
    const habilidadesRequeridas = (doc.habilidadesDocs?.length
        ? doc.habilidadesDocs
        : doc.habilidadesRequeridas ?? []
    )
        .filter(Boolean)
        .map((h) => (typeof h === "string"
            ? new Habilidad({ codigo: h, titulo: h })
            : new Habilidad({
                codigo: h.codigo,
                titulo: h.titulo ?? h.codigo,
                descripcion: h.descripcion,
            })));

    const perfiles = (doc.perfilesDocs ?? []).map((p) => new Perfil({
        id: p.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        habilidadesRequeridas: p.habilidadesRequeridas,
        habilidadesOpcionales: p.habilidadesOpcionales,
        unidadCompromiso: p.unidadCompromiso,
        cantidadHoras: p.cantidadHoras,
        modalidadesColaboracion: p.modalidadesColaboracion,
    }));

    const proyecto = new Proyecto({
        id: doc.id,
        titulo: doc.titulo,
        descripcion: doc.descripcion,
        unidadCompromiso: doc.unidadCompromiso,
        cantidadHoras: doc.cantidadHoras,
        modalidadesColaboracion: doc.modalidadesColaboracion,
        fechaAlta: doc.fechaAlta,
        enlaceSistemaEnFuncionamiento: doc.enlaceSistemaEnFuncionamiento,
        enlaceCodigoFuente: doc.enlaceCodigoFuente,
        colectivo,
        habilidadesRequeridas,
        perfiles,
        hitos: doc.hitos ?? [],
        colaboraciones: doc.colaboraciones ?? [],
    });

    // El constructor fuerza estado PUBLICADO y fechaCierre undefined, asi que
    // hay que restaurar el estado real despues de construir. Sin esto, un
    // proyecto cerrado "revive" al leerlo.
    if (doc.estado) proyecto.estado = doc.estado;
    if (doc.fechaCierre) proyecto.fechaCierre = doc.fechaCierre;

    return proyecto;
};

export class ProyectoRepository {


    static async guardar(proyecto) {
        if(!ProyectoModel) return proyecto;
        // Excluye al propio proyecto: guardar() tambien se usa para actualizar
        // (upsert por id), y sin esto cualquier update de un proyecto existente
        // choca contra su propio titulo.
        const proyectoExistente = await ProyectoModel.findOne({
            titulo: proyecto.titulo,
            id: { $ne: proyecto.id },
        });
        if(proyectoExistente){
            throw new ConflictError(`El proyecto con el titulo '${proyecto.titulo}' ya existe en la base de datos`);
        }

        await ProyectoModel.findOneAndUpdate(
            { id: proyecto.id },
            aRegistro(proyecto),
            { upsert: true, new: true }
        );

        // El proyecto solo guarda los ids de sus perfiles, asi que hay que
        // persistirlos tambien o al releerlo se pierden y la entidad no se
        // puede reconstruir (el dominio exige perfiles o la config legada).
        if (PerfilModel) {
            for (const perfil of proyecto.perfiles ?? []) {
                if (!perfil?.id) continue;
                await PerfilModel.findOneAndUpdate(
                    { id: perfil.id },
                    {
                        id: perfil.id,
                        nombre: perfil.nombre,
                        descripcion: perfil.descripcion,
                        habilidadesRequeridas: perfil.habilidadesRequeridas,
                        habilidadesOpcionales: perfil.habilidadesOpcionales,
                        unidadCompromiso: perfil.unidadCompromiso,
                        cantidadHoras: perfil.cantidadHoras,
                        modalidadesColaboracion: perfil.modalidadesColaboracion,
                        proyectoId: proyecto.id,
                    },
                    { upsert: true, returnDocument: "after" }
                );
            }
        }

        return proyecto;
    }

    static async buscarTodos() {
        if(!ProyectoModel) return [];
        const docs = await conReferencias(ProyectoModel.find());
        return docs.map(aDominio);
    }

    static async buscarPorId(id) {
        if (!ProyectoModel) return null;
        return aDominio(await conReferencias(ProyectoModel.findOne({ id })));
    }

    static async buscarPorHabilidadesRequeridas(codigos) {
        if (!ProyectoModel) return [];
        if (!Array.isArray(codigos) || codigos.length === 0) return [];
        // La busqueda va por las habilidades de los PERFILES, no por el campo
        // habilidadesRequeridas del proyecto. La segunda entrega cambio el
        // modelo: un proyecto ya no lista habilidades directamente, sino
        // perfiles, y cada perfil lista las suyas. Un proyecto sin perfiles no
        // es candidato aunque tenga el campo legado cargado.
        if (!PerfilModel) return [];

        const perfiles = await PerfilModel.find(
            { "habilidadesRequeridas.codigo": { $in: codigos } },
            { proyectoId: 1 }
        ).lean();

        const proyectoIds = [...new Set(perfiles.map((p) => p.proyectoId).filter(Boolean))];
        if (proyectoIds.length === 0) return [];

        const docs = await conReferencias(
            ProyectoModel.find({ id: { $in: proyectoIds } })
        );
        return docs.map(aDominio);
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
