import { HabilidadService } from "../services/HabilidadService.js";

export class HabilidadController {
    static crear(req, res) {
        try {
            const { titulo, codigo, descripcion } = req.body;
            const nuevaHabilidad = HabilidadService.crearHabilidad({ titulo, codigo, descripcion });
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

