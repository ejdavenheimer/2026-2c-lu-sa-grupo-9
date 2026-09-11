import { Router } from "express";
import { PersonaColaboradoraController } from "../controllers/PersonaColaboradoraController.js";

const personaColaboradoraController = new PersonaColaboradoraController();

const router = Router();

router.route('/')
    .get((req, res) => personaColaboradoraController.obtenerPersonasColaboradoras(req, res))
    .post((req, res) => personaColaboradoraController.crearPersonaColaboradora(req, res));
    
router.route('/:codigo')
    .get((req, res) => personaColaboradoraController.obtenerPersonaColaboradoraPorId(req, res))
    .post((req, res) => personaColaboradoraController.agregarHabilidad(req, res));
    
export default router;
