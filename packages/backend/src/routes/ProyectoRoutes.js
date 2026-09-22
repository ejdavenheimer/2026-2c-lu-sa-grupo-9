import { Router } from "express";
import { ProyectoController } from "../controllers/ProyectoController.js";

const proyectoController = new ProyectoController();

const router = Router();

router.route("/")
    .get((req, res) => proyectoController.listar(req, res))
    .post((req, res) => proyectoController.crear(req, res));

router.route("/:id")
    .get((req, res) => proyectoController.obtenerPorId(req, res))
    .put((req, res) => proyectoController.modificar(req, res))
    .patch((req, res) => proyectoController.actualizar(req, res))
    .delete((req, res) => proyectoController.eliminar(req, res));

router.post("/:id/colaboraciones", (req, res) => proyectoController.anotarColaboracion(req, res));

export default router;
