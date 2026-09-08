import { Router } from "express";
import { HabilidadController } from "../controllers/HabilidadController.js";

const router = Router();

router.post("/", HabilidadController.crear);
router.get("/", HabilidadController.listar);
router.get("/:codigo", HabilidadController.obtenerPorCodigo);

export default router;

