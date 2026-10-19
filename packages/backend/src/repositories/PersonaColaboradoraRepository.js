import mongoose from "mongoose";
import { ConflictError } from "../errors/AppError.js";
import { PersonaColaboradoraModel } from "../schemas/PersonaColaboradoraSchema.js";
import { PersonaColaboradora } from "../domain/PersonaColaboradora.js";

const isMongoActive = () => mongoose.connection && mongoose.connection.readyState === 1;

export class PersonaColaboradoraRepository {
    static #colaboradores = [];
    static #nextId = 1;

    static #aDominio(doc) {
        if (!doc) return null;
        const colab = new PersonaColaboradora({
            nombreFantasia: doc.nombreFantasia,
            nombre: doc.nombre,
            apellido: doc.apellido,
            pronombres: doc.pronombres,
            presentacion: doc.presentacion,
            cuentas: doc.cuentas,
            habilidades: doc.habilidades,
            colaboraciones: doc.colaboraciones,
            mensajesInternos: doc.mensajesInternos,
            mediosDeContacto: doc.mediosDeContacto
        });
        colab.id = doc.id;
        return colab;
    }

    static async guardar(colaborador) {
        if (!colaborador.id) {
            colaborador.id = `colab-${this.#nextId++}`;
        }

        if (isMongoActive()) {
            if (colaborador.nombreFantasia) {
                const existePorNombre = await PersonaColaboradoraModel.findOne({
                    nombreFantasia: colaborador.nombreFantasia,
                    id: { $ne: colaborador.id }
                });
                if (existePorNombre) {
                    throw new ConflictError(
                        `Ya existe una persona colaboradora con el nombre de fantasía '${colaborador.nombreFantasia}'`
                    );
                }
            }

            await PersonaColaboradoraModel.findOneAndUpdate(
                { id: colaborador.id },
                {
                    id: colaborador.id,
                    nombre: colaborador.nombre,
                    apellido: colaborador.apellido,
                    nombreFantasia: colaborador.nombreFantasia,
                    pronombres: colaborador.pronombres,
                    presentacion: colaborador.presentacion,
                    cuentas: colaborador.cuentas,
                    habilidades: colaborador.habilidades,
                    mensajesInternos: colaborador.mensajesInternos,
                    mediosDeContacto: colaborador.mediosDeContacto,
                    colaboraciones: colaborador.colaboraciones
                },
                { upsert: true, returnDocument: "after" }
            );
        } else {
            if (colaborador.nombreFantasia) {
                const existePorNombre = this.#colaboradores.some(
                    (c) => c.nombreFantasia && c.nombreFantasia === colaborador.nombreFantasia && c.id !== colaborador.id
                );
                if (existePorNombre) {
                    throw new ConflictError(
                        `Ya existe una persona colaboradora con el nombre de fantasía '${colaborador.nombreFantasia}'`
                    );
                }
            }
        }

        const index = this.#colaboradores.findIndex((c) => c.id === colaborador.id);
        if (index >= 0) {
            this.#colaboradores[index] = colaborador;
        } else {
            this.#colaboradores.push(colaborador);
        }
        return colaborador;
    }

    static async buscarTodos() {
        if (isMongoActive()) {
            const docs = await PersonaColaboradoraModel.find().lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return [...this.#colaboradores];
    }

    static async buscarPorId(id) {
        if (isMongoActive()) {
            const doc = await PersonaColaboradoraModel.findOne({ id }).lean();
            return this.#aDominio(doc);
        }
        return this.#colaboradores.find((c) => c.id === id) || null;
    }

    static async buscarPorHabilidades(codigos) {
        if (!Array.isArray(codigos) || codigos.length === 0) {
            return [];
        }
        if (isMongoActive()) {
            const docs = await PersonaColaboradoraModel.find({
                "habilidades.codigo": { $in: codigos }
            }).lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return this.#colaboradores.filter((colaborador) =>
            codigos.some((codigo) => colaborador.tieneHabilidad(codigo))
        );
    }

    static async eliminarPorId(id) {
        if (isMongoActive()) {
            const res = await PersonaColaboradoraModel.deleteOne({ id });
            const idx = this.#colaboradores.findIndex((c) => c.id === id);
            if (idx >= 0) this.#colaboradores.splice(idx, 1);
            return res.deletedCount > 0;
        }
        const index = this.#colaboradores.findIndex((c) => c.id === id);
        if (index === -1) {
            return false;
        }
        this.#colaboradores.splice(index, 1);
        return true;
    }

    static async limpiar() {
        if (isMongoActive()) {
            await PersonaColaboradoraModel.deleteMany({});
        }
        this.#colaboradores = [];
        this.#nextId = 1;
    }
}
