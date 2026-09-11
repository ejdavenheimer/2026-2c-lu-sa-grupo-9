import { Router } from "express";
import HealthRoutes from "./HealthRoutes.js";
import HabilidadRoutes from "./HabilidadRoutes.js";
import ProyectoRoutes from "./ProyectoRoutes.js";
import ColectivoRoutes from "./ColectivoRoutes.js" 
import PersonaColaboradoraRoutes from "./PersonaColaboradoraRoutes.js"

const router = Router();

router.use(HealthRoutes);
router.use("/habilidades", HabilidadRoutes);
router.use("/proyectos", ProyectoRoutes);
router.use("/colectivos", ColectivoRoutes);
router.use("/personasColaboradoras", PersonaColaboradoraRoutes)
export default router;