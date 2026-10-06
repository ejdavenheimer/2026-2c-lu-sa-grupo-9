import { z } from 'zod';
import { ColectivoService } from '../services/ColectivoService.js';
import { BadRequestError, UnprocessableEntityError } from '../errors/AppError.js';

const ubicacionEsquema = z.object({
    pais: z.string(),
    provincia: z.string().optional(),
    ciudad: z.string().optional()
}).strict()

const colectivoEsquema = z.object({
    nombre: z.string(),
    descripcion: z.string(),
    tipo: z.string(),
    ubicacion: ubicacionEsquema.optional()
}).strict()

export class ColectivoController {

    constructor(colectivoService = new ColectivoService()){
        this.colectivoService = colectivoService
    }

    listar = async (req, res, next) => {
        try {
            const colectivos = this.colectivoService.obtenerColectivos()

            return res.status(200).json(colectivos)
        } catch (error) {
            return next(error)
        }
    }

    obtenerPorCodigo = async (req, res, next) => {
        try {
            const colectivo = this.colectivoService.obtenerColectivoPorId(req.params.id)

            return res.status(200).json(colectivo)
        } catch (error) {
            return next(error)
        }
    }

    crear = async (req, res, next) => {
        try {
            const datosColectivo = this.validarBody(colectivoEsquema, req.body)
            const nuevoColectivo = this.colectivoService.crearColectivo(datosColectivo)

            return res.status(201).json(nuevoColectivo)
        } catch (error) {
            return next(error)
        }
    }

    // 400 si la request está malformada (falta un campo, tipo incorrecto, campo de más);
    // 422 si los valores llegaron bien pero violan una regla, igual que el dominio.
    validarBody(esquema, body) {
        const resultado = esquema.safeParse(body)
        if (resultado.success) {
            return resultado.data
        }

        const esEstructural = resultado.error.issues.some(
            (issue) => issue.code === "invalid_type" || issue.code === "unrecognized_keys"
        )
        const detalle = resultado.error.issues
            .map((issue) => {
                const campo = issue.path.join(".")
                return campo ? `${campo}: ${issue.message}` : issue.message
            })
            .join("; ")

        throw esEstructural ? new BadRequestError(detalle) : new UnprocessableEntityError(detalle)
    }
}
