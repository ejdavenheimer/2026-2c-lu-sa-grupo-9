import { z } from "zod";
import { ProyectoService } from "../services/ProyectoService.js";
import { UnidadCompromiso, ModalidadColaboracion } from "../domain/enums.js";

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
});


const anotacionEsquema = z.object({
    personaColaboradoraId: z.string().min(1, "El ID de la persona colaboradora es requerido")
});

export class ProyectoController {
    static crear(req, res) {
        const parseResult = proyectoEsquema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(parseResult.error.issues);
        }

        try {
            const nuevoProyecto = ProyectoService.crearProyecto(parseResult.data);
            return res.status(201).json(nuevoProyecto);
        } catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    }

    static listar(req, res) {
        try {
            const proyectos = ProyectoService.obtenerProyectos();
            return res.status(200).json(proyectos);
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    static obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            const proyecto = ProyectoService.obtenerProyectoPorId(id);
            return res.status(200).json(proyecto);
        } catch (error) {
            return res.status(404).json({
                error: error.message
            });
        }
    }

    static anotarColaboracion(req, res) {
        const parseResult = anotacionEsquema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(parseResult.error.issues);
        }

        try {
            const { id } = req.params;
            const { personaColaboradoraId } = parseResult.data;
            const colaboracion = ProyectoService.anotarColaborador(id, { personaColaboradoraId });
            return res.status(201).json(colaboracion);
        } catch (error) {
            const status = error.message.includes("No se encontró") ? 404 : 400;
            return res.status(status).json({
                error: error.message
            });
        }
    }

    static cerrar(req, res) {
        try {
            const { id } = req.params;
            const proyectoCerrado = ProyectoService.cerrarProyecto(id);
            return res.status(200).json({
                message: "Proyecto cerrado exitosamente",
                proyecto: proyectoCerrado
            });
        } catch (error) {
            const status = error.message.includes("No se encontró") ? 404 : 400;
            return res.status(status).json({
                error: error.message
            });
        }
    }
}

