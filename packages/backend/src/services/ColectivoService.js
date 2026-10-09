import { ColectivoRepository } from "../repositories/ColectivoRepository.js"
import { Colectivo } from "../domain/Colectivo.js"
import { NotFoundError } from "../errors/AppError.js"

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
            throw new NotFoundError(`No se encontro el colectivo con id ${id}`)
        }
        return colectivo
    }

    actualizarColectivo = (id, datos) => {
        const colectivo = this.obtenerColectivoPorId(id);
        if (datos.nombre && datos.nombre !== colectivo.nombre) {
            const existePorNombre = ColectivoRepository.buscarTodos().some(
                (c) => c.id !== id && c.nombre === datos.nombre
            );
            if (existePorNombre) {
                throw new Error(`Ya existe un colectivo con el nombre '${datos.nombre}'`);
            }
            colectivo.nombre = datos.nombre;
        }
        if (datos.descripcion !== undefined) colectivo.descripcion = datos.descripcion;
        if (datos.tipo !== undefined) colectivo.tipo = datos.tipo;
        if (datos.ubicacion !== undefined) colectivo.ubicacion = datos.ubicacion;

        return ColectivoRepository.guardar(colectivo);
    }

    eliminarColectivo = (id) => {
        this.obtenerColectivoPorId(id);
        return ColectivoRepository.eliminarPorId(id);
    }
}