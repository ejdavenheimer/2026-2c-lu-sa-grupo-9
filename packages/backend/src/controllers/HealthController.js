import { HealthService } from "../services/HealthService.js";

export class HealthController {
    static getHealth(req, res) {
        try {
            const healthData = HealthService.getHealth();
            return res.status(200).json(healthData);
        } catch (error) {
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error al obtener el estado del servidor',
                error: error.message
            });
        }
    }
}