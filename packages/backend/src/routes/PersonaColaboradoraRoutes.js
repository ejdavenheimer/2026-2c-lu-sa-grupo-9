import { Router } from "express";
import { PersonaColaboradoraController } from "../controllers/PersonaColaboradoraController.js";

const personaColaboradoraController = new PersonaColaboradoraController();

const router = Router();

router.route("/")
    .get((req, res, next) => personaColaboradoraController.obtenerPersonasColaboradoras(req, res, next))
    .post((req, res, next) => personaColaboradoraController.crearPersonaColaboradora(req, res, next));
    
router.route("/:id")
    .get((req, res, next) => personaColaboradoraController.obtenerPersonaColaboradoraPorId(req, res, next))
    .put((req, res, next) => personaColaboradoraController.actualizarPersonaColaboradora(req, res, next))
    .delete((req, res, next) => personaColaboradoraController.eliminarPersonaColaboradora(req, res, next));

router.post("/:id/habilidades",
    (req, res, next) => personaColaboradoraController.agregarHabilidad(req, res, next));

router.get("/:id/proyectos-compatibles",
    (req, res, next) => personaColaboradoraController.buscarProyectosCompatibles(req, res, next));

router.route("/:id/medios-contacto")
    .get((req, res, next) => personaColaboradoraController.obtenerMediosDeContacto(req, res, next))
    .post((req, res, next) => personaColaboradoraController.agregarMedioDeContacto(req, res, next))
    .patch((req, res, next) =>  personaColaboradoraController.actualizarMedioDeContacto(req, res, next));

router.delete("/:id/medios-contacto/:tipoMedio",
    (req, res, next) => personaColaboradoraController.eliminarMedioDeContacto(req, res, next));

export default router;
