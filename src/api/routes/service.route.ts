import { RequestHandler, Router } from "express";
import { serviceController } from "../../controller/service.controller";
import validate_payload from "../../middleware/validationMiddleware";
import { authMiddleware } from "../../middleware/authenticate";
import { service_category_schema } from "../../validations/service_category.validation";
import { service_schema } from "../../validations/service.validation";

const router = Router()

// Service Category Routes
router.get('/categories', serviceController.getCategoryServices as RequestHandler)
router.post('/categories', validate_payload(service_category_schema, "body"), serviceController.createCategoryServices as RequestHandler)
router.patch('/categories/:id', serviceController.updateCategoryService as RequestHandler)
router.patch('/categories/change-status/:id', serviceController.toggleCategoryServiceStatus as RequestHandler)

// Services Routes
router.get('/', serviceController.getServices as RequestHandler)
router.post('/', validate_payload(service_schema, "body"), serviceController.createService as RequestHandler)
router.patch('/:id', serviceController.updateService as RequestHandler)
router.patch('/change-status', serviceController.changeServiceStatus as RequestHandler)

export default router