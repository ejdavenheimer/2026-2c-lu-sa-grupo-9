import { randomUUID } from "crypto";

export class Colaboracion {
    constructor({ id, personaColaboradora, proyecto, fechaInscripcion } = {}) {
        if (!personaColaboradora || !proyecto) {
            throw new Error('La colaboracion debe tener una persona colaboradora y un proyecto');
        }

        this.id = id || randomUUID();
        this.personaColaboradora = personaColaboradora;
        this.proyecto = proyecto;
        this.fechaInscripcion = fechaInscripcion || new Date();
    }

    toJSON() {
        return {
            id: this.id,
            fechaInscripcion: this.fechaInscripcion,
            personaColaboradora: this.personaColaboradora ? {
                id: this.personaColaboradora.id,
                nombreFantasia: this.personaColaboradora.nombreFantasia,
                nombre: this.personaColaboradora.nombre,
                apellido: this.personaColaboradora.apellido,
                pronombres: this.personaColaboradora.pronombres,
                presentacion: this.personaColaboradora.presentacion,
                cuentas: this.personaColaboradora.cuentas,
                habilidades: this.personaColaboradora.habilidades
            } : null,
            proyecto: this.proyecto ? {
                id: this.proyecto.id,
                titulo: this.proyecto.titulo,
                descripcion: this.proyecto.descripcion,
                estado: this.proyecto.estado
            } : null
        };
    }
}