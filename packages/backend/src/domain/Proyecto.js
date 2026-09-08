import { EstadoProyecto } from "./enums.js";
import { Colaboracion } from "./Colaboracion.js";

export class Proyecto {
    constructor({
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
            throw new Error("El proyecto requiere titulo, descripcion, unidadCompromiso, cantidadHoras, modalidadesColaboracion, colectivo y habilidadesRequeridas");
        }
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
}


