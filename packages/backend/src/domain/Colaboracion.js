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
}