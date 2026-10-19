import mongoose from "mongoose";
import { ConflictError } from "../errors/AppError.js";
import { HabilidadModel } from "../schemas/HabilidadSchema.js";
import { Habilidad } from "../domain/Habilidad.js";

const isMongoActive = () => mongoose.connection && mongoose.connection.readyState === 1;

export class HabilidadRepository {
    static #habilidades = [];

    static #aDominio(doc) {
        if (!doc) return null;
        return new Habilidad({
            codigo: doc.codigo,
            titulo: doc.titulo,
            descripcion: doc.descripcion
        });
    }

    static async guardar(habilidad) {
        if (isMongoActive()) {
            const existe = await HabilidadModel.findOne({ codigo: habilidad.codigo });
            if (existe) {
                throw new ConflictError(`Ya existe una habilidad con el código '${habilidad.codigo}'`);
            }
            await HabilidadModel.create({
                codigo: habilidad.codigo,
                titulo: habilidad.titulo,
                descripcion: habilidad.descripcion
            });
        } else {
            const existe = this.#habilidades.some((h) => h.codigo === habilidad.codigo);
            if (existe) {
                throw new ConflictError(`Ya existe una habilidad con el código '${habilidad.codigo}'`);
            }
        }

        const index = this.#habilidades.findIndex((h) => h.codigo === habilidad.codigo);
        if (index >= 0) {
            this.#habilidades[index] = habilidad;
        } else {
            this.#habilidades.push(habilidad);
        }
        return habilidad;
    }

    static async buscarTodos() {
        if (isMongoActive()) {
            const docs = await HabilidadModel.find().lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return [...this.#habilidades];
    }

    static async buscarPorCodigo(codigo) {
        if (isMongoActive()) {
            const doc = await HabilidadModel.findOne({ codigo }).lean();
            return this.#aDominio(doc);
        }
        return this.#habilidades.find((h) => h.codigo === codigo) || null;
    }

    static async actualizar(codigo, habilidadActualizada) {
        if (isMongoActive()) {
            const updated = await HabilidadModel.findOneAndUpdate(
                { codigo },
                {
                    titulo: habilidadActualizada.titulo,
                    descripcion: habilidadActualizada.descripcion
                },
                { returnDocument: "after" }
            );
            if (!updated) {
                throw new Error(`No se encontró la habilidad con el código '${codigo}'`);
            }
        }
        const index = this.#habilidades.findIndex((h) => h.codigo === codigo);
        if (index === -1 && !isMongoActive()) {
            throw new Error(`No se encontró la habilidad con el código '${codigo}'`);
        }
        if (index >= 0) {
            this.#habilidades[index] = habilidadActualizada;
        } else {
            this.#habilidades.push(habilidadActualizada);
        }
        return habilidadActualizada;
    }

    static async eliminarPorCodigo(codigo) {
        if (isMongoActive()) {
            const res = await HabilidadModel.deleteOne({ codigo });
            const idx = this.#habilidades.findIndex((h) => h.codigo === codigo);
            if (idx >= 0) this.#habilidades.splice(idx, 1);
            return res.deletedCount > 0;
        }
        const index = this.#habilidades.findIndex((h) => h.codigo === codigo);
        if (index === -1) {
            return false;
        }
        this.#habilidades.splice(index, 1);
        return true;
    }

    static async limpiar() {
        if (isMongoActive()) {
            await HabilidadModel.deleteMany({});
        }
        this.#habilidades = [];
    }
}
