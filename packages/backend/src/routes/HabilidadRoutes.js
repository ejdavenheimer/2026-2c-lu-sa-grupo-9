import { Router } from "express";
import { HabilidadController } from "../controllers/HabilidadController.js";

const router = Router();

router.route("/")
    .get(HabilidadController.listar)
    .post(HabilidadController.crear);

router.route("/:codigo")
    .get(HabilidadController.obtenerPorCodigo)
    .put(HabilidadController.actualizar)
    .delete(HabilidadController.eliminar);

export default router;

