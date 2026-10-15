import { z } from "zod";
import { NotificacionService } from "../services/NotificacionService.js";
import { BadRequestError } from "../errors/AppError.js";

const enviarNotificacionEsquema = z
    .object({
        colectivoId: z.string().min(1, "El ID del colectivo es requerido"),
        personaColaboradoraId: z.string().min(1, "El ID de la persona colaboradora es requerido"),
        perfilId: z.string().min(1, "El ID del perfil es requerido"),
        contenido: z.string().min(1, "El contenido del mensaje es requerido"),
        replicarMediosExternos: z.boolean().optional()
    })
    .strict();

const actualizarLecturaEsquema = z
    .object({
        leida: z.boolean({ required_error: "El campo 'leida' es requerido y debe ser booleano" })
    })
    .strict();

export class NotificacionController {
    constructor(notificacionService = new NotificacionService()) {
        this.notificacionService = notificacionService;
    }

    validarBody(schema, body) {
        const resultado = schema.safeParse(body);
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

        throw new BadRequestError(detalle);
    }

    enviar = async (req, res, next) => {
        try {
            const datos = this.validarBody(enviarNotificacionEsquema, req.body);
            const nuevaNotificacion = await this.notificacionService.enviarNotificacion(datos);
            return res.status(201).json(nuevaNotificacion);
        } catch (error) {
            return next(error);
        }
    };

    listar = async (req, res, next) => {
        try {
            const { destinatarioId, colectivoId, soloNoLeidas } = req.query;
            const notificaciones = await this.notificacionService.obtenerNotificaciones({
                destinatarioId,
                colectivoId,
                soloNoLeidas: soloNoLeidas === "true" || soloNoLeidas === true
            });
            return res.status(200).json(notificaciones);
        } catch (error) {
            return next(error);
        }
    };

    obtenerPorId = async (req, res, next) => {
        try {
            const { id } = req.params;
            const notificacion = await this.notificacionService.obtenerNotificacionPorId(id);
            return res.status(200).json(notificacion);
        } catch (error) {
            return next(error);
        }
    };

    actualizarLectura = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { leida } = this.validarBody(actualizarLecturaEsquema, req.body);
            const notificacion = await this.notificacionService.actualizarEstadoLectura(id, leida);
            return res.status(200).json(notificacion);
        } catch (error) {
            return next(error);
        }
    };
}
