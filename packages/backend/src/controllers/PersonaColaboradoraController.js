import { PersonaColaboradoraService } from "../services/PersonaColaboradoraService.js";
import { z } from 'zod';
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const personaColaboradoraValida = z.object({
    nombreFantasia: z.string().default(null),
    nombre: z.string().default(null),
    apellido: z.string().default(null),
    pronombres: z.array(z.string()).default([]),
    presentacion: z.string().default(""),
    cuentas: z.array(z.any()).default([]),
    habilidades: z.array(z.any()).default([]),
    colaboraciones: z.array(z.any()).default([])
}).strict();

const habilidadEsquema = z.object({
    titulo: z.string().default(""),
    codigo: z.string().default(""),
    descripcion: z.string().default("")
}).strict();

export class PersonaColaboradoraController {

    constructor(personaColaboradoraService = new PersonaColaboradoraService()) {
        this.personaColaboradoraService = personaColaboradoraService
    }

    obtenerPersonasColaboradoras = async (req, res, next) => {
        try {
            const personas = this.personaColaboradoraService.listarPersonasColaboradoras()

            return res.status(200).json(personas)
        } catch (error) {
            return next(error)
        }
    }

    obtenerPersonaColaboradoraPorId = async (req, res, next) => {
        try {
            const persona = this.personaColaboradoraService.obtenerPersonaColaboradoraPorId(req.params.id)

            return res.status(200).json(persona)
        } catch (error) {
            return next(error)
        }
    }

    crearPersonaColaboradora = async (req, res, next) => {
        try {
            const datosPersona = this.validarBody(personaColaboradoraValida, req.body)
            const nuevaPersona = this.personaColaboradoraService.crearPersonaColaboradora(datosPersona)

            return res.status(201).json(nuevaPersona)
        } catch (error) {
            return next(error)
        }
    }

    agregarHabilidad = async (req, res, next) => {
        try {
            const habilidad = this.validarBody(habilidadEsquema, req.body)
            const persona = this.personaColaboradoraService.agregarHabilidad(req.params.id, habilidad)

            return res.status(200).json(persona)
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
