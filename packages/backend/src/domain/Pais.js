import { UnprocessableEntityError } from "../errors/AppError.js";

export class Pais {
    constructor({nombre}) {
        if (!nombre) throw new UnprocessableEntityError("El nombre es requerido");
        this.nombre = nombre;
    }
}