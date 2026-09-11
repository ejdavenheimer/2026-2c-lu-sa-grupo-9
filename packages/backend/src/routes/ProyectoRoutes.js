import { Router } from "express";
import { ProyectoController } from "../controllers/ProyectoController.js";

const router = Router();

router.post("/", ProyectoController.crear);
router.get("/", ProyectoController.listar);
router.get("/:id", ProyectoController.obtenerPorId);
router.post("/:id/colaboraciones", ProyectoController.anotarColaboracion);
router.patch("/:id/cerrar", ProyectoController.cerrar);

export default router;
