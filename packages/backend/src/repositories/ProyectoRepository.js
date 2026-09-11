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

    static limpiar() {
        this.#proyectos = [];
        this.#nextId = 1;
    }
}
