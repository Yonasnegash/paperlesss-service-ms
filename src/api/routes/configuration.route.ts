import { RequestHandler, Router } from "express";
import { configurationController } from "../../controller/configuration.controller";
import validate_payload from "../../middleware/validationMiddleware";
import { authMiddleware } from "../../middleware/authenticate";
import { configuration_schema } from "../../validations/configuration.validation";

const router = Router()

// Configuration routes
router.get('/configurations', configurationController.getConfigurations as RequestHandler)
router.post('/configurations', validate_payload(configuration_schema, 'body'), configurationController.createConfiguration as RequestHandler)
router.get('/configurations/:id', configurationController.updateConfiguration as RequestHandler)
router.patch('/configurations/change-status', configurationController.changeConfigurationStatus as RequestHandler)

export default router