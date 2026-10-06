import { PersonaColaboradoraRepository } from "../repositories/PersonaColaboradoraRepository.js";
import { PersonaColaboradora } from "../domain/PersonaColaboradora.js";
import { NotFoundError } from "../errors/AppError.js";

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
}