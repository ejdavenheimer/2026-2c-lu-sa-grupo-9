import mongoose from "mongoose";
import { PerfilModel } from "../schemas/PerfilSchema.js";
import { Perfil } from "../domain/Perfil.js";

const isMongoActive = () => mongoose.connection && mongoose.connection.readyState === 1;

export class PerfilRepository {
    static #perfiles = [];

    static #aDominio(doc) {
        if (!doc) return null;
        return new Perfil({
            id: doc.id,
            nombre: doc.nombre,
            descripcion: doc.descripcion,
            habilidadesRequeridas: doc.habilidadesRequeridas,
            habilidadesOpcionales: doc.habilidadesOpcionales,
            unidadCompromiso: doc.unidadCompromiso,
            cantidadHoras: doc.cantidadHoras,
            modalidadesColaboracion: doc.modalidadesColaboracion,
            proyecto: doc.proyectoId
        });
    }

    static async guardar(perfil) {
        const json = typeof perfil.toJSON === "function" ? perfil.toJSON() : perfil;
        const proyectoId = json.proyectoId || (perfil.proyecto?.id || perfil.proyecto);

        if (isMongoActive()) {
            await PerfilModel.findOneAndUpdate(
                { id: perfil.id },
                {
                    id: perfil.id,
                    nombre: json.nombre || json.descripcion,
                    descripcion: json.descripcion || json.nombre,
                    habilidadesRequeridas: json.habilidadesRequeridas,
                    habilidadesOpcionales: json.habilidadesOpcionales,
                    unidadCompromiso: json.unidadCompromiso,
                    cantidadHoras: json.cantidadHoras,
                    modalidadesColaboracion: json.modalidadesColaboracion,
                    proyectoId
                },
                { upsert: true, returnDocument: "after" }
            );
        }

        const index = this.#perfiles.findIndex((p) => p.id === perfil.id);
        if (index >= 0) {
            this.#perfiles[index] = perfil;
        } else {
            this.#perfiles.push(perfil);
        }
        return perfil;
    }

    static async buscarTodos() {
        if (isMongoActive()) {
            const docs = await PerfilModel.find().lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return [...this.#perfiles];
    }

    static async buscarPorId(id) {
        if (isMongoActive()) {
            const doc = await PerfilModel.findOne({ id }).lean();
            return this.#aDominio(doc);
        }
        return this.#perfiles.find((p) => p.id === id) || null;
    }

    static async buscarPorProyectoId(proyectoId) {
        if (isMongoActive()) {
            const docs = await PerfilModel.find({ proyectoId }).lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return this.#perfiles.filter((p) => {
            const pid = p.proyecto?.id || p.proyectoId || (typeof p.proyecto === "string" ? p.proyecto : null);
            return pid === proyectoId;
        });
    }

    static async buscarPorProyectoYPerfilId(proyectoId, perfilId) {
        if (isMongoActive()) {
            const doc = await PerfilModel.findOne({ proyectoId, id: perfilId }).lean();
            return this.#aDominio(doc);
        }
        return this.#perfiles.find((p) => {
            const pid = p.proyecto?.id || p.proyectoId || (typeof p.proyecto === "string" ? p.proyecto : null);
            return pid === proyectoId && p.id === perfilId;
        }) || null;
    }

    static async eliminarPorId(id) {
        if (isMongoActive()) {
            const res = await PerfilModel.deleteOne({ id });
            const idx = this.#perfiles.findIndex((p) => p.id === id);
            if (idx >= 0) this.#perfiles.splice(idx, 1);
            return res.deletedCount > 0;
        }
        const index = this.#perfiles.findIndex((p) => p.id === id);
        if (index === -1) {
            return false;
        }
        this.#perfiles.splice(index, 1);
        return true;
    }

    static async limpiar() {
        if (isMongoActive()) {
            await PerfilModel.deleteMany({});
        }
        this.#perfiles = [];
    }
}
