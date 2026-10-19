import { EstadoProyecto } from './enums.js'
import { ConflictError, NotFoundError, UnprocessableEntityError } from '../errors/AppError.js'
import {randomUUID} from "crypto";

export class Colectivo {
    constructor({ id, nombre, descripcion, tipo, ubicacion }) {
        if (!nombre || !tipo) {
            throw new UnprocessableEntityError('El colectivo debe poseer un nombre y un tipo');
        }
        this.id = id || randomUUID();
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.ubicacion = ubicacion;
        this.proyectos = [];
    }

    agregarProyecto(proyecto) {
        if (!proyecto) {
            throw new UnprocessableEntityError('Debe proporcionar un proyecto válido');
        }
        const indice = this.proyectos.findIndex((p) => p.titulo === proyecto.titulo);
        if (indice !== -1) {
            throw new ConflictError(`El proyecto '${proyecto.titulo}' ya existe en el colectivo`);
        }
        this.proyectos.push(proyecto);
    }

    finalizarProyecto(proyecto) {
        if (!proyecto) {
            throw new UnprocessableEntityError('Debe proporcionar un proyecto válido');
        }
        const indice = this.proyectos.findIndex((p) => p.titulo === proyecto.titulo);
        if (indice === -1) {
            throw new NotFoundError(`El proyecto '${proyecto.titulo}' no pertenece a este colectivo`);
        }
        const proyectoExistente = this.proyectos[indice];
        proyectoExistente.cerrarProyecto();
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            tipo: this.tipo,
            ubicacion: this.ubicacion,
            proyectos: this.proyectos.map((p) => ({
                id: p.id,
                titulo: p.titulo,
                descripcion: p.descripcion,
                estado: p.estado,
                unidadCompromiso: p.unidadCompromiso,
                cantidadHoras: p.cantidadHoras,
                modalidadesColaboracion: p.modalidadesColaboracion,
                fechaAlta: p.fechaAlta,
                fechaCierre: p.fechaCierre
            }))
        };
    }
}