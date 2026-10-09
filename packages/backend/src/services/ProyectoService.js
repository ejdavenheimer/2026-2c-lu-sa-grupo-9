import { Proyecto } from "../domain/Proyecto.js";
import { ProyectoRepository } from "../repositories/ProyectoRepository.js";
import { ColectivoRepository } from "../repositories/ColectivoRepository.js";
import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { HabilidadRepository } from "../repositories/HabilidadRepository.js";
import { NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class ProyectoService {
    crearProyecto = ({
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
        return ProyectoRepository.guardar(nuevoProyecto);
    }

    obtenerProyectos = () => {
        return ProyectoRepository.buscarTodos();
    }

    obtenerProyectoPorId = (id) => {
        const proyecto = ProyectoRepository.buscarPorId(id);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${id}'`);
        }
        return proyecto;
    }

    anotarColaborador = (proyectoId, { personaColaboradoraId, personaColaboradora }) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);

        let colaborador = personaColaboradora;
        if (!colaborador && personaColaboradoraId) {
            colaborador = PersonaColaboradoraRepository.buscarPorId(personaColaboradoraId);
            if (!colaborador) {
                throw new NotFoundError(`No se encontró la persona colaboradora con ID '${personaColaboradoraId}'`);
            }
        }
        if (!colaborador) {
            throw new UnprocessableEntityError("Debe indicar una persona colaboradora para anotar en el proyecto");
        }

        const nuevaColaboracion = proyecto.agregarColaboracion(colaborador);

        ProyectoRepository.guardar(proyecto);
        PersonaColaboradoraRepository.guardar(colaborador);

        return nuevaColaboracion;
    }

    cerrarProyecto = (proyectoId) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        proyecto.cerrarProyecto();
        ProyectoRepository.guardar(proyecto);
        return proyecto;
    }

    registrarHito = (proyectoId, { porcentajeConcrecion, descripcion, fecha }) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        const nuevoHito = proyecto.agregarHito({ porcentajeConcrecion, descripcion, fecha });
        ProyectoRepository.guardar(proyecto);
        return nuevoHito;
    }

    obtenerHitos = (proyectoId) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        return proyecto.hitos;
    }

    obtenerHitoPorId = (proyectoId, hitoId) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        return proyecto.getHito(hitoId);
    }

    actualizarHito = (proyectoId, hitoId, { porcentajeConcrecion, descripcion } = {}) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        proyecto.actualizarHito(hitoId, { porcentajeConcrecion, descripcion });
        ProyectoRepository.guardar(proyecto);
        return proyecto.getHito(hitoId);
    }

    eliminarHito = (proyectoId, hitoId) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        proyecto.eliminarHito(hitoId);
        ProyectoRepository.guardar(proyecto);
    }

    actualizarEnlaces = (proyectoId, { enlaceSistemaEnFuncionamiento, enlaceCodigoFuente } = {}) => {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        proyecto.actualizarEnlaces({ enlaceSistemaEnFuncionamiento, enlaceCodigoFuente });
        ProyectoRepository.guardar(proyecto);
        return proyecto;
    }
}
