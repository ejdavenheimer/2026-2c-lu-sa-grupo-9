import { EstadoProyecto } from './enums.js'

export class Colectivo {
    constructor({ nombre, descripcion, tipo, ubicacion }) {
        if (!nombre || !tipo) {
            throw new Error('El colectivo debe poseer un nombre y un tipo');
        }
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.ubicacion = ubicacion;
        this.proyectos = [];
    }

    agregarProyecto(proyecto) {
        const indice = this.proyectos.findIndex((p) => p.titulo === proyecto.titulo);
        if (indice === -1) {
            this.proyectos.push(proyecto);
        }
    }

    finalizarProyecto(proyecto) {
        const indice = this.proyectos.findIndex((p) => p.titulo === proyecto.titulo);
        const proyectoExistente = this.proyectos[indice];
        proyectoExistente.cerrarProyecto();
    }


}