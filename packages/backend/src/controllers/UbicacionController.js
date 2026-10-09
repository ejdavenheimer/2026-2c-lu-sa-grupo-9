import { UbicacionService } from "../services/UbicacionService.js";

export class UbicacionController {
    constructor(ubicacionService = new UbicacionService()) {
        this.ubicacionService = ubicacionService;
    }

    listarProvincias = async (req, res) => {
        try {
            const provincias = await this.ubicacionService.obtenerProvincias();
            return res.status(200).json(provincias);
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }

    listarPaises = (req, res) => {
        try {
            const paises = this.ubicacionService.obtenerPaises();
            return res.status(200).json(paises);
        } catch (error) {
            return res.status(500).json({
                error: error.message
            });
        }
    }
}
