export class HabilidadRepository {
    static #habilidades = [];

    static guardar(habilidad) {
        const existe = this.#habilidades.some((h) => h.codigo === habilidad.codigo);
        if (existe) {
            throw new Error(`Ya existe una habilidad con el código '${habilidad.codigo}'`);
        }
        this.#habilidades.push(habilidad);
        return habilidad;
    }

    static buscarTodos() {
        return [...this.#habilidades];
    }

    static buscarPorCodigo(codigo) {
        return this.#habilidades.find((h) => h.codigo === codigo) || null;
    }

    static limpiar() {
        this.#habilidades = [];
    }
}
