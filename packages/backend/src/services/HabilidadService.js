import { Habilidad } from "../domain/Habilidad.js";
import { HabilidadRepository } from "../repositories/HabilidadRepository.js";
import { NotFoundError, UnprocessableEntityError } from "../errors/AppError.js";

export class HabilidadService {
    static crearHabilidad({ titulo, codigo, descripcion }) {
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

        return HabilidadRepository.guardar(nuevaHabilidad);
    }

    static obtenerHabilidades() {
        return HabilidadRepository.buscarTodos();
    }

    static obtenerHabilidadPorCodigo(codigo) {
        const habilidad = HabilidadRepository.buscarPorCodigo(codigo);
        if (!habilidad) {
            throw new NotFoundError(`No se encontró la habilidad con el código '${codigo}'`);
        }
        return habilidad;
    }

    static actualizarHabilidad(codigo, { titulo, descripcion }) {
        const habilidad = this.obtenerHabilidadPorCodigo(codigo);
        if (titulo) {
            habilidad.titulo = titulo.trim();
        }
        if (descripcion !== undefined) {
            habilidad.descripcion = descripcion.trim();
        }
        return HabilidadRepository.actualizar(codigo, habilidad);
    }

    static eliminarHabilidad(codigo) {
        this.obtenerHabilidadPorCodigo(codigo);
        return HabilidadRepository.eliminarPorCodigo(codigo);
    }
}
