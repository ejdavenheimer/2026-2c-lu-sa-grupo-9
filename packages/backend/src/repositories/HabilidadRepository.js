import { ConflictError } from "../errors/AppError.js";

export class HabilidadRepository {
    static #habilidades = [];

    static guardar(habilidad) {
        const existe = this.#habilidades.some((h) => h.codigo === habilidad.codigo);
        if (existe) {
            throw new ConflictError(`Ya existe una habilidad con el código '${habilidad.codigo}'`);
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

    static actualizar(codigo, habilidadActualizada) {
        const index = this.#habilidades.findIndex((h) => h.codigo === codigo);
        if (index === -1) {
            throw new Error(`No se encontró la habilidad con el código '${codigo}'`);
        }
        this.#habilidades[index] = habilidadActualizada;
        return habilidadActualizada;
    }

    static eliminarPorCodigo(codigo) {
        const index = this.#habilidades.findIndex((h) => h.codigo === codigo);
        if (index === -1) {
            return false;
        }
        this.#habilidades.splice(index, 1);
        return true;
    }

    static limpiar() {
        this.#habilidades = [];
    }
}
