import { Router } from "express";
import { NotificacionController } from "../controllers/NotificacionController.js";

const router = Router();
const controller = new NotificacionController();

router.post("/", controller.enviar);
router.get("/", controller.listar);
router.get("/:id", controller.obtenerPorId);
router.patch("/:id", controller.actualizarLectura);

export default router;
