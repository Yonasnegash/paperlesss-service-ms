import { Router } from "express";
import transferController from "../../controller/bank.controller";
import validate_payload from "../../middleware/validationMiddleware";
import { query_validation } from "../../validations/common.validation";

import { authMiddleware } from "../../middleware/authenticate";

const router = Router();

router.get("/health-check", transferController.healthCheck);
router.get(
  "/fetch/all",
  validate_payload(query_validation, "query"),
  authMiddleware,
  transferController.fetchBanksList
);

export default router;