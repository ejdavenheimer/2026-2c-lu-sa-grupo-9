import mongoose from "mongoose";
import { ProyectoModel } from "../schemas/ProyectoSchema.js";
import { Proyecto } from "../domain/Proyecto.js";
import { Colectivo } from "../domain/Colectivo.js";
import { Hito } from "../domain/Hito.js";
import { Perfil } from "../domain/Perfil.js";
import { Colaboracion } from "../domain/Colaboracion.js";

const isMongoActive = () => mongoose.connection && mongoose.connection.readyState === 1;

export class ProyectoRepository {
    static #proyectos = [];
    static #nextId = 1;

    static #aDominio(doc) {
        if (!doc) return null;
        const colectivo = doc.colectivo instanceof Colectivo
            ? doc.colectivo
            : (doc.colectivo ? new Colectivo(doc.colectivo) : null);
        if (colectivo && doc.colectivo?.id) {
            colectivo.id = doc.colectivo.id;
        }

        const hitos = Array.isArray(doc.hitos)
            ? doc.hitos.map((h) => (h instanceof Hito ? h : new Hito(h)))
            : [];

        const perfiles = Array.isArray(doc.perfiles)
            ? doc.perfiles.map((p) => (p instanceof Perfil ? p : new Perfil(p)))
            : [];

        const colaboraciones = Array.isArray(doc.colaboraciones)
            ? doc.colaboraciones.map((c) => (c instanceof Colaboracion ? c : new Colaboracion(c)))
            : [];

        const proy = new Proyecto({
            id: doc.id,
            titulo: doc.titulo,
            descripcion: doc.descripcion,
            unidadCompromiso: doc.unidadCompromiso,
            cantidadHoras: doc.cantidadHoras,
            modalidadesColaboracion: doc.modalidadesColaboracion?.length ? doc.modalidadesColaboracion : undefined,
            fechaAlta: doc.fechaAlta,
            enlaceSistemaEnFuncionamiento: doc.enlaceSistemaEnFuncionamiento,
            enlaceCodigoFuente: doc.enlaceCodigoFuente,
            colectivo,
            habilidadesRequeridas: doc.habilidadesRequeridas?.length ? doc.habilidadesRequeridas : undefined,
            perfiles,
            hitos,
            colaboraciones
        });
        proy.id = doc.id;
        if (doc.estado) proy.estado = doc.estado;
        if (doc.fechaCierre) proy.fechaCierre = doc.fechaCierre;
        return proy;
    }

    static async guardar(proyecto) {
        if (!proyecto.id) {
            proyecto.id = `proy-${this.#nextId++}`;
        }

        if (isMongoActive()) {
            const colectivoJson = proyecto.colectivo
                ? {
                    id: proyecto.colectivo.id,
                    nombre: proyecto.colectivo.nombre,
                    descripcion: proyecto.colectivo.descripcion,
                    tipo: proyecto.colectivo.tipo,
                    ubicacion: proyecto.colectivo.ubicacion
                }
                : null;

            const hitosJson = Array.isArray(proyecto.hitos)
                ? proyecto.hitos.map((h) => ({
                    id: h.id,
                    fecha: h.fecha,
                    porcentajeConcrecion: h.porcentajeConcrecion,
                    descripcion: h.descripcion
                }))
                : [];

            const perfilesJson = Array.isArray(proyecto.perfiles)
                ? proyecto.perfiles.map((p) => (typeof p.toJSON === "function" ? p.toJSON() : p))
                : [];

            const colaboracionesJson = Array.isArray(proyecto.colaboraciones)
                ? proyecto.colaboraciones.map((c) => ({
                    id: c.id,
                    fechaInscripcion: c.fechaInscripcion,
                    personaColaboradoraId: c.personaColaboradora?.id,
                    personaColaboradora: c.personaColaboradora ? {
                        id: c.personaColaboradora.id,
                        nombreFantasia: c.personaColaboradora.nombreFantasia,
                        nombre: c.personaColaboradora.nombre,
                        apellido: c.personaColaboradora.apellido
                    } : null
                }))
                : [];

            await ProyectoModel.findOneAndUpdate(
                { id: proyecto.id },
                {
                    id: proyecto.id,
                    titulo: proyecto.titulo,
                    descripcion: proyecto.descripcion,
                    unidadCompromiso: proyecto.unidadCompromiso,
                    cantidadHoras: proyecto.cantidadHoras,
                    modalidadesColaboracion: proyecto.modalidadesColaboracion,
                    estado: proyecto.estado,
                    fechaAlta: proyecto.fechaAlta,
                    fechaCierre: proyecto.fechaCierre,
                    enlaceSistemaEnFuncionamiento: proyecto.enlaceSistemaEnFuncionamiento,
                    enlaceCodigoFuente: proyecto.enlaceCodigoFuente,
                    colectivoId: proyecto.colectivo?.id,
                    colectivo: colectivoJson,
                    habilidadesRequeridas: proyecto.habilidadesRequeridas,
                    perfiles: perfilesJson,
                    hitos: hitosJson,
                    colaboraciones: colaboracionesJson
                },
                { upsert: true, returnDocument: "after" }
            );
        }

        const index = this.#proyectos.findIndex((p) => p.id === proyecto.id);
        if (index >= 0) {
            this.#proyectos[index] = proyecto;
        } else {
            this.#proyectos.push(proyecto);
        }
        return proyecto;
    }

    static async buscarTodos() {
        if (isMongoActive()) {
            const docs = await ProyectoModel.find().lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return [...this.#proyectos];
    }

    static async buscarPorId(id) {
        if (isMongoActive()) {
            const doc = await ProyectoModel.findOne({ id }).lean();
            return this.#aDominio(doc);
        }
        return this.#proyectos.find((p) => p.id === id) || null;
    }

    static async buscarPorHabilidadesRequeridas(codigos) {
        if (!Array.isArray(codigos) || codigos.length === 0) {
            return [];
        }
        if (isMongoActive()) {
            const docs = await ProyectoModel.find({
                "perfiles.habilidadesRequeridas.codigo": { $in: codigos }
            }).lean();
            return docs.map((d) => this.#aDominio(d));
        }
        return this.#proyectos.filter((proyecto) =>
            proyecto.perfiles.some((perfil) =>
                perfil.codigosRequeridos().some((codigo) => codigos.includes(codigo))
            )
        );
    }

    static async eliminarPorId(id) {
        if (isMongoActive()) {
            const res = await ProyectoModel.deleteOne({ id });
            const idx = this.#proyectos.findIndex((c) => c.id === id);
            if (idx >= 0) this.#proyectos.splice(idx, 1);
            return res.deletedCount > 0;
        }
        const index = this.#proyectos.findIndex((p) => p.id === id);
        if (index === -1) {
            return false;
        }
        this.#proyectos.splice(index, 1);
        return true;
    }

    static async limpiar() {
        if (isMongoActive()) {
            await ProyectoModel.deleteMany({});
        }
        this.#proyectos = [];
        this.#nextId = 1;
    }
}
