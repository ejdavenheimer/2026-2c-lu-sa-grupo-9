import { ColectivoRepository } from "../repositories/ColectivoRepository.js"
import { Colectivo } from "../domain/Colectivo.js"
import { NotFoundError } from "../errors/AppError.js"

export class ColectivoService{

    crearColectivo = async (body) => {
        const colectivo = new Colectivo(body);
        return await ColectivoRepository.guardar(colectivo);
    }

    obtenerColectivos = async () => {
        return await ColectivoRepository.buscarTodos();
    }

    obtenerColectivoPorId = async (id) => {
        const colectivo = await ColectivoRepository.buscarPorId(id);
        if(!colectivo){
            throw new NotFoundError(`No se encontro el colectivo con id ${id}`);
        }
        return colectivo;
    }

    actualizarColectivo = async (id, datos) => {
        const colectivo = await this.obtenerColectivoPorId(id);
        if (datos.nombre && datos.nombre !== colectivo.nombre) {
            const todos = await ColectivoRepository.buscarTodos();
            const existePorNombre = todos.some(
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

        return await ColectivoRepository.guardar(colectivo);
    }

    eliminarColectivo = async (id) => {
        await this.obtenerColectivoPorId(id);
        return await ColectivoRepository.eliminarPorId(id);
    }
}