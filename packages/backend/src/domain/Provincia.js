export class Provincia {
    constructor({ id = null, nombre } = {}) {
        if (!nombre) throw new Error("El nombre es requerido");
        this.id = id;
        this.nombre = nombre;
    }
}