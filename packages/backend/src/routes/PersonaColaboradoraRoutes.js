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
router.post("/:id/medios-contacto", personaColaboradoraController.agregarMedioContacto);
router.put("/:id/medios-contacto", personaColaboradoraController.modificarMedioContacto);
router.delete("/:id/medios-contacto", personaColaboradoraController.eliminarMedioContacto);

router.get("/:id/proyectos-compatibles", personaColaboradoraController.buscarProyectosCompatibles);
    
export default router;
