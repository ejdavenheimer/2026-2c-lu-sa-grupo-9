export class Pais {
    constructor({ id = null, nombre } = {}) {
        if (!nombre) throw new Error("El nombre es requerido");
        this.id = id;
        this.nombre = nombre;
    }
}