import { z } from "zod";
import { PerfilService } from "../services/PerfilService.js";
import { UnidadCompromiso, ModalidadColaboracion } from "../domain/enums.js";
import { BadRequestError, UnprocessableEntityError } from "../errors/AppError.js";

const crearPerfilEsquema = z.object({
    descripcion: z.string().min(1, "La descripción es requerida"),
    habilidadesObligatoriasCodigos: z.array(z.string()).min(1, "Debe indicar al menos una habilidad obligatoria"),
    habilidadesOpcionalesCodigos: z.array(z.string()).optional(),
    unidadCompromiso: z.enum(Object.values(UnidadCompromiso)),
    cantidadHoras: z.number().positive("La cantidad de horas debe ser un número positivo"),
    modalidadesColaboracion: z
        .array(z.enum(Object.values(ModalidadColaboracion)))
        .min(1, "Debe indicar al menos una modalidad de colaboración")
}).strict();

const modificarPerfilEsquema = z.object({
    descripcion: z.string().min(1, "La descripción no puede estar vacía").optional(),
    habilidadesObligatoriasCodigos: z.array(z.string()).min(1, "Debe indicar al menos una habilidad obligatoria").optional(),
    habilidadesOpcionalesCodigos: z.array(z.string()).optional(),
    unidadCompromiso: z.enum(Object.values(UnidadCompromiso)).optional(),
    cantidadHoras: z.number().positive("La cantidad de horas debe ser un número positivo").optional(),
    modalidadesColaboracion: z
        .array(z.enum(Object.values(ModalidadColaboracion)))
        .min(1, "Debe indicar al menos una modalidad de colaboración")
        .optional()
}).strict();

export class PerfilController {
    constructor(perfilService = new PerfilService()) {
        this.perfilService = perfilService;
    }

    crear = async (req, res, next) => {
        try {
            const { id: proyectoId } = req.params;
            const datosPerfil = this.validarBody(crearPerfilEsquema, req.body);
            const nuevoPerfil = this.perfilService.crearPerfil(proyectoId, datosPerfil);

            return res.status(201).json(nuevoPerfil);
        } catch (error) {
            return next(error);
        }
    };

    listarPorProyecto = async (req, res, next) => {
        try {
            const { id: proyectoId } = req.params;
            const perfiles = this.perfilService.obtenerPerfiles(proyectoId);

            return res.status(200).json(perfiles);
        } catch (error) {
            return next(error);
        }
    };

    obtenerPorId = async (req, res, next) => {
        try {
            const { id: proyectoId, perfilId } = req.params;
            const perfil = this.perfilService.obtenerPerfilPorId(proyectoId, perfilId);

            return res.status(200).json(perfil);
        } catch (error) {
            return next(error);
        }
    };

    modificar = async (req, res, next) => {
        try {
            const { id: proyectoId, perfilId } = req.params;
            const datosPerfil = this.validarBody(modificarPerfilEsquema, req.body);
            const perfilModificado = this.perfilService.modificarPerfil(proyectoId, perfilId, datosPerfil);

            return res.status(200).json(perfilModificado);
        } catch (error) {
            return next(error);
        }
    };

    eliminar = async (req, res, next) => {
        try {
            const { id: proyectoId, perfilId } = req.params;
            this.perfilService.eliminarPerfil(proyectoId, perfilId);

            return res.status(204).send();
        } catch (error) {
            return next(error);
        }
    };

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
