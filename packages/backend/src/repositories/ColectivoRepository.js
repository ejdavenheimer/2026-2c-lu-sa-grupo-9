export class ColectivoRepository {
    static #colectivos = [];
    static #nextId = 1;

    static guardar(colectivo) {
        if (colectivo.id) {
            const index = this.#colectivos.findIndex((c) => c.id === colectivo.id);
            if (index >= 0) {
                this.#colectivos[index] = colectivo;
                return colectivo;
            }
        }

        const existePorNombre = this.#colectivos.some((c) => c.nombre === colectivo.nombre);
        if (existePorNombre) {
            throw new Error(`Ya existe un colectivo con el nombre '${colectivo.nombre}'`);
        }

        if (!colectivo.id) {
            colectivo.id = `col-${this.#nextId++}`;
        }
        this.#colectivos.push(colectivo);
        return colectivo;
    }

    static buscarTodos() {
        return [...this.#colectivos];
    }

    static buscarPorId(id) {
        return this.#colectivos.find((c) => c.id === id) || null;
    }

    static limpiar() {
        this.#colectivos = [];
        this.#nextId = 1;
    }
}

