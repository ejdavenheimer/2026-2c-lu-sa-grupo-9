import { Router } from "express";
import { ProyectoController } from "../controllers/ProyectoController.js";
import { PerfilController } from "../controllers/PerfilController.js";

const proyectoController = new ProyectoController();
const perfilController = new PerfilController();

const router = Router();

router.route("/")
    .get((req, res, next) => proyectoController.listar(req, res, next))
    .post((req, res, next) => proyectoController.crear(req, res, next));

router.route("/:id")
    .get((req, res, next) => proyectoController.obtenerPorId(req, res, next))
    .put((req, res) => proyectoController.modificar(req, res))
    .patch((req, res) => proyectoController.actualizar(req, res))
    .delete((req, res) => proyectoController.eliminar(req, res));

router.post("/:id/colaboraciones", (req, res, next) => proyectoController.anotarColaboracion(req, res, next));
router.patch("/:id/cerrar", (req, res, next) => proyectoController.cerrar(req, res, next));

router.route("/:id/perfiles")
    .post((req, res, next) => perfilController.crear(req, res, next))
    .get((req, res, next) => perfilController.listarPorProyecto(req, res, next));

router.route("/:id/perfiles/:perfilId")
    .get((req, res, next) => perfilController.obtenerPorId(req, res, next))
    .put((req, res, next) => perfilController.modificar(req, res, next))
    .delete((req, res, next) => perfilController.eliminar(req, res, next));

export default router;
