export class PerfilRepository {
    static #perfiles = [];

    static async #guardarEnMongo(perfil) {
        try {
            const mongooseModule = await import("mongoose").catch(() => null);
            if (!mongooseModule) return;
            const mongoose = mongooseModule.default || mongooseModule;
            if (mongoose.connection && mongoose.connection.readyState === 1) {
                const { PerfilModel } = await import("../schemas/PerfilSchema.js").catch(() => ({}));
                if (!PerfilModel) return;
                const json = typeof perfil.toJSON === "function" ? perfil.toJSON() : perfil;
                await PerfilModel.findOneAndUpdate(
                    { id: perfil.id },
                    {
                        id: perfil.id,
                        descripcion: json.descripcion,
                        habilidadesObligatorias: json.habilidadesObligatorias,
                        habilidadesOpcionales: json.habilidadesOpcionales,
                        unidadCompromiso: json.unidadCompromiso,
                        cantidadHoras: json.cantidadHoras,
                        modalidadesColaboracion: json.modalidadesColaboracion,
                        proyectoId: json.proyectoId || (perfil.proyecto?.id || perfil.proyecto)
                    },
                    { upsert: true, new: true }
                );
            }
        } catch (err) {
            console.error("Error al persistir Perfil en MongoDB:", err.message);
        }
    }

    static async #eliminarDeMongo(id) {
        try {
            const mongooseModule = await import("mongoose").catch(() => null);
            if (!mongooseModule) return;
            const mongoose = mongooseModule.default || mongooseModule;
            if (mongoose.connection && mongoose.connection.readyState === 1) {
                const { PerfilModel } = await import("../schemas/PerfilSchema.js").catch(() => ({}));
                if (!PerfilModel) return;
                await PerfilModel.deleteOne({ id });
            }
        } catch (err) {
            console.error("Error al eliminar Perfil de MongoDB:", err.message);
        }
    }

    static guardar(perfil) {
        const index = this.#perfiles.findIndex((p) => p.id === perfil.id);
        if (index >= 0) {
            this.#perfiles[index] = perfil;
        } else {
            this.#perfiles.push(perfil);
        }
        this.#guardarEnMongo(perfil);
        return perfil;
    }

    static buscarTodos() {
        return [...this.#perfiles];
    }

    static buscarPorId(id) {
        return this.#perfiles.find((p) => p.id === id) || null;
    }

    static buscarPorProyectoId(proyectoId) {
        return this.#perfiles.filter((p) => {
            const pid = p.proyecto?.id || p.proyectoId || (typeof p.proyecto === "string" ? p.proyecto : null);
            return pid === proyectoId;
        });
    }

    static buscarPorProyectoYPerfilId(proyectoId, perfilId) {
        return this.#perfiles.find((p) => {
            const pid = p.proyecto?.id || p.proyectoId || (typeof p.proyecto === "string" ? p.proyecto : null);
            return pid === proyectoId && p.id === perfilId;
        }) || null;
    }

    static eliminarPorId(id) {
        const index = this.#perfiles.findIndex((p) => p.id === id);
        if (index === -1) {
            return false;
        }
        this.#perfiles.splice(index, 1);
        this.#eliminarDeMongo(id);
        return true;
    }

    static limpiar() {
        this.#perfiles = [];
    }
}
