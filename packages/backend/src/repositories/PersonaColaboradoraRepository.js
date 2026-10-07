import { ConflictError } from "../errors/AppError.js";

export class PersonaColaboradoraRepository {
    static #colaboradores = [];
    static #nextId = 1;

    static guardar(colaborador) {
        if (colaborador.id) {
            const index = this.#colaboradores.findIndex((c) => c.id === colaborador.id);
            if (index >= 0) {
                this.#colaboradores[index] = colaborador;
                return colaborador;
            }
        }

        if (colaborador.nombreFantasia) {
            const existePorNombre = this.#colaboradores.some(
                (c) => c.nombreFantasia && c.nombreFantasia === colaborador.nombreFantasia
            );
            if (existePorNombre) {
                throw new ConflictError(`Ya existe una persona colaboradora con el nombre de fantasía '${colaborador.nombreFantasia}'`);
            }
        }

        if (!colaborador.id) {
            colaborador.id = `colab-${this.#nextId++}`;
        }
        this.#colaboradores.push(colaborador);
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

