import { RequestHandler, Router } from "express";
import { configurationController } from "../../controller/configuration.controller";
import validate_payload from "../../middleware/validationMiddleware";
import { authMiddleware } from "../../middleware/authenticate";
import { configuration_edit_schema } from "../../config/schema/configuration.validation";

const router = Router()

// Configuration routes
router.get('/', authMiddleware, configurationController.getConfigurations as RequestHandler)
router.patch('/', authMiddleware, validate_payload(configuration_edit_schema, "body"), configurationController.updateConfiguration as RequestHandler)
router.patch('/change-status/:id', authMiddleware, configurationController.changeConfigurationStatus as RequestHandler)

export default router