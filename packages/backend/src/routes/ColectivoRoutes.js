import { Router } from "express";
import { ColectivoController } from "../controllers/ColectivoController.js";

const colectivoController = new ColectivoController();

const router = Router();

router.get("/", colectivoController.listar)
router.post("/", colectivoController.crear);
    
router.get("/:id", colectivoController.obtenerPorCodigo);

export default router;