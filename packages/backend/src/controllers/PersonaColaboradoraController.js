import { PersonaColaboradoraService } from "../services/PersonaColaboradoraService.js";
import { CompatibilidadService } from "../services/CompatibilidadService.js";
import { z } from 'zod';
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";
import {TipoMedioContacto} from "../domain/enums.js";

const medioContactoEsquema = z.object({
    tipo: z.nativeEnum(TipoMedioContacto, {
        errorMap: () => ({ message: "Tipo de medio de contacto inválido" })
    }),
    valor: z.string().min(1, "El valor es requerido")
}).strict();

const LIMITE_MAXIMO = 100;

const busquedaCompatibleEsquema = z
    .object({
        estricto: z
            .enum(["true", "false"], { error: 'estricto tiene que ser "true" o "false"' })
            .transform((valor) => valor === "true")
            .optional(),
        limite: z.coerce
            .number({ error: "limite tiene que ser un número" })
            .int("limite tiene que ser un número entero")
            .positive("limite tiene que ser mayor a cero")
            .max(LIMITE_MAXIMO, `limite no puede ser mayor a ${LIMITE_MAXIMO}`)
            .optional()
    })
    .strict();

const personaColaboradoraValida = z.object({
    nombreFantasia: z.string().default(null),
    nombre: z.string().default(null),
    apellido: z.string().default(null),
    pronombres: z.array(z.string()).default([]),
    presentacion: z.string().default(""),
    cuentas: z.array(z.any()).default([]),
    habilidades: z.array(z.any()).default([]),
    colaboraciones: z.array(z.any()).default([]),
    mensajesInternos: z.boolean().default(false),
    mediosDeContacto: z.array(medioContactoEsquema).default([])
}).strict();

const habilidadEsquema = z.object({
    titulo: z.string().default(""),
    codigo: z.string().default(""),
    descripcion: z.string().default("")
}).strict();

const actualizacionPersonaColaboradoraEsquema = z.object({
    nombreFantasia: z.string().optional().nullable(),
    nombre: z.string().optional().nullable(),
    apellido: z.string().optional().nullable(),
    pronombres: z.array(z.string()).optional(),
    presentacion: z.string().optional(),
    cuentas: z.array(z.any()).optional(),
    mensajesInternos: z.boolean().optional(),
    mediosDeContacto: z.array(medioContactoEsquema).optional()
}).strict();

export class PersonaColaboradoraController {

    constructor(
        personaColaboradoraService = new PersonaColaboradoraService(),
        compatibilidadService = new CompatibilidadService()
    ) {
        this.personaColaboradoraService = personaColaboradoraService;
        this.compatibilidadService = compatibilidadService;
    }

    obtenerPersonasColaboradoras = async (req, res, next) => {
        try {
            const personas = await this.personaColaboradoraService.listarPersonasColaboradoras();
            return res.status(200).json(personas);
        } catch (error) {
            return next(error);
        }
    }

    obtenerPersonaColaboradoraPorId = async (req, res, next) => {
        try {
            const persona = await this.personaColaboradoraService.obtenerPersonaColaboradoraPorId(req.params.id);
            return res.status(200).json(persona);
        } catch (error) {
            return next(error);
        }
    }

    crearPersonaColaboradora = async (req, res, next) => {
        try {
            const datosPersona = this.validarBody(personaColaboradoraValida, req.body);
            const nuevaPersona = await this.personaColaboradoraService.crearPersonaColaboradora(datosPersona);
            return res.status(201).json(nuevaPersona);
        } catch (error) {
            return next(error);
        }
    }

    agregarHabilidad = async (req, res, next) => {
        try {
            const habilidad = this.validarBody(habilidadEsquema, req.body);
            const persona = await this.personaColaboradoraService.agregarHabilidad(req.params.id, habilidad);
            return res.status(200).json(persona);
        } catch (error) {
            return next(error);
        }
    }

    buscarProyectosCompatibles = async (req, res, next) => {
        try {
            const opciones = this.validarBody(busquedaCompatibleEsquema, req.query);
            const resultados = await this.compatibilidadService.buscarProyectosCompatibles(
                req.params.id,
                opciones
            );
            return res.status(200).json(resultados);
        } catch (error) {
            return next(error);
        }
    }

    actualizarPersonaColaboradora = async (req, res, next) => {
        try {
            const { id } = req.params;
            const parseResult = actualizacionPersonaColaboradoraEsquema.safeParse(req.body);
            if (!parseResult.success) {
                const detalle = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
                throw new BadRequestError(detalle);
            }
            const personaActualizada = await this.personaColaboradoraService.actualizarPersonaColaboradora(id, parseResult.data);
            return res.status(200).json(personaActualizada);
        } catch (error) {
            return next(error);
        }
    }

    eliminarPersonaColaboradora = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.personaColaboradoraService.eliminarPersonaColaboradora(id);
            return res.status(204).send();
        } catch (error) {
            return next(error);
        }
    }

    obtenerMediosDeContacto = async (req, res, next) => {
        try {
            const medios = await this.personaColaboradoraService.listarMediosDeContacto(req.params.id);
            return res.status(200).json(medios);
        } catch (error) {
            return next(error);
        }
    }

    agregarMedioDeContacto = async (req, res, next) => {
        try {
            const datosMedio = this.validarBody(medioContactoEsquema, req.body);
            const personaActualizada = await this.personaColaboradoraService.agregarMedioDeContacto(req.params.id, datosMedio);
            return res.status(201).json(personaActualizada);
        } catch (error) {
            return next(error);
        }
    }

    actualizarMedioDeContacto = async (req, res, next) => {
        try {
            const { id } = req.params;
            const datosNuevos = this.validarBody(medioContactoEsquema, req.body);
            const personaActualizada = await this.personaColaboradoraService.actualizarMediosDeContacto(id, datosNuevos);
            return res.status(200).json(personaActualizada);
        } catch (error) {
            return next(error);
        }
    }

    eliminarMedioDeContacto = async (req, res, next) => {
        try {
            const { id, tipoMedio } = req.params;
            const personaActualizada = await this.personaColaboradoraService.eliminarMedioDeContacto(id, tipoMedio);
            return res.status(204).json(personaActualizada);
        } catch (error) {
            return next(error);
        }
    }

    validarBody(esquema, body) {
        const resultado = esquema.safeParse(body);
        if (resultado.success) {
            return resultado.data;
        }
        const esEstructural = resultado.error.issues.some(
            (issue) => issue.code === "invalid_type" || issue.code === "unrecognized_keys"
        );
        const detalle = resultado.error.issues
            .map((issue) => {
                const campo = issue.path.join(".");
                return campo ? `${campo}: ${issue.message}` : issue.message;
            })
            .join("; ");
        throw esEstructural ? new BadRequestError(detalle) : new UnprocessableEntityError(detalle);
    }
}
