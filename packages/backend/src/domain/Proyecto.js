import { EstadoProyecto } from "./enums.js";
import { Colaboracion } from "./Colaboracion.js";
import { Hito } from "./Hito.js";
import { ConflictError, NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class Proyecto {
    constructor({
        id,
        titulo,
        descripcion,
        unidadCompromiso,
        cantidadHoras,
        modalidadesColaboracion,
        fechaAlta,
        enlaceSistemaEnFuncionamiento,
        enlaceCodigoFuente,
        colectivo,
        habilidadesRequeridas,
        hitos = [],
        colaboraciones = []
    } = {}) {
        if (!titulo || !descripcion || !unidadCompromiso || !cantidadHoras || !modalidadesColaboracion || !colectivo || !habilidadesRequeridas) {
            throw new UnprocessableEntityError("El proyecto requiere: titulo, descripcion, unidadCompromiso, cantidadHoras, modalidadesColaboracion, colectivo y habilidadesRequeridas");
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
        this.enlaceSistemaEnFuncionamiento = enlaceSistemaEnFuncionamiento;
        this.enlaceCodigoFuente = enlaceCodigoFuente;
        this.colectivo = colectivo;
        this.habilidadesRequeridas = habilidadesRequeridas;
        this.hitos = hitos;
        this.colaboraciones = colaboraciones;
    }

    agregarColaboracion(personaColaboradora) {
        if (this.estado !== EstadoProyecto.PUBLICADO || this.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden agregar colaboraciones a un proyecto cerrado");
        }
        if (!this.validarColaborador(personaColaboradora)) {
            throw new UnprocessableEntityError("El colaborador no cuenta con las habilidades requeridas para este proyecto");
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

    actualizarEnlaces({ enlaceSistemaEnFuncionamiento, enlaceCodigoFuente } = {}) {
        if (enlaceSistemaEnFuncionamiento !== undefined) {
            this.enlaceSistemaEnFuncionamiento = enlaceSistemaEnFuncionamiento;
        }
        if (enlaceCodigoFuente !== undefined) {
            this.enlaceCodigoFuente = enlaceCodigoFuente;
        }
    }

    agregarHito({ fecha, porcentajeConcrecion, descripcion } = {}) {
        if (this.estado !== EstadoProyecto.PUBLICADO || this.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden agregar hitos a un proyecto cerrado");
        }
        if (!this.validarHito(porcentajeConcrecion)) {
            throw new UnprocessableEntityError("El porcentaje de concreción debe ser mayor al del último hito registrado");
        }

        const nuevoHito = new Hito({
            fecha,
            porcentajeConcrecion,
            descripcion,
            proyecto: this
        });

        this.hitos.push(nuevoHito);
        return nuevoHito;
    }

    validarHito(porcentajeConcrecion) {
        const ultimoHito = this.hitos[this.hitos.length - 1];
        return !ultimoHito || porcentajeConcrecion > ultimoHito.porcentajeConcrecion;
    }

    getHito(hitoId) {
        const hito = this.hitos.find((h) => h.id === hitoId);
        if (!hito) {
            throw new NotFoundError(`Hito con id ${hitoId} no encontrado`);
        }
        return hito;
    }

    eliminarHito(hitoId) {
        const hito = this.getHito(hitoId);
        this.hitos = this.hitos.filter((h) => h.id !== hito.id);
    }

    actualizarHito(hitoId, { porcentajeConcrecion, descripcion } = {}) {
        const hito = this.getHito(hitoId);

        if (descripcion !== undefined) {
            hito.descripcion = descripcion;
        }

        if (porcentajeConcrecion !== undefined) {
            const posicion = this.hitos.findIndex((h) => h.id === hito.id);
            const hitoAnterior = this.hitos[posicion - 1];
            const hitoSiguiente = this.hitos[posicion + 1];

            if (hitoAnterior && porcentajeConcrecion <= hitoAnterior.porcentajeConcrecion) {
                throw new UnprocessableEntityError("El porcentaje de concreción debe ser mayor al del hito anterior");
            }
            if (hitoSiguiente && porcentajeConcrecion >= hitoSiguiente.porcentajeConcrecion) {
                throw new UnprocessableEntityError("El porcentaje de concreción debe ser menor al del hito siguiente");
            }
            hito.porcentajeConcrecion = porcentajeConcrecion;
        }
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
            enlaceSistemaEnFuncionamiento: this.enlaceSistemaEnFuncionamiento,
            enlaceCodigoFuente: this.enlaceCodigoFuente,
            colectivo: this.colectivo ? {
                id: this.colectivo.id,
                nombre: this.colectivo.nombre,
                descripcion: this.colectivo.descripcion,
                tipo: this.colectivo.tipo,
                ubicacion: this.colectivo.ubicacion
            } : null,
            habilidadesRequeridas: this.habilidadesRequeridas,
            hitos: this.hitos.map((h) => ({
                id: h.id,
                fecha: h.fecha,
                porcentajeConcrecion: h.porcentajeConcrecion,
                descripcion: h.descripcion
            })),
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


