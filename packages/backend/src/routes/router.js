import { Router } from "express";
import HealthRoutes from "./HealthRoutes.js";

const router = Router();

router.use(HealthRoutes);

export default router;