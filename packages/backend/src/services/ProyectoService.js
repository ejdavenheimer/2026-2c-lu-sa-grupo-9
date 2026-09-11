import { Proyecto } from "../domain/Proyecto.js";
import { ProyectoRepository } from "../repositories/ProyectoRepository.js";
import { ColectivoRepository } from "../repositories/ColectivoRepository.js";
import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { HabilidadRepository } from "../repositories/HabilidadRepository.js";

export class ProyectoService {
    static crearProyecto({
        titulo,
        descripcion,
        unidadCompromiso,
        cantidadHoras,
        modalidadesColaboracion,
        colectivoId,
        colectivo,
        habilidadesRequeridasCodigos = [],
        habilidadesRequeridas = []
    }) {
        let colectivoAsociado = colectivo;
        if (!colectivoAsociado && colectivoId) {
            colectivoAsociado = ColectivoRepository.buscarPorId(colectivoId);
            if (!colectivoAsociado) {
                throw new Error(`No se encontró el colectivo con ID '${colectivoId}'`);
            }
        }
        if (!colectivoAsociado) {
            throw new Error("El proyecto requiere un colectivo asociado");
        }
        let habilidadesFinales = [...habilidadesRequeridas];
        if (habilidadesRequeridasCodigos.length > 0) {
            for (const codigo of habilidadesRequeridasCodigos) {
                const hab = HabilidadRepository.buscarPorCodigo(codigo);
                if (!hab) {
                    throw new Error(`No se encontró la habilidad requerida con código '${codigo}'`);
                }
                if (!habilidadesFinales.some((h) => h.codigo === hab.codigo)) {
                    habilidadesFinales.push(hab);
                }
            }
        }

        if (habilidadesFinales.length === 0) {
            throw new Error("El proyecto requiere al menos una habilidad requerida");
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

    static obtenerProyectos() {
        return ProyectoRepository.buscarTodos();
    }

    static obtenerProyectoPorId(id) {
        const proyecto = ProyectoRepository.buscarPorId(id);
        if (!proyecto) {
            throw new Error(`No se encontró el proyecto con ID '${id}'`);
        }
        return proyecto;
    }

    static anotarColaborador(proyectoId, { personaColaboradoraId, personaColaboradora }) {
        const proyecto = this.obtenerProyectoPorId(proyectoId);

        let colaborador = personaColaboradora;
        if (!colaborador && personaColaboradoraId) {
            colaborador = PersonaColaboradoraRepository.buscarPorId(personaColaboradoraId);
            if (!colaborador) {
                throw new Error(`No se encontró la persona colaboradora con ID '${personaColaboradoraId}'`);
            }
        }
        if (!colaborador) {
            throw new Error("Debe indicar una persona colaboradora para anotar en el proyecto");
        }

        const nuevaColaboracion = proyecto.agregarColaboracion(colaborador);

        ProyectoRepository.guardar(proyecto);
        PersonaColaboradoraRepository.guardar(colaborador);

        return nuevaColaboracion;
    }

    static cerrarProyecto(proyectoId) {
        const proyecto = this.obtenerProyectoPorId(proyectoId);
        proyecto.cerrarProyecto();
        ProyectoRepository.guardar(proyecto);
        return proyecto;
    }
}
