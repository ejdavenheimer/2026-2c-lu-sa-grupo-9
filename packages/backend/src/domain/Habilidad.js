import { UnprocessableEntityError } from "../errors/AppError.js";

export class Habilidad {
    constructor({ titulo, codigo, descripcion = "" } = {}) {
        if (!titulo || !codigo) {
            throw new UnprocessableEntityError("La habilidad requiere un titulo y codigo");
        }
        this.titulo = titulo;
        this.codigo = codigo;
        this.descripcion = descripcion !== undefined && descripcion !== null ? String(descripcion) : "";
    }
}