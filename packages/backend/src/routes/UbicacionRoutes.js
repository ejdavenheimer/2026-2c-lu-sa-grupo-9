import { Router } from "express";
import { UbicacionController } from "../controllers/UbicacionController.js";

const ubicacionController = new UbicacionController();
const router = Router();

router.get("/provincias", ubicacionController.listarProvincias);
router.get("/paises", ubicacionController.listarPaises);

export default router;
