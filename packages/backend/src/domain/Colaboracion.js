import { randomUUID } from "crypto";
import { UnprocessableEntityError } from "../errors/AppError.js";

export class Colaboracion {
    constructor({ id, personaColaboradora, proyecto, fechaInscripcion, esAnonima = false } = {}) {
        if (!personaColaboradora || !proyecto) {
            throw new UnprocessableEntityError('La colaboracion debe tener una persona colaboradora y un proyecto');
        }

        this.id = id || randomUUID();
        this.personaColaboradora = personaColaboradora;
        this.proyecto = proyecto;
        this.fechaInscripcion = fechaInscripcion || new Date();
        this.esAnonima = Boolean(esAnonima);
    }

    toJSON() {
        return {
            id: this.id,
            fechaInscripcion: this.fechaInscripcion,
            esAnonima: this.esAnonima,
            personaColaboradora: this.esAnonima ? null : (this.personaColaboradora ? {
                id: this.personaColaboradora.id,
                nombreFantasia: this.personaColaboradora.nombreFantasia,
                nombre: this.personaColaboradora.nombre,
                apellido: this.personaColaboradora.apellido,
                pronombres: this.personaColaboradora.pronombres,
                presentacion: this.personaColaboradora.presentacion,
                cuentas: this.personaColaboradora.cuentas,
                habilidades: this.personaColaboradora.habilidades
            } : null),
            proyecto: this.proyecto ? {
                id: this.proyecto.id,
                titulo: this.proyecto.titulo,
                descripcion: this.proyecto.descripcion,
                estado: this.proyecto.estado
            } : null
        };
    }
}