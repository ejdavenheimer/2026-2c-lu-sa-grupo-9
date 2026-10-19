import { Habilidad } from "../domain/Habilidad.js";
import { HabilidadRepository } from "../repositories/HabilidadRepository.js";
import { NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class HabilidadService {
    static async crearHabilidad({ titulo, codigo, descripcion }) {
        if (!titulo) {
            throw new UnprocessableEntityError("El título de la habilidad es requerido");
        }

        const codigoNormalizado = (codigo || titulo)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        const nuevaHabilidad = new Habilidad({
            titulo: titulo.trim(),
            codigo: codigoNormalizado,
            descripcion: descripcion ? descripcion.trim() : ""
        });

        return await HabilidadRepository.guardar(nuevaHabilidad);
    }

    static async obtenerHabilidades() {
        return await HabilidadRepository.buscarTodos();
    }

    static async obtenerHabilidadPorCodigo(codigo) {
        const habilidad = await HabilidadRepository.buscarPorCodigo(codigo);
        if (!habilidad) {
            throw new NotFoundError(`No se encontró la habilidad con el código '${codigo}'`);
        }
        return habilidad;
    }

    static async actualizarHabilidad(codigo, { titulo, descripcion }) {
        const habilidad = await this.obtenerHabilidadPorCodigo(codigo);
        if (titulo) {
            habilidad.titulo = titulo.trim();
        }
        if (descripcion !== undefined) {
            habilidad.descripcion = descripcion.trim();
        }
        return await HabilidadRepository.actualizar(codigo, habilidad);
    }

    static async eliminarHabilidad(codigo) {
        await this.obtenerHabilidadPorCodigo(codigo);
        return await HabilidadRepository.eliminarPorCodigo(codigo);
    }
}

