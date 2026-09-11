import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { PersonaColaboradora } from "../domain/PersonaColaboradora.js";

export class PersonaColaboradoraService{
    
    listarPersonasColaboradoras = () => {
        return PersonaColaboradoraRepository.buscarTodos()
    }

    obtenerPersonaColaboradoraPorId = (id) => {
        const persona = PersonaColaboradoraRepository.buscarPorId(id)
        if(!persona){
            throw new Error("Persona colaboradora no encontrada")
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
            throw new Error("Persona colaboradora no encontrada")
        }
        personaColaboradora.habilidades.push(habilidad)
        return PersonaColaboradoraRepository.guardar(personaColaboradora)
    }
}