import { Router } from "express";
import { PersonaColaboradoraController } from "../controllers/PersonaColaboradoraController.js";

const personaColaboradoraController = new PersonaColaboradoraController();

const router = Router();

router.route("/")
    .get(personaColaboradoraController.obtenerPersonasColaboradoras)
    .post(personaColaboradoraController.crearPersonaColaboradora);
    
router.route("/:id")
    .get(personaColaboradoraController.obtenerPersonaColaboradoraPorId)
    .put(personaColaboradoraController.actualizarPersonaColaboradora)
    .delete(personaColaboradoraController.eliminarPersonaColaboradora);

router.post("/:id/habilidades", personaColaboradoraController.agregarHabilidad);

router.get("/:id/proyectos-compatibles", personaColaboradoraController.buscarProyectosCompatibles);
    
export default router;
