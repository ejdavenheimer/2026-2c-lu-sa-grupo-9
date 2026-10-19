import { Proyecto } from "../domain/Proyecto.js";
import { ProyectoRepository } from "../repositories/ProyectoRepository.js";
import { ColectivoRepository } from "../repositories/ColectivoRepository.js";
import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { HabilidadRepository } from "../repositories/HabilidadRepository.js";
import { NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class ProyectoService {
    crearProyecto = async ({
        titulo,
        descripcion,
        unidadCompromiso,
        cantidadHoras,
        modalidadesColaboracion,
        colectivoId,
        colectivo,
        habilidadesRequeridasCodigos = [],
        habilidadesRequeridas = []
    }) => {
        let colectivoAsociado = colectivo;
        if (!colectivoAsociado && colectivoId) {
            colectivoAsociado = ColectivoRepository.buscarPorId(colectivoId);
            if (!colectivoAsociado) {
                throw new NotFoundError(`No se encontró el colectivo con ID '${colectivoId}'`);
            }
        }
        if (!colectivoAsociado) {
            throw new UnprocessableEntityError("El proyecto requiere un colectivo asociado");
        }
        let habilidadesFinales = [...habilidadesRequeridas];
        if (habilidadesRequeridasCodigos.length > 0) {
            for (const codigo of habilidadesRequeridasCodigos) {
                const hab = HabilidadRepository.buscarPorCodigo(codigo);
                if (!hab) {
                    throw new NotFoundError(`No se encontró la habilidad requerida con código '${codigo}'`);
                }
                if (!habilidadesFinales.some((h) => h.codigo === hab.codigo)) {
                    habilidadesFinales.push(hab);
                }
            }
        }

        if (habilidadesFinales.length === 0) {
            throw new UnprocessableEntityError("El proyecto requiere al menos una habilidad requerida");
        }
        const nuevoProyecto = new Proyecto({
            titulo,
            descripcion,
            unidadCompromiso,
            cantidadHoras: Number(cantidadHoras),
            modalidadesColaboracion: Array.isArray(modalidadesColaboracion)
                ? modalidadesColaboracion
                : [modalidadesColaboracion],
            colectivo: colectivoAsociado,
            habilidadesRequeridas: habilidadesFinales
        });

        colectivoAsociado.agregarProyecto(nuevoProyecto);
        return await ProyectoRepository.guardar(nuevoProyecto);
    }

    obtenerProyectos = async () => {
        return await ProyectoRepository.buscarTodos();
    }

    obtenerProyectoPorId = async (id) => {
        const proyecto = await ProyectoRepository.buscarPorId(id);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${id}'`);
        }
        return proyecto;
    }

    anotarColaborador = async (proyectoId, { personaColaboradoraId, personaColaboradora, esAnonima= false }) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        let colaborador = personaColaboradora;
        if (!colaborador && personaColaboradoraId) {
            colaborador = await PersonaColaboradoraRepository.buscarPorId(personaColaboradoraId);
            if (!colaborador) {
                throw new NotFoundError(`No se encontró la persona colaboradora con ID '${personaColaboradoraId}'`);
            }
        }
        if (!colaborador) {
            throw new UnprocessableEntityError("Debe indicar una persona colaboradora para anotar en el proyecto");
        }

        const nuevaColaboracion = proyecto.agregarColaboracion(colaborador, esAnonima);

        await ProyectoRepository.guardar(proyecto);
        await PersonaColaboradoraRepository.guardar(colaborador);

        return nuevaColaboracion;
    }

    cerrarProyecto = async (proyectoId) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        proyecto.cerrarProyecto();
        await ProyectoRepository.guardar(proyecto);
        return proyecto;
    }

    actualizarProyecto = async (id, datos) => {
        const proyecto = await this.obtenerProyectoPorId(id);
        if (datos.titulo !== undefined) proyecto.titulo = datos.titulo;
        if (datos.descripcion !== undefined) proyecto.descripcion = datos.descripcion;
        if (datos.unidadCompromiso !== undefined) proyecto.unidadCompromiso = datos.unidadCompromiso;
        if (datos.cantidadHoras !== undefined) proyecto.cantidadHoras = Number(datos.cantidadHoras);
        if (datos.modalidadesColaboracion !== undefined) {
            proyecto.modalidadesColaboracion = Array.isArray(datos.modalidadesColaboracion)
                ? datos.modalidadesColaboracion
                : [datos.modalidadesColaboracion];
        }
        if (datos.habilidadesRequeridasCodigos && datos.habilidadesRequeridasCodigos.length > 0) {
            const nuevasHabilidades = [];
            for (const codigo of datos.habilidadesRequeridasCodigos) {
                const hab = HabilidadRepository.buscarPorCodigo(codigo);
                if (!hab) {
                    throw new Error(`No se encontró la habilidad requerida con código '${codigo}'`);
                }
                nuevasHabilidades.push(hab);
            }
            proyecto.habilidadesRequeridas = nuevasHabilidades;
        }
        return await ProyectoRepository.guardar(proyecto);
    }

    eliminarProyecto = async (id) => {
        await this.obtenerProyectoPorId(id);
        return await ProyectoRepository.eliminarPorId(id);
    }

    registrarHito = async (proyectoId, { porcentajeConcrecion, descripcion, fecha }) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        const nuevoHito = proyecto.agregarHito({ porcentajeConcrecion, descripcion, fecha });
        await ProyectoRepository.guardar(proyecto);
        return nuevoHito;
    }

    obtenerHitos = async (proyectoId) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        return proyecto.hitos;
    }

    obtenerHitoPorId = async (proyectoId, hitoId) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        return proyecto.getHito(hitoId);
    }

    actualizarHito = async (proyectoId, hitoId, { porcentajeConcrecion, descripcion } = {}) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        proyecto.actualizarHito(hitoId, { porcentajeConcrecion, descripcion });
        await ProyectoRepository.guardar(proyecto);
        return proyecto.getHito(hitoId);
    }

    eliminarHito = async (proyectoId, hitoId) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        proyecto.eliminarHito(hitoId);
        await ProyectoRepository.guardar(proyecto);
    }

    actualizarEnlaces = async (proyectoId, { enlaceSistemaEnFuncionamiento, enlaceCodigoFuente } = {}) => {
        const proyecto = await this.obtenerProyectoPorId(proyectoId);
        proyecto.actualizarEnlaces({ enlaceSistemaEnFuncionamiento, enlaceCodigoFuente });
        await ProyectoRepository.guardar(proyecto);
        return proyecto;
    }
}
