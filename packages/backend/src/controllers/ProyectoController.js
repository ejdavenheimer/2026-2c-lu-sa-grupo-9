import { ProyectoService } from "../services/ProyectoService.js";

export class ProyectoController {
    static crear(req, res) {
        try {
            const nuevoProyecto = ProyectoService.crearProyecto(req.body);
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
        try {
            const { id } = req.params;
            const { personaColaboradoraId } = req.body;
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
