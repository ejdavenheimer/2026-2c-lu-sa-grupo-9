import { Router } from "express";
import HealthRoutes from "./HealthRoutes.js";
import HabilidadRoutes from "./HabilidadRoutes.js";

const router = Router();

router.use(HealthRoutes);
router.use("/habilidades", HabilidadRoutes);

export default router;