import { Router } from "express";
import HealthRoutes from "./HealthRoutes.js";
import HabilidadRoutes from "./HabilidadRoutes.js";
import ProyectoRoutes from "./ProyectoRoutes.js";

const router = Router();

router.use(HealthRoutes);
router.use("/habilidades", HabilidadRoutes);
router.use("/proyectos", ProyectoRoutes);

export default router;