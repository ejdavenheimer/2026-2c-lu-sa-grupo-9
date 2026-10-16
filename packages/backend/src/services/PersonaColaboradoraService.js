import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { PersonaColaboradora } from "../domain/PersonaColaboradora.js";
import { NotFoundError } from "../errors/AppError.js";
import {MedioDeContacto} from "../domain/MedioDeContacto.js";
export class PersonaColaboradoraService{
    
    listarPersonasColaboradoras = () => {
        return PersonaColaboradoraRepository.buscarTodos()
    }

    obtenerPersonaColaboradoraPorId = (id) => {
        const persona = PersonaColaboradoraRepository.buscarPorId(id)
        if(!persona){
            throw new NotFoundError("Persona colaboradora no encontrada")
        }
        return persona
    }

    crearPersonaColaboradora = (personaColaboradora) => {
        const nuevaPersonaColaboradora = new PersonaColaboradora(personaColaboradora)
        return PersonaColaboradoraRepository.guardar(nuevaPersonaColaboradora)
    }

    agregarHabilidad = (id, habilidad) => {
        const personaColaboradora = this.obtenerPersonaColaboradoraPorId(id)
        if(!personaColaboradora){
            throw new NotFoundError("Persona colaboradora no encontrada")
        }
        personaColaboradora.agregarHabilidad(habilidad)
        return PersonaColaboradoraRepository.guardar(personaColaboradora)
    }

    agregarMedioContacto = async (id, medioContacto) => {
        const persona = this.obtenerPersonaColaboradoraPorId(id)
        if (!persona){
            throw new NotFoundError("Persona colaboradora no encontrada")
        }
        persona.agregarMedioContacto(MedioDeContacto(medioContacto))
        return PersonaColaboradoraRepository.guardar(persona)
    }

    modificarMedioContacto = async (id, medioContacto) => {
        const persona = this.obtenerPersonaColaboradoraPorId(id)
        if (!persona){
            throw new NotFoundError("Persona colaboradora no encontrada")
        }
        persona.modificarMedioContacto(medioContacto)
        return PersonaColaboradoraRepository.guardar(persona)
    }

    eliminarMedioContacto = async (id, medioContacto) => {
        const persona = this.obtenerPersonaColaboradoraPorId(id)
        if (!persona){
            throw new NotFoundError("Persona colaboradora no encontrada")
        }
        persona.eliminarMedioContacto(medioContacto)
        return PersonaColaboradoraRepository.guardar(persona)
    }
  
    actualizarPersonaColaboradora = (id, datos) => {
        const persona = this.obtenerPersonaColaboradoraPorId(id);
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
        return PersonaColaboradoraRepository.guardar(persona);
    }

    eliminarPersonaColaboradora = (id) => {
        this.obtenerPersonaColaboradoraPorId(id);
        return PersonaColaboradoraRepository.eliminarPorId(id);
    }
}