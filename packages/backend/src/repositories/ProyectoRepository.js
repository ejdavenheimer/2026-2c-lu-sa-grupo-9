export class ProyectoRepository {
    static #proyectos = [];
    static #nextId = 1;

    static guardar(proyecto) {
        if (!proyecto.id) {
            proyecto.id = `proy-${this.#nextId++}`;
        }
        const index = this.#proyectos.findIndex((p) => p.id === proyecto.id);
        if (index >= 0) {
            this.#proyectos[index] = proyecto;
        } else {
            this.#proyectos.push(proyecto);
        }
        return proyecto;
    }

    static buscarTodos() {
        return [...this.#proyectos];
    }

    static buscarPorId(id) {
        return this.#proyectos.find((p) => p.id === id) || null;
    }

    static async buscarPorHabilidadesRequeridas(codigos) {
        if (!Array.isArray(codigos) || codigos.length === 0) {
            return [];
        }
        return this.#proyectos.filter((proyecto) =>
            proyecto.perfiles.some((perfil) =>
                perfil.codigosRequeridos().some((codigo) => codigos.includes(codigo))
            )
        );
    }

    static eliminarPorId(id) {
        const index = this.#proyectos.findIndex((p) => p.id === id);
        if (index === -1) {
            return false;
        }
        this.#proyectos.splice(index, 1);
        return true;
    }

    static limpiar() {
        this.#proyectos = [];
        this.#nextId = 1;
    }
}
