import mongoose from "mongoose";
import { ConflictError } from "../errors/AppError.js";
import { ColectivoModel } from "../schemas/ColectivoSchema.js";
import { Colectivo } from "../domain/Colectivo.js";

const isMongoActive = () => mongoose.connection && mongoose.connection.readyState === 1;

export class ColectivoRepository {
    static #colectivos = [];
    static #nextId = 1;

    static #aDominio(doc) {
        if (!doc) return null;
        const col = new Colectivo({
            nombre: doc.nombre,
            descripcion: doc.descripcion,
            tipo: doc.tipo,
            ubicacion: doc.ubicacion
        });
        col.id = doc.id;
        return col;
    }

    static async guardar(colectivo) {
        if (!colectivo.id) {
            colectivo.id = `col-${this.#nextId++}`;
        }

        if (isMongoActive()) {
            const existePorNombre = await ColectivoModel.findOne({
                nombre: colectivo.nombre,
                id: { $ne: colectivo.id }
            });
            if (existePorNombre) {
                throw new ConflictError(`Ya existe un colectivo con el nombre '${colectivo.nombre}'`);
            }

            await ColectivoModel.findOneAndUpdate(
                { id: colectivo.id },
                {
                    id: colectivo.id,
                    nombre: colectivo.nombre,
                    descripcion: colectivo.descripcion,
                    tipo: colectivo.tipo,
                    ubicacion: colectivo.ubicacion
                },
                { upsert: true, returnDocument: "after" }
            );
        } else {
            const existePorNombre = this.#colectivos.some(
                (c) => c.nombre === colectivo.nombre && c.id !== colectivo.id
            );
            if (existePorNombre) {
                throw new ConflictError(`Ya existe un colectivo con el nombre '${colectivo.nombre}'`);
            }
        }

        const index = this.#colectivos.findIndex((c) => c.id === colectivo.id);
        if (index >= 0) {
            this.#colectivos[index] = colectivo;
        } else {
            this.#colectivos.push(colectivo);
        }
        return colectivo;
    }

    static async buscarTodos() {
        if (isMongoActive()) {
            const docs = await ColectivoModel.find().lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return [...this.#colectivos];
    }

    static async buscarPorId(id) {
        if (isMongoActive()) {
            const doc = await ColectivoModel.findOne({ id }).lean();
            return this.#aDominio(doc);
        }
        return this.#colectivos.find((c) => c.id === id) || null;
    }

    static async eliminarPorId(id) {
        if (isMongoActive()) {
            const res = await ColectivoModel.deleteOne({ id });
            const idx = this.#colectivos.findIndex((c) => c.id === id);
            if (idx >= 0) this.#colectivos.splice(idx, 1);
            return res.deletedCount > 0;
        }
        const index = this.#colectivos.findIndex((c) => c.id === id);
        if (index === -1) {
            return false;
        }
        this.#colectivos.splice(index, 1);
        return true;
    }

    static async limpiar() {
        if (isMongoActive()) {
            await ColectivoModel.deleteMany({});
        }
        this.#colectivos = [];
        this.#nextId = 1;
    }
}
