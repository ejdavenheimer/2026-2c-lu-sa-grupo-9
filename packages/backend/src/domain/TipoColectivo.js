import { UnprocessableEntityError } from "../errors/AppError.js";

export class TipoColectivo {
    constructor({ id, nombre }) {
        if (!nombre) throw new UnprocessableEntityError("El nombre es requerido");
        this.id = id;
        this.nombre = nombre;
    }
}