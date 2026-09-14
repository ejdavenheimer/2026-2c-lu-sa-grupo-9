import { EstadoProyecto } from "./enums.js";
import { Colaboracion } from "./Colaboracion.js";

export class Proyecto {
    constructor({
        id,
        titulo,
        descripcion,
        unidadCompromiso,
        cantidadHoras,
        modalidadesColaboracion,
        fechaAlta,
        colectivo,
        habilidadesRequeridas,
        colaboraciones = []
    } = {}) {
        if (!titulo || !descripcion || !unidadCompromiso || !cantidadHoras || !modalidadesColaboracion || !colectivo || !habilidadesRequeridas) {
            throw new Error("El proyecto requiere: titulo, descripcion, unidadCompromiso, cantidadHoras, modalidadesColaboracion, colectivo y habilidadesRequeridas");
        }
        this.id = id;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.unidadCompromiso = unidadCompromiso;
        this.cantidadHoras = cantidadHoras;
        this.modalidadesColaboracion = modalidadesColaboracion;
        this.estado = EstadoProyecto.PUBLICADO;
        this.fechaAlta = fechaAlta || new Date();
        this.fechaCierre = undefined;
        this.colectivo = colectivo;
        this.habilidadesRequeridas = habilidadesRequeridas;
        this.colaboraciones = colaboraciones;
    }

    agregarColaboracion(personaColaboradora) {
        if (this.estado !== EstadoProyecto.PUBLICADO || this.fechaCierre !== undefined) {
            throw new Error("No se pueden agregar colaboraciones a un proyecto cerrado");
        }
        if (!this.validarColaborador(personaColaboradora)) {
            throw new Error("El colaborador no cuenta con las habilidades requeridas para este proyecto");
        }

        const nuevaColaboracion = new Colaboracion({
            personaColaboradora,
            proyecto: this,
            fechaInscripcion: new Date()
        });

        this.colaboraciones.push(nuevaColaboracion);
        if (typeof personaColaboradora.agregarColaboracion === "function") {
            personaColaboradora.agregarColaboracion(nuevaColaboracion);
        }

        return nuevaColaboracion;
    }

    validarColaborador(personaColaboradora) {
        if (!personaColaboradora || !Array.isArray(personaColaboradora.habilidades)) {
            return false;
        }
        return this.habilidadesRequeridas.some((habilidadRequerida) =>
            personaColaboradora.habilidades.some((h) => h.codigo === habilidadRequerida.codigo)
        );
    }

    cerrarProyecto() {
        this.fechaCierre = new Date();
        this.estado = EstadoProyecto.CERRADO;
    }

    toJSON() {
        return {
            id: this.id,
            titulo: this.titulo,
            descripcion: this.descripcion,
            unidadCompromiso: this.unidadCompromiso,
            cantidadHoras: this.cantidadHoras,
            modalidadesColaboracion: this.modalidadesColaboracion,
            estado: this.estado,
            fechaAlta: this.fechaAlta,
            fechaCierre: this.fechaCierre,
            colectivo: this.colectivo ? {
                id: this.colectivo.id,
                nombre: this.colectivo.nombre,
                descripcion: this.colectivo.descripcion,
                tipo: this.colectivo.tipo,
                ubicacion: this.colectivo.ubicacion
            } : null,
            habilidadesRequeridas: this.habilidadesRequeridas,
            colaboraciones: this.colaboraciones.map((c) => ({
                id: c.id,
                fechaInscripcion: c.fechaInscripcion,
                personaColaboradora: c.personaColaboradora ? {
                    id: c.personaColaboradora.id,
                    nombreFantasia: c.personaColaboradora.nombreFantasia,
                    nombre: c.personaColaboradora.nombre,
                    apellido: c.personaColaboradora.apellido
                } : null
            }))
        };
    }
}


