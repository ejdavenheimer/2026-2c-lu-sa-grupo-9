import { randomUUID } from "crypto";
import { UnprocessableEntityError } from "../errors/AppError.js";

export class Hito {
    constructor({ id, fecha, porcentajeConcrecion, descripcion, proyecto } = {}) {
        if (!descripcion || !proyecto) {
            throw new UnprocessableEntityError('El hito debe tener una descripcion y un proyecto');
        }
        if (!Number.isFinite(porcentajeConcrecion) || porcentajeConcrecion < 0 || porcentajeConcrecion > 100) {
            throw new UnprocessableEntityError('El porcentaje de concreción debe ser un número entre 0 y 100 (inclusive)');
        }
        this.id = id || randomUUID();
        this.fecha = fecha || new Date();
        this.porcentajeConcrecion = porcentajeConcrecion;
        this.descripcion = descripcion;
        this.proyecto = proyecto;
    }

    toJSON() {
        return {
            id: this.id,
            fecha: this.fecha,
            porcentajeConcrecion: this.porcentajeConcrecion,
            descripcion: this.descripcion,
            proyecto: this.proyecto ? {
                id: this.proyecto.id,
                titulo: this.proyecto.titulo,
                descripcion: this.proyecto.descripcion,
                estado: this.proyecto.estado
            } : null
        };
    }
}
