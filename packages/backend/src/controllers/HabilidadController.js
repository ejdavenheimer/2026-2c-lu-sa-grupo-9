import { z } from "zod";
import { HabilidadService } from "../services/HabilidadService.js";

const habilidadEsquema = z.object({
    titulo: z.string().min(1, "El título de la habilidad es requerido"),
    codigo: z.string().optional(),
    descripcion: z.string().optional()
}).strict();

export class HabilidadController {
    static crear(req, res) {
        const parseResult = habilidadEsquema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json(parseResult.error.issues);
        }

        try {
            const nuevaHabilidad = HabilidadService.crearHabilidad(parseResult.data);
            return res.status(201).json(nuevaHabilidad);
        } catch (error) {
            return res.status(400).json({
                error: error.message
            });
        }
    }

    static listar(req, res) {
        try {
            const habilidades = HabilidadService.obtenerHabilidades();
            return res.status(200).json(habilidades);
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    static obtenerPorCodigo(req, res) {
        try {
            const { codigo } = req.params;
            const habilidad = HabilidadService.obtenerHabilidadPorCodigo(codigo);
            return res.status(200).json(habilidad);
        } catch (error) {
            return res.status(404).json({
                error: error.message
            });
        }
    }
}


