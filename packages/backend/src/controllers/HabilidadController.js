import { z } from "zod";
import { HabilidadService } from "../services/HabilidadService.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const habilidadEsquema = z.object({
    titulo: z.string().min(1, "El título de la habilidad es requerido"),
    codigo: z.string().optional(),
    descripcion: z.string().optional()
}).strict();

const actualizacionHabilidadEsquema = z.object({
    titulo: z.string().min(1, "El título no puede estar vacío").optional(),
    descripcion: z.string().optional()
}).strict();

export class HabilidadController {
    static async crear(req, res, next) {
        try {
            const datosHabilidad = HabilidadController.validarBody(habilidadEsquema, req.body);
            const nuevaHabilidad = HabilidadService.crearHabilidad(datosHabilidad);

            return res.status(201).json(nuevaHabilidad);
        } catch (error) {
            return next(error);
        }
    }

    static async listar(req, res, next) {
        try {
            const habilidades = HabilidadService.obtenerHabilidades();

            return res.status(200).json(habilidades);
        } catch (error) {
            return next(error);
        }
    }

    static async obtenerPorCodigo(req, res, next) {
        try {
            const habilidad = HabilidadService.obtenerHabilidadPorCodigo(req.params.codigo);

            return res.status(200).json(habilidad);
        } catch (error) {
            return next(error);
        }
    }

    static actualizar(req, res) {
        const { codigo } = req.params;
        const parseResult = actualizacionHabilidadEsquema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(parseResult.error.issues);
        }

        try {
            const habilidadActualizada = HabilidadService.actualizarHabilidad(codigo, parseResult.data);
            return res.status(200).json(habilidadActualizada);
        } catch (error) {
            return res.status(404).json({
                error: error.message
            });
        }
    }

    static eliminar(req, res) {
        const { codigo } = req.params;
        try {
            HabilidadService.eliminarHabilidad(codigo);
            return res.status(204).send();
        } catch (error) {
            return res.status(404).json({
                error: error.message
            });
        }
    }


    // 400 si la request está malformada (falta un campo, tipo incorrecto, campo de más);
    // 422 si los valores llegaron bien pero violan una regla, igual que el dominio.
    static validarBody(esquema, body) {
        const resultado = esquema.safeParse(body);
        if (resultado.success) {
            return resultado.data;
        }

        const esEstructural = resultado.error.issues.some(
            (issue) => issue.code === "invalid_type" || issue.code === "unrecognized_keys"
        );
        const detalle = resultado.error.issues
            .map((issue) => {
                const campo = issue.path.join(".")
                return campo ? `${campo}: ${issue.message}` : issue.message
            })
            .join("; ");

        throw esEstructural ? new BadRequestError(detalle) : new UnprocessableEntityError(detalle);
    }
}
