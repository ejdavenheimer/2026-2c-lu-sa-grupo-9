export class Provincia {
    constructor({nombre}) {
        if (!nombre) throw new Error("El nombre es requerido");
        this.nombre = nombre;
    }
}