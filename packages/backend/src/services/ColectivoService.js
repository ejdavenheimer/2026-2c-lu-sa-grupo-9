import { ColectivoRepository } from "../repositories/ColectivoRepository.js"
import { Colectivo } from "../domain/Colectivo.js"

export class ColectivoService{

    crearColectivo = (body) => {
        const colectivo = new Colectivo(body)
        return ColectivoRepository.guardar(colectivo)
    }

    obtenerColectivos = () => {
        return ColectivoRepository.buscarTodos() 
    }

    obtenerColectivoPorId = (id) => {
        const colectivo = ColectivoRepository.buscarPorId(id)
        if(!colectivo){
            throw new Error(`No se encontro el colectivo con id ${id}`)
        }
        return colectivo
    }

}