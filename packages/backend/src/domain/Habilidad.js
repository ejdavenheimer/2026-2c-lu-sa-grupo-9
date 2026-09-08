export class Habilidad {
    constructor({titulo, codigo, descripcion}) {
        if (!titulo || !codigo || !descripcion) {
            throw new Error("La habilidad requiere un titulo, codigo y descripcion");
        }
        this.titulo = titulo;
        this.codigo = codigo;
        this.descripcion = descripcion;
    }
}