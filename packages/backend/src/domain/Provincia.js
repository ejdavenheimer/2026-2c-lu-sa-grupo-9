import { UnprocessableEntityError } from "../errors/AppError.js";

export class Provincia {
    constructor({nombre}) {
        if (!nombre) throw new UnprocessableEntityError("El nombre es requerido");
        this.nombre = nombre;
    }
}