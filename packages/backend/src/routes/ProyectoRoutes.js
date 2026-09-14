import { Router } from "express";
import { ProyectoController } from "../controllers/ProyectoController.js";

const proyectoController = new ProyectoController();

const router = Router();

router.route("/")
    .get((req, res) => proyectoController.listar(req, res))
    .post((req, res) => proyectoController.crear(req, res));

router.route("/:id")
    .get((req, res) => proyectoController.obtenerPorId(req, res));

router.post("/:id/colaboraciones", (req, res) => proyectoController.anotarColaboracion(req, res));
router.patch("/:id/cerrar", (req, res) => proyectoController.cerrar(req, res));

export default router;
