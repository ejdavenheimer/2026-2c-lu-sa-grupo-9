import { Compatibilidad } from "../domain/Compatibilidad.js";
import { EstadoProyecto } from "../domain/enums.js";
import { ProyectoRepository } from "../repositories/ProyectoRepository.js";
import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { NotFoundError } from "../errors/AppError.js";

const LIMITE_POR_DEFECTO = 20;

const cumpleElCriterio = (estricto) => (compatibilidad) =>
    estricto ? compatibilidad.esCompatible : compatibilidad.cumpleAlgunaRequerida;

const comoCandidato = (persona) => ({
    id: persona.id,
    nombreFantasia: persona.nombreFantasia,
    nombre: persona.nombre,
    apellido: persona.apellido,
    pronombres: persona.pronombres,
    presentacion: persona.presentacion,
    habilidades: persona.habilidades
});

const comoProyectoBuscado = (proyecto) => ({
    id: proyecto.id,
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion,
    estado: proyecto.estado,
    colectivo: proyecto.colectivo
        ? { id: proyecto.colectivo.id, nombre: proyecto.colectivo.nombre }
        : null
});

const comoPerfilBuscado = (perfil) => ({
    id: perfil.id,
    nombre: perfil.nombre,
    descripcion: perfil.descripcion,
    unidadCompromiso: perfil.unidadCompromiso,
    cantidadHoras: perfil.cantidadHoras,
    modalidadesColaboracion: perfil.modalidadesColaboracion
});

export class CompatibilidadService {
    constructor({
        proyectoRepository = ProyectoRepository,
        personaColaboradoraRepository = PersonaColaboradoraRepository
    } = {}) {
        this.proyectoRepository = proyectoRepository;
        this.personaColaboradoraRepository = personaColaboradoraRepository;
    }

    buscarColaboradoresCompatibles = async (
        proyectoId,
        perfilId,
        { estricto = true, limite = LIMITE_POR_DEFECTO } = {}
    ) => {
        const proyecto = await this.proyectoRepository.buscarPorId(proyectoId);
        if (!proyecto) {
            throw new NotFoundError(`No se encontró el proyecto con ID '${proyectoId}'`);
        }

        const perfil = proyecto.obtenerPerfil(perfilId);
        if (!perfil) {
            throw new NotFoundError(
                `No se encontró el perfil con ID '${perfilId}' en el proyecto '${proyectoId}'`
            );
        }

        const candidatos = await this.personaColaboradoraRepository.buscarPorHabilidades(
            perfil.codigosRequeridos()
        );

        return candidatos
            .map((candidato) => perfil.evaluarCompatibilidad(candidato))
            .filter(cumpleElCriterio(estricto))
            .sort(Compatibilidad.compararPorPuntaje)
            .slice(0, limite)
            .map((compatibilidad) => ({
                personaColaboradora: comoCandidato(compatibilidad.personaColaboradora),
                compatibilidad
            }));
    };

    buscarProyectosCompatibles = async (
        personaColaboradoraId,
        { estricto = false, limite = LIMITE_POR_DEFECTO } = {}
    ) => {
        const persona = await this.personaColaboradoraRepository.buscarPorId(personaColaboradoraId);
        if (!persona) {
            throw new NotFoundError(
                `No se encontró la persona colaboradora con ID '${personaColaboradoraId}'`
            );
        }

        const proyectos = await this.proyectoRepository.buscarPorHabilidadesRequeridas(
            persona.codigosDeHabilidades()
        );

        return proyectos
            .filter((proyecto) => proyecto.estado === EstadoProyecto.PUBLICADO)
            .flatMap((proyecto) => proyecto.evaluarPerfilesPara(persona))
            .filter(cumpleElCriterio(estricto))
            .sort(Compatibilidad.compararPorPuntaje)
            .slice(0, limite)
            .map((compatibilidad) => ({
                proyecto: comoProyectoBuscado(compatibilidad.proyecto),
                perfil: comoPerfilBuscado(compatibilidad.perfil),
                compatibilidad
            }));
    };
}
