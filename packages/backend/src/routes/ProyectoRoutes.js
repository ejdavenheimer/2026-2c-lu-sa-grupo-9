import { Router } from "express";
import { ProyectoController } from "../controllers/ProyectoController.js";

const proyectoController = new ProyectoController();

const router = Router();

router.route("/")
    .get((req, res, next) => proyectoController.listar(req, res, next))
    .post((req, res, next) => proyectoController.crear(req, res, next));

router.route("/:id")
    .get((req, res, next) => proyectoController.obtenerPorId(req, res, next));

router.post("/:id/colaboraciones", (req, res, next) => proyectoController.anotarColaboracion(req, res, next));
router.patch("/:id/cerrar", (req, res, next) => proyectoController.cerrar(req, res, next));

router.route("/:id/hitos")
    .get((req, res, next) => proyectoController.listarHitos(req, res, next))
    .post((req, res, next) => proyectoController.registrarHito(req, res, next));

router.route("/:id/hitos/:hitoId")
    .get((req, res, next) => proyectoController.obtenerHitoPorId(req, res, next))
    .patch((req, res, next) => proyectoController.actualizarHito(req, res, next))
    .delete((req, res, next) => proyectoController.eliminarHito(req, res, next));

router.patch("/:id/enlaces", (req, res, next) => proyectoController.actualizarEnlaces(req, res, next));

export default router;
