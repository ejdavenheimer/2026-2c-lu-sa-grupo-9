import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { PersonaColaboradora } from "../domain/PersonaColaboradora.js";
import { NotFoundError } from "../errors/AppError.js";

export class PersonaColaboradoraService{
    
    listarPersonasColaboradoras = async () => {
        return await PersonaColaboradoraRepository.buscarTodos();
    }

    obtenerPersonaColaboradoraPorId = async (id) => {
        const persona = await PersonaColaboradoraRepository.buscarPorId(id);
        if(!persona){
            throw new NotFoundError("Persona colaboradora no encontrada");
        }
        return persona;
    }

    crearPersonaColaboradora = async (personaColaboradora) => {
        const nuevaPersonaColaboradora = new PersonaColaboradora(personaColaboradora);
        return await PersonaColaboradoraRepository.guardar(nuevaPersonaColaboradora);
    }

    agregarHabilidad = async (id, habilidad) => {
        const personaColaboradora = await this.obtenerPersonaColaboradoraPorId(id);
        if(!personaColaboradora){
            throw new NotFoundError("Persona colaboradora no encontrada");
        }
        personaColaboradora.agregarHabilidad(habilidad);
        return await PersonaColaboradoraRepository.guardar(personaColaboradora);
    }

    actualizarPersonaColaboradora = async (id, datos) => {
        const persona = await this.obtenerPersonaColaboradoraPorId(id);
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
        return await PersonaColaboradoraRepository.guardar(persona);
    }

    eliminarPersonaColaboradora = async (id) => {
        await this.obtenerPersonaColaboradoraPorId(id);
        return await PersonaColaboradoraRepository.eliminarPorId(id);
    }
}