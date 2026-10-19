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
        const persona = await this.personaColaboradoraRepository.buscarPorId(id);
        if(!persona){
            throw new NotFoundError("Persona colaboradora no encontrada");
        }
        return new PersonaColaboradora(persona).toJSON();
    }

    crearPersonaColaboradora = async (personaColaboradora) => {
        const nuevaPersonaColaboradora = new PersonaColaboradora(personaColaboradora);
        const resultado = await this.personaColaboradoraRepository.guardar(nuevaPersonaColaboradora);
        return new PersonaColaboradora(resultado).toJSON();
    }

    agregarHabilidad = async (id, habilidad) => {
        const personaData = await this.obtenerPersonaColaboradoraPorId(id);
        const personaColaboradora = new PersonaColaboradora(personaData);
        personaColaboradora.agregarHabilidad(habilidad);
        const resultado = await this.personaColaboradoraRepository.guardar(personaColaboradora);
        return new PersonaColaboradora(resultado).toJSON();
    }

    actualizarPersonaColaboradora = async (id, datos) => {
        const personaData = await this.obtenerPersonaColaboradoraPorId(id);
        const persona = new PersonaColaboradora(personaData);
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
        const personaData = await this.obtenerPersonaColaboradoraPorId(id);
        const persona = new PersonaColaboradora(personaData);
        return persona.mediosDeContacto;
    }

    agregarMedioDeContacto = async (id, datosMedio) => {
        const personaData = await this.obtenerPersonaColaboradoraPorId(id);
        const persona = new PersonaColaboradora(personaData);
        persona.agregarMedioDeContacto(datosMedio);
        const resultado = await this.personaColaboradoraRepository.guardar(persona);
        return new PersonaColaboradora(resultado).toJSON();
    }

    actualizarMediosDeContacto = async (id, nuevoMedios) => {
        const personaData = await this.personaColaboradoraRepository.buscarPorId(id);
        const persona = new PersonaColaboradora(personaData);
        persona.actualizarMediosDeContacto(nuevoMedios);
        const resultado = await this.personaColaboradoraRepository.guardar(persona);
        return new PersonaColaboradora(resultado).toJSON();
    }

    eliminarMedioDeContacto = async (id, tipoMedio) => {
        const personaData = await this.obtenerPersonaColaboradoraPorId(id);
        const persona = new PersonaColaboradora(personaData);
        const medioAEliminar = persona.mediosDeContacto.find((medio) => medio.tipo === tipoMedio);
        if (!medioAEliminar) {
            throw new NotFoundError(`La persona colaboradora '${persona.nombreFantasia}' no posee el medio de contacto '${tipoMedio}'.`)
        }
        persona.mediosDeContacto = persona.mediosDeContacto.filter(m => m.tipo !== tipoMedio);
        const resultado = await this.personaColaboradoraRepository.guardar(persona);
        return new PersonaColaboradora(resultado).toJSON();
    }
}