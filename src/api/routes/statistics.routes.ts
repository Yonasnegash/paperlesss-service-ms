// src/api/routes/statistics.routes.ts
import { Router, RequestHandler } from "express";
import {
  getGeneralStats,
  getBranchInsights,
  getBranchDetailStats,
  getCustomerStats,
  triggerAggregation
} from "../../controller/statistics.controller";

const router = Router();

router.get(
  "/general",
  getGeneralStats as RequestHandler
);

router.get(
  "/branch-insights",
  getBranchInsights as RequestHandler
);

router.get(
  "/branch/:branchId",
  getBranchDetailStats as RequestHandler
);

router.get(
  "/customers",
  getCustomerStats as RequestHandler
);

// Admin only - manual aggregation trigger
router.post(
  "/aggregate",
  // Add admin role check here if needed
  triggerAggregation as RequestHandler
);

export default router;