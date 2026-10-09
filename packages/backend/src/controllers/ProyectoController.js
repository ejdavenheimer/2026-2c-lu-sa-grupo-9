import { z } from "zod";
import { ProyectoService } from "../services/ProyectoService.js";
import { UnidadCompromiso, ModalidadColaboracion, EstadoProyecto } from "../domain/enums.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const proyectoEsquema = z.object({
    titulo: z.string().min(1, "El título es requerido"),
    descripcion: z.string().min(1, "La descripción es requerida"),
    unidadCompromiso: z.enum(Object.values(UnidadCompromiso)),
    cantidadHoras: z.number().positive("La cantidad de horas debe ser un número positivo"),
    modalidadesColaboracion: z
        .array(z.enum(Object.values(ModalidadColaboracion)))
        .min(1, "Debe indicar al menos una modalidad de colaboración"),
    colectivoId: z.string().min(1, "El ID del colectivo es requerido"),
    habilidadesRequeridasCodigos: z.array(z.string()).min(1, "Debe indicar al menos una habilidad requerida")
}).strict();

const anotacionEsquema = z.object({
    personaColaboradoraId: z.string().min(1, "El ID de la persona colaboradora es requerido")
}).strict();

const actualizacionProyectoEsquema = z.object({
    estado: z.enum([EstadoProyecto.CERRADO])
}).strict();

const modificarProyectoEsquema = z.object({
    titulo: z.string().min(1, "El título no puede estar vacío").optional(),
    descripcion: z.string().min(1, "La descripción no puede estar vacía").optional(),
    unidadCompromiso: z.enum(Object.values(UnidadCompromiso)).optional(),
    cantidadHoras: z.number().positive("La cantidad de horas debe ser un número positivo").optional(),
    modalidadesColaboracion: z
        .array(z.enum(Object.values(ModalidadColaboracion)))
        .min(1, "Debe indicar al menos una modalidad de colaboración")
        .optional(),
    habilidadesRequeridasCodigos: z.array(z.string()).min(1, "Debe indicar al menos una habilidad requerida").optional()
}).strict();

export class ProyectoController {

    constructor(proyectoService = new ProyectoService()) {
        this.proyectoService = proyectoService;
    }

    crear = async (req, res, next) => {
        try {
            const datosProyecto = this.validarBody(proyectoEsquema, req.body);
            const nuevoProyecto = this.proyectoService.crearProyecto(datosProyecto);

            return res.status(201).json(nuevoProyecto);
        } catch (error) {
            return next(error);
        }
    }

    listar = async (req, res, next) => {
        try {
            const proyectos = this.proyectoService.obtenerProyectos();

            return res.status(200).json(proyectos);
        } catch (error) {
            return next(error);
        }
    }

    obtenerPorId = async (req, res, next) => {
        try {
            const proyecto = this.proyectoService.obtenerProyectoPorId(req.params.id);

            return res.status(200).json(proyecto);
        } catch (error) {
            return next(error);
        }
    }

    anotarColaboracion = async (req, res, next) => {
        try {
            const { personaColaboradoraId } = this.validarBody(anotacionEsquema, req.body);
            const colaboracion = this.proyectoService.anotarColaborador(req.params.id, { personaColaboradoraId });

            return res.status(201).json(colaboracion);
        } catch (error) {
            return next(error);
        }
    }

    actualizar = (req, res) => {
        const parseResult = actualizacionProyectoEsquema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(parseResult.error.issues);
        }

        try {
            const { id } = req.params;
            const { estado } = parseResult.data;

            if (estado === EstadoProyecto.CERRADO) {
                const proyectoCerrado = this.proyectoService.cerrarProyecto(id);
                return res.status(200).json(proyectoCerrado);
            }
        } catch (error) {
            const status = error.message.includes("No se encontró") ? 404 : 400;
            return res.status(status).json({
                error: error.message
            });
        }
    }

    modificar = (req, res) => {
        const { id } = req.params;
        const parseResult = modificarProyectoEsquema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(parseResult.error.issues);
        }

        try {
            const proyectoModificado = this.proyectoService.actualizarProyecto(id, parseResult.data);
            return res.status(200).json(proyectoModificado);
        } catch (error) {
            const status = error.message.includes("No se encontró") ? 404 : 400;
            return res.status(status).json({
                error: error.message
            });
        }
    }

    eliminar = (req, res) => {
        const { id } = req.params;
        try {
            this.proyectoService.eliminarProyecto(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(404).json({
                error: error.message
            });
        }
    }
  
    cerrar = async (req, res, next) => {
        try {
            const proyectoCerrado = this.proyectoService.cerrarProyecto(req.params.id);

            return res.status(200).json({
                message: "Proyecto cerrado exitosamente",
                proyecto: proyectoCerrado
            });
        } catch (error) {
            return next(error);
        }
    }

    // 400 si la request está malformada (falta un campo, tipo incorrecto, campo de más);
    // 422 si los valores llegaron bien pero violan una regla, igual que el dominio.
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
                const campo = issue.path.join(".")
                return campo ? `${campo}: ${issue.message}` : issue.message
            })
            .join("; ");

        throw esEstructural ? new BadRequestError(detalle) : new UnprocessableEntityError(detalle);
    }
}
