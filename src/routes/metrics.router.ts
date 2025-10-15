import { Router } from "express";
import { architecture, cyclomatic, dependencies, getMetricByName } from "../controllers/metrics.controller.js";
import { locSloc } from "../controllers/metrics.controller.js";

const router = Router();

// GET /metrics/:id/loc-sloc
router.get("/:id/loc-sloc", locSloc);


router.get("/:id/cyclomatic", cyclomatic);
router.get("/:id/dependencies", dependencies);
router.get("/:id/architecture", architecture);

 

// Metrics de Zazzali
router.get("/:id/:metricName", getMetricByName);

export default router;
