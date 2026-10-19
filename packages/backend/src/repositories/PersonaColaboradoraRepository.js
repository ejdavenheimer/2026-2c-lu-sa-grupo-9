import { ConflictError } from "../errors/AppError.js";
import { PersonaColaboradoraModel } from "../schemas/PersonaColaboradoraSchema.js";
import { PersonaColaboradora } from "../domain/PersonaColaboradora.js";

const aRegistro = (c) => ({
    id: c.id,
    nombre: c.nombre,
    apellido: c.apellido,
    nombreFantasia: c.nombreFantasia,
    pronombres: c.pronombres,
    presentacion: c.presentacion,
    cuentas: c.cuentas,
    habilidades: c.habilidades,
    colaboraciones: c.colaboraciones,
    mensajesInternos: c.mensajesInternos,
    mediosDeContacto: c.mediosDeContacto
});

/**
 * Reconstruye la entidad de dominio a partir del documento de Mongo.
 *
 * El repositorio devuelve instancias de PersonaColaboradora, no documentos
 * crudos: CompatibilidadService necesita poder llamar a codigosDeHabilidades()
 * y el dominio en general espera comportamiento, no solo datos.
 */
const aDominio = (doc) => {
    if (!doc) return null;
    return new PersonaColaboradora({
        id: doc.id,
        nombre: doc.nombre,
        apellido: doc.apellido,
        nombreFantasia: doc.nombreFantasia,
        pronombres: doc.pronombres ?? [],
        presentacion: doc.presentacion,
        cuentas: doc.cuentas ?? [],
        habilidades: doc.habilidades ?? [],
        colaboraciones: doc.colaboraciones ?? [],
        mensajesInternos: doc.mensajesInternos,
        mediosDeContacto: doc.mediosDeContacto ?? []
    });
};

export class PersonaColaboradoraRepository {

    static async guardar(colaborador) {
        if (!PersonaColaboradoraModel) return colaborador;

        if (colaborador.nombreFantasia) {
            const existePorNombre = await PersonaColaboradoraModel.findOne({
                nombreFantasia: colaborador.nombreFantasia,
                id: { $ne: colaborador.id }
            }).lean();

            if (existePorNombre) {
                throw new ConflictError(`Ya existe una persona colaboradora con el nombre de fantasía '${colaborador.nombreFantasia}'`);
            }
        }

        await PersonaColaboradoraModel.findOneAndUpdate(
            { id: colaborador.id },
            aRegistro(colaborador),
            { upsert: true, new: true }
        );

        return colaborador;
    }

    static async buscarPorId(id) {
        if (!PersonaColaboradoraModel) return null;
        return aDominio(await PersonaColaboradoraModel.findOne({ id }).lean());
    }

    static async buscarTodos(filtro = {}) {
        if (!PersonaColaboradoraModel) return [];
        const docs = await PersonaColaboradoraModel.find(filtro).lean();
        return docs.map(aDominio);
    }

    static async buscarPorHabilidades(codigos) {
        if (!PersonaColaboradoraModel) return [];
        if (!Array.isArray(codigos) || codigos.length === 0) {
            return [];
        }
        const docs = await PersonaColaboradoraModel.find({
            "habilidades.codigo": { $in: codigos }
        }).lean();
        return docs.map(aDominio);
    }

    static async eliminarPorId(id) {
        if (!PersonaColaboradoraModel) return false;
        const res = await PersonaColaboradoraModel.deleteOne({ id });
        return res.deletedCount > 0;
    }

    static async limpiar() {
        if (!PersonaColaboradoraModel) return;
        await PersonaColaboradoraModel.deleteMany({});
    }
}
