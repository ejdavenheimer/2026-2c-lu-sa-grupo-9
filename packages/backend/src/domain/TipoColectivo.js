export class TipoColectivo {
    constructor({ id, nombre }) {
        if (!nombre) throw new Error("El nombre es requerido");
        this.id = id;
        this.nombre = nombre;
    }
}