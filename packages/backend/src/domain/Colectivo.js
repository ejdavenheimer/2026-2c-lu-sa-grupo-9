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
        if (!proyecto) {
            throw new Error('Debe proporcionar un proyecto válido');
        }
        const indice = this.proyectos.findIndex((p) => p.titulo === proyecto.titulo);
        if (indice !== -1) {
            throw new Error(`El proyecto '${proyecto.titulo}' ya existe en el colectivo`);
        }
        this.proyectos.push(proyecto);
    }

    finalizarProyecto(proyecto) {
        if (!proyecto) {
            throw new Error('Debe proporcionar un proyecto válido');
        }
        const indice = this.proyectos.findIndex((p) => p.titulo === proyecto.titulo);
        if (indice === -1) {
            throw new Error(`El proyecto '${proyecto.titulo}' no pertenece a este colectivo`);
        }
        const proyectoExistente = this.proyectos[indice];
        proyectoExistente.cerrarProyecto();
    }



}