import { ConflictError } from "../errors/AppError.js";
import { PersonaColaboradoraModel } from "../schemas/PersonaColaboradoraSchema.js";

const isMongoActive = () => mongoose.connection && mongoose.connection.readyState === 1;

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
        return await PersonaColaboradoraModel.findOne({ id }).lean();
    }

    static async buscarTodos(filtro = {}) {
        if (!PersonaColaboradoraModel) return [];
        return await PersonaColaboradoraModel.find(filtro).lean();
    }

    static async buscarPorHabilidades(codigos) {
        if (!PersonaColaboradoraModel) return [];
        if (!Array.isArray(codigos) || codigos.length === 0) {
            return [];
        }
        return await PersonaColaboradoraModel.find({
            "habilidades.codigo": { $in: codigos }
        }).lean();
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
