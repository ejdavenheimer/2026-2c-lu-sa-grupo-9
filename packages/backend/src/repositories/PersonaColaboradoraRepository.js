export class PersonaColaboradoraRepository {
    static #colaboradores = [];
    static #nextId = 1;

    static guardar(colaborador) {
        if (!colaborador.id) {
            colaborador.id = `colab-${this.#nextId++}`;
        }
        const index = this.#colaboradores.findIndex(
            (c) => c.id === colaborador.id || (colaborador.nombreFantasia && c.nombreFantasia === colaborador.nombreFantasia)
        );
        if (index >= 0) {
            this.#colaboradores[index] = colaborador;
        } else {
            this.#colaboradores.push(colaborador);
        }
        return colaborador;
    }

    static buscarTodos() {
        return [...this.#colaboradores];
    }

    static buscarPorId(id) {
        return this.#colaboradores.find((c) => c.id === id) || null;
    }

    static limpiar() {
        this.#colaboradores = [];
        this.#nextId = 1;
    }
}
