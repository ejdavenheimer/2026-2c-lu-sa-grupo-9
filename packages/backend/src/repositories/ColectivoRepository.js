export class ColectivoRepository {
    static #colectivos = [];
    static #nextId = 1;

    static guardar(colectivo) {
        if (!colectivo.id) {
            colectivo.id = `col-${this.#nextId++}`;
        }
        const index = this.#colectivos.findIndex((c) => c.id === colectivo.id || c.nombre === colectivo.nombre);
        if (index >= 0) {
            this.#colectivos[index] = colectivo;
        } else {
            this.#colectivos.push(colectivo);
        }
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
