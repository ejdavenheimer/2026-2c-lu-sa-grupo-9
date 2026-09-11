import { Router } from "express";
import { ColectivoController } from "../controllers/ColectivoController.js";

const colectivoController = new ColectivoController();

const router = Router();

router.route("/")
    .get((req, res) => colectivoController.listar(req, res))
    .post((req, res) => colectivoController.crear(req, res));
    
router.route("/:codigo")
    .get((req, res) => colectivoController.obtenerPorCodigo(req, res));

export default router;