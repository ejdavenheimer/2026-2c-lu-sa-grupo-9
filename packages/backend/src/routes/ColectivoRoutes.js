import { Router } from "express";
import { ColectivoController } from "../controllers/ColectivoController.js";

const colectivoController = new ColectivoController();

const router = Router();

router.route("/")
    .get(colectivoController.listar)
    .post(colectivoController.crear);
router.route("/:id")
    .get(colectivoController.obtenerPorId)
    .put(colectivoController.actualizar)
    .delete(colectivoController.eliminar);

export default router;