import { Router } from "express";
import { PersonaColaboradoraController } from "../controllers/PersonaColaboradoraController.js";

const personaColaboradoraController = new PersonaColaboradoraController();

const router = Router();

router.get("/", personaColaboradoraController.obtenerPersonasColaboradoras)
router.post("/", personaColaboradoraController.crearPersonaColaboradora);
    
router.get("/:id",personaColaboradoraController.obtenerPersonaColaboradoraPorId);
router.post("/:id/habilidades", personaColaboradoraController.agregarHabilidad);
router.post("/:id/medios-contacto", personaColaboradoraController.agregarMedioContacto);
router.put("/:id/medios-contacto", personaColaboradoraController.modificarMedioContacto);
router.delete("/:id/medios-contacto", personaColaboradoraController.eliminarMedioContacto);
    
export default router;
