import { Router } from "express";
import { ProyectoController } from "../controllers/ProyectoController.js";

const proyectoController = new ProyectoController();

const router = Router();

router.route("/")
    .get((req, res) => proyectoController.listar(req, res))
    .post((req, res) => proyectoController.crear(req, res));

router.route("/:id")
    .get((req, res) => proyectoController.obtenerPorId(req, res))
    .patch((req, res) => proyectoController.actualizar(req, res));

router.post("/:id/colaboraciones", (req, res) => proyectoController.anotarColaboracion(req, res));

export default router;
