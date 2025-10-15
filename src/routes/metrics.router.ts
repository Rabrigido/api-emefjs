import { Router } from "express";
import { getMetricByName } from "../controllers/metrics.controller.js";
import { locSloc } from "../controllers/metrics.controller.js";

const router = Router();

// GET /metrics/:id/loc-sloc
router.get("/:id/loc-sloc", locSloc);

// Metrics de Zazzali
router.get("/:id/:metricName", getMetricByName);



export default router;
