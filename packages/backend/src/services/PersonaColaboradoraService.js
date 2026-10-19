import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { PersonaColaboradora } from "../domain/PersonaColaboradora.js";
import {NotFoundError} from "../errors/AppError.js";

export class PersonaColaboradoraService {

    constructor(personaColaboradoraRepository = PersonaColaboradoraRepository){
        this.personaColaboradoraRepository = personaColaboradoraRepository;
    }

    listarPersonasColaboradoras = async () => {
        const personas = await this.personaColaboradoraRepository.buscarTodos();
        return personas.map(p => new PersonaColaboradora(p).toJSON());
    }

    obtenerPersonaColaboradoraPorId = async (id) => {
        return (await this.#obtenerEntidad(id)).toJSON();
    }

    /**
     * Devuelve la ENTIDAD de dominio, no su forma serializada.
     *
     * toJSON() es la representacion publica y omite a proposito los medios de
     * contacto (el enunciado pide que no se muestren). Reconstruir la persona
     * desde ese JSON para despues guardarla los borraba de la base.
     */
    #obtenerEntidad = async (id) => {
        const persona = await this.personaColaboradoraRepository.buscarPorId(id);
        if(!persona){
            throw new NotFoundError("Persona colaboradora no encontrada");
        }
        return persona instanceof PersonaColaboradora ? persona : new PersonaColaboradora(persona);
    }

    crearPersonaColaboradora = async (personaColaboradora) => {
        const nuevaPersonaColaboradora = new PersonaColaboradora(personaColaboradora);
        const resultado = await this.personaColaboradoraRepository.guardar(nuevaPersonaColaboradora);
        return new PersonaColaboradora(resultado).toJSON();
    }

    agregarHabilidad = async (id, habilidad) => {
        const personaColaboradora = await this.#obtenerEntidad(id);
        personaColaboradora.agregarHabilidad(habilidad);
        const resultado = await this.personaColaboradoraRepository.guardar(personaColaboradora);
        return new PersonaColaboradora(resultado).toJSON();
    }

    actualizarPersonaColaboradora = async (id, datos) => {
        const persona = await this.#obtenerEntidad(id);
        if (datos.nombreFantasia !== undefined) persona.nombreFantasia = datos.nombreFantasia;
        if (datos.nombre !== undefined) persona.nombre = datos.nombre;
        if (datos.apellido !== undefined) persona.apellido = datos.apellido;
        if (datos.pronombres !== undefined) persona.pronombres = datos.pronombres;
        if (datos.presentacion !== undefined) persona.presentacion = datos.presentacion;
        if (datos.cuentas !== undefined) persona.cuentas = datos.cuentas;
        if (datos.mensajesInternos !== undefined) persona.mensajesInternos = datos.mensajesInternos;
        if (datos.mediosDeContacto !== undefined) {
            const medios = datos.mediosDeContacto;
            persona.mediosDeContacto = [];
            medios.forEach((medio) => persona.agregarMedioDeContacto(medio));
        }
        const resultado = await this.personaColaboradoraRepository.guardar(persona);
        return new PersonaColaboradora(resultado).toJSON();
    }

    eliminarPersonaColaboradora = async (id) => {
        await this.obtenerPersonaColaboradoraPorId(id);
        return await this.personaColaboradoraRepository.eliminarPorId(id);
    }
    listarMediosDeContacto = async (id) => {
        return (await this.#obtenerEntidad(id)).mediosDeContacto;
    }

    agregarMedioDeContacto = async (id, datosMedio) => {
        const persona = await this.#obtenerEntidad(id);
        persona.agregarMedioDeContacto(datosMedio);
        const resultado = await this.personaColaboradoraRepository.guardar(persona);
        return new PersonaColaboradora(resultado).toJSON();
    }

    actualizarMediosDeContacto = async (id, nuevoMedios) => {
        const persona = await this.#obtenerEntidad(id);
        persona.actualizarMediosDeContacto(nuevoMedios);
        const resultado = await this.personaColaboradoraRepository.guardar(persona);
        return new PersonaColaboradora(resultado).toJSON();
    }

    eliminarMedioDeContacto = async (id, tipoMedio) => {
        const persona = await this.#obtenerEntidad(id);
        const medioAEliminar = persona.mediosDeContacto.find((medio) => medio.tipo === tipoMedio);
        if (!medioAEliminar) {
            throw new NotFoundError(`La persona colaboradora '${persona.nombreFantasia}' no posee el medio de contacto '${tipoMedio}'.`)
        }
        persona.mediosDeContacto = persona.mediosDeContacto.filter(m => m.tipo !== tipoMedio);
        const resultado = await this.personaColaboradoraRepository.guardar(persona);
        return new PersonaColaboradora(resultado).toJSON();
    }
}