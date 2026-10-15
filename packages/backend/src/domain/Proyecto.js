import { EstadoProyecto } from "./enums.js";
import { Colaboracion } from "./Colaboracion.js";
import { Perfil } from "./Perfil.js";
import { Compatibilidad } from "./Compatibilidad.js";
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
        colectivo,
        habilidadesRequeridas,
        perfiles = [],
        colaboraciones = []
    } = {}) {
        const tienePerfiles = Array.isArray(perfiles) && perfiles.length > 0;
        const tieneConfigLegada = Boolean(
            unidadCompromiso &&
            cantidadHoras &&
            modalidadesColaboracion &&
            habilidadesRequeridas
        );

        if (!titulo || !descripcion || !colectivo || (!tienePerfiles && !tieneConfigLegada)) {
            throw new UnprocessableEntityError(
                "El proyecto requiere: titulo, descripcion, colectivo, y al menos un perfil o la configuracion requerida (unidadCompromiso, cantidadHoras, modalidadesColaboracion y habilidadesRequeridas)"
            );
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
        this.perfiles = [];
        this.colaboraciones = colaboraciones;

        if (Array.isArray(perfiles)) {
            for (const p of perfiles) {
                this.agregarPerfil(p);
            }
        }
    }

    agregarPerfil(perfil) {
        if (this.estado !== EstadoProyecto.PUBLICADO || this.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden agregar perfiles a un proyecto cerrado");
        }
        if (!perfil) {
            throw new UnprocessableEntityError("Debe proporcionar un perfil válido");
        }
        const perfilInstancia = perfil instanceof Perfil ? perfil : new Perfil({ ...perfil, proyecto: this });
        perfilInstancia.proyecto = this;
        this.perfiles.push(perfilInstancia);
        return perfilInstancia;
    }

    obtenerPerfil(perfilId) {
        return this.perfiles.find((p) => p.id === perfilId) || null;
    }

    quitarPerfil(perfilId) {
        if (this.estado !== EstadoProyecto.PUBLICADO || this.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden eliminar perfiles de un proyecto cerrado");
        }
        const index = this.perfiles.findIndex((p) => p.id === perfilId);
        if (index === -1) {
            return false;
        }
        this.perfiles.splice(index, 1);
        return true;
    }

    modificarPerfil(perfilId, datos) {
        if (this.estado !== EstadoProyecto.PUBLICADO || this.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden modificar perfiles de un proyecto cerrado");
        }
        const perfil = this.obtenerPerfil(perfilId);
        if (!perfil) {
            throw new NotFoundError(`No se encontró el perfil con ID '${perfilId}'`);
        }
        if (datos.descripcion !== undefined) {
            if (!datos.descripcion || typeof datos.descripcion !== "string" || !datos.descripcion.trim()) {
                throw new UnprocessableEntityError("La descripción no puede estar vacía");
            }
            perfil.descripcion = datos.descripcion.trim();
        }
        if (datos.nombre !== undefined) {
            if (!datos.nombre || typeof datos.nombre !== "string" || !datos.nombre.trim()) {
                throw new UnprocessableEntityError("El nombre no puede estar vacío");
            }
            perfil.nombre = datos.nombre.trim();
        }
        if (datos.habilidadesRequeridas !== undefined) {
            if (!Array.isArray(datos.habilidadesRequeridas) || datos.habilidadesRequeridas.length === 0) {
                throw new UnprocessableEntityError("El perfil requiere al menos una habilidad requerida");
            }
            perfil.habilidadesRequeridas = datos.habilidadesRequeridas;
        }
        if (datos.habilidadesOpcionales !== undefined) {
            perfil.habilidadesOpcionales = Array.isArray(datos.habilidadesOpcionales) ? datos.habilidadesOpcionales : [];
        }
        if (datos.unidadCompromiso !== undefined) {
            perfil.unidadCompromiso = datos.unidadCompromiso;
        }
        if (datos.cantidadHoras !== undefined) {
            if (typeof datos.cantidadHoras !== "number" || datos.cantidadHoras <= 0) {
                throw new UnprocessableEntityError("La cantidad de horas debe ser un número positivo");
            }
            perfil.cantidadHoras = datos.cantidadHoras;
        }
        if (datos.modalidadesColaboracion !== undefined) {
            perfil.modalidadesColaboracion = Array.isArray(datos.modalidadesColaboracion)
                ? datos.modalidadesColaboracion
                : [datos.modalidadesColaboracion];
        }
        return perfil;
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
        if (this.perfiles.length > 0) {
            return this.perfiles.some((perfil) => perfil.validarColaborador(personaColaboradora));
        }
        if (Array.isArray(this.habilidadesRequeridas) && this.habilidadesRequeridas.length > 0) {
            return this.habilidadesRequeridas.some((habilidadRequerida) =>
                personaColaboradora.habilidades.some((h) => h.codigo === habilidadRequerida.codigo)
            );
        }
        return false;
    }

    evaluarPerfilesPara(personaColaboradora) {
        return this.perfiles
            .map((perfil) => perfil.evaluarCompatibilidad(personaColaboradora))
            .sort(Compatibilidad.compararPorPuntaje);
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
            perfiles: this.perfiles.map((p) => (typeof p.toJSON === "function" ? p.toJSON() : p)),
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
