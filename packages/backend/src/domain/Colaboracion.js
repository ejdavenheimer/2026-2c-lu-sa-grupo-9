export class Colaboracion {
    constructor({ id, personaColaboradoraId, proyectoId, fechaInscripcion }) {
        if (!personaColaboradoraId || !proyectoId) {
            throw new Error('La colaboracion debe tener una persona colaboradora y un proyecto');
        }

        this.id = id;
        this.personaColaboradoraId = personaColaboradoraId;
        this.proyectoId = proyectoId;
        this.fechaInscripcion = fechaInscripcion || new Date().toISOString();
    }
}