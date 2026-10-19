import { Perfil } from "../domain/Perfil.js";
import { EstadoProyecto } from "../domain/enums.js";
import { ProyectoRepository } from "../repositories/ProyectoRepository.js";
import { HabilidadRepository } from "../repositories/HabilidadRepository.js";
import { PerfilRepository } from "../repositories/PerfilRepository.js";
import { ConflictError, NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class PerfilService {
    constructor({
        proyectoRepository = ProyectoRepository,
        habilidadRepository = HabilidadRepository,
        perfilRepository = PerfilRepository
    } = {}) {
        this.proyectoRepository = proyectoRepository;
        this.habilidadRepository = habilidadRepository;
        this.perfilRepository = perfilRepository;
    }

    crearPerfil = async (proyectoId, {
        nombre,
        descripcion,
        habilidadesRequeridasCodigos = [],
        habilidadesOpcionalesCodigos = [],
        unidadCompromiso,
        cantidadHoras,
        modalidadesColaboracion = []
    } = {}) => {
        const proyecto = await this.proyectoRepository.buscarPorId(proyectoId);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${proyectoId}'`);
        }
        if (proyecto.estado !== EstadoProyecto.PUBLICADO || proyecto.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden agregar perfiles a un proyecto cerrado");
        }

        if (!Array.isArray(habilidadesRequeridasCodigos) || habilidadesRequeridasCodigos.length === 0) {
            throw new UnprocessableEntityError("Debe indicar al menos una habilidad requerida");
        }

        const habilidadesRequeridas = [];
        for (const codigo of habilidadesRequeridasCodigos) {
            const habilidad = await this.habilidadRepository.buscarPorCodigo(codigo);
            if (!habilidad) {
                throw new NotFoundError(`No se encontró la habilidad requerida con código '${codigo}'`);
            }
            if (!habilidadesRequeridas.some((h) => h.codigo === habilidad.codigo)) {
                habilidadesRequeridas.push(habilidad);
            }
        }

        const habilidadesOpcionales = [];
        if (Array.isArray(habilidadesOpcionalesCodigos) && habilidadesOpcionalesCodigos.length > 0) {
            for (const codigo of habilidadesOpcionalesCodigos) {
                if (habilidadesRequeridas.some((h) => h.codigo === codigo)) {
                    throw new UnprocessableEntityError(`La habilidad '${codigo}' no puede ser requerida y opcional simultáneamente`);
                }
                const habilidad = await this.habilidadRepository.buscarPorCodigo(codigo);
                if (!habilidad) {
                    throw new NotFoundError(`No se encontró la habilidad opcional con código '${codigo}'`);
                }
                if (!habilidadesOpcionales.some((h) => h.codigo === habilidad.codigo)) {
                    habilidadesOpcionales.push(habilidad);
                }
            }
        }

        const nuevoPerfil = new Perfil({
            nombre,
            descripcion,
            habilidadesRequeridas,
            habilidadesOpcionales,
            unidadCompromiso,
            cantidadHoras: Number(cantidadHoras),
            modalidadesColaboracion: Array.isArray(modalidadesColaboracion)
                ? modalidadesColaboracion
                : [modalidadesColaboracion],
            proyecto
        });

        proyecto.agregarPerfil(nuevoPerfil);
        await this.proyectoRepository.guardar(proyecto);
        await this.perfilRepository.guardar(nuevoPerfil);

        return nuevoPerfil;
    };

    obtenerPerfiles = async (proyectoId) => {
        const proyecto = await this.proyectoRepository.buscarPorId(proyectoId);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${proyectoId}'`);
        }
        return proyecto.perfiles;
    };

    obtenerPerfilPorId = async (proyectoId, perfilId) => {
        const proyecto = await this.proyectoRepository.buscarPorId(proyectoId);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${proyectoId}'`);
        }
        const perfil = proyecto.obtenerPerfil(perfilId);
        if (!perfil) {
            throw new NotFoundError(`No se encontró el perfil con ID '${perfilId}' en el proyecto '${proyectoId}'`);
        }
        return perfil;
    };

    modificarPerfil = async (proyectoId, perfilId, datos = {}) => {
        const proyecto = await this.proyectoRepository.buscarPorId(proyectoId);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${proyectoId}'`);
        }
        if (proyecto.estado !== EstadoProyecto.PUBLICADO || proyecto.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden modificar perfiles de un proyecto cerrado");
        }
        const perfil = proyecto.obtenerPerfil(perfilId);
        if (!perfil) {
            throw new NotFoundError(`No se encontró el perfil con ID '${perfilId}' en el proyecto '${proyectoId}'`);
        }

        const datosActualizados = {};

        if (datos.nombre !== undefined) {
            datosActualizados.nombre = datos.nombre;
        }

        if (datos.descripcion !== undefined) {
            datosActualizados.descripcion = datos.descripcion;
        }

        if (datos.habilidadesRequeridasCodigos !== undefined) {
            if (!Array.isArray(datos.habilidadesRequeridasCodigos) || datos.habilidadesRequeridasCodigos.length === 0) {
                throw new UnprocessableEntityError("Debe indicar al menos una habilidad requerida");
            }
            const nuevasRequeridas = [];
            for (const codigo of datos.habilidadesRequeridasCodigos) {
                const hab = await this.habilidadRepository.buscarPorCodigo(codigo);
                if (!hab) {
                    throw new NotFoundError(`No se encontró la habilidad requerida con código '${codigo}'`);
                }
                if (!nuevasRequeridas.some((h) => h.codigo === hab.codigo)) {
                    nuevasRequeridas.push(hab);
                }
            }
            datosActualizados.habilidadesRequeridas = nuevasRequeridas;
        }

        if (datos.habilidadesOpcionalesCodigos !== undefined) {
            const nuevasOpcionales = [];
            for (const codigo of datos.habilidadesOpcionalesCodigos) {
                const hab = await this.habilidadRepository.buscarPorCodigo(codigo);
                if (!hab) {
                    throw new NotFoundError(`No se encontró la habilidad opcional con código '${codigo}'`);
                }
                if (!nuevasOpcionales.some((h) => h.codigo === hab.codigo)) {
                    nuevasOpcionales.push(hab);
                }
            }
            datosActualizados.habilidadesOpcionales = nuevasOpcionales;
        }

        if (datos.unidadCompromiso !== undefined) {
            datosActualizados.unidadCompromiso = datos.unidadCompromiso;
        }

        if (datos.cantidadHoras !== undefined) {
            datosActualizados.cantidadHoras = Number(datos.cantidadHoras);
        }

        if (datos.modalidadesColaboracion !== undefined) {
            datosActualizados.modalidadesColaboracion = Array.isArray(datos.modalidadesColaboracion)
                ? datos.modalidadesColaboracion
                : [datos.modalidadesColaboracion];
        }

        const perfilModificado = proyecto.modificarPerfil(perfilId, datosActualizados);
        await this.proyectoRepository.guardar(proyecto);
        await this.perfilRepository.guardar(perfilModificado);

        return perfilModificado;
    };

    eliminarPerfil = async (proyectoId, perfilId) => {
        const proyecto = await this.proyectoRepository.buscarPorId(proyectoId);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${proyectoId}'`);
        }
        if (proyecto.estado !== EstadoProyecto.PUBLICADO || proyecto.fechaCierre !== undefined) {
            throw new ConflictError("No se pueden eliminar perfiles de un proyecto cerrado");
        }
        const perfil = proyecto.obtenerPerfil(perfilId);
        if (!perfil) {
            throw new NotFoundError(`No se encontró el perfil con ID '${perfilId}' en el proyecto '${proyectoId}'`);
        }

        proyecto.quitarPerfil(perfilId);
        await this.proyectoRepository.guardar(proyecto);
        await this.perfilRepository.eliminarPorId(perfilId);
        return true;
    };
}
