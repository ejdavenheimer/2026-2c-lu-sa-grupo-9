import { HealthService } from "../services/HealthService.js";

export class HealthController {
    static async getHealth(req, res, next) {
        try {
            const healthData = HealthService.getHealth();

            return res.status(200).json(healthData);
        } catch (error) {
            return next(error);
        }
    }
}
