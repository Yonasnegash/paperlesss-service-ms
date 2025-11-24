import { RequestHandler, Router } from "express";
import { serviceController } from "../../controller/service.controller";
import validate_payload from "../../middleware/validationMiddleware";
import { authMiddleware } from "../../middleware/authenticate";
import { service_category_schema } from "../../validations/service_category.validation";
import { service_schema } from "../../validations/service.validation";

const router = Router()

// Service Category Routes
router.get('/categories', authMiddleware, serviceController.getCategoryServices as RequestHandler)
router.post('/categories',  authMiddleware,validate_payload(service_category_schema, "body"), serviceController.createCategoryServices as RequestHandler)
router.patch('/categories/:id', authMiddleware, serviceController.updateCategoryService as RequestHandler)
router.patch('/categories/change-status/:id', authMiddleware, serviceController.toggleCategoryServiceStatus as RequestHandler)

// Services Routes
router.get('/', authMiddleware, serviceController.getServices as RequestHandler)
router.post('/', authMiddleware, validate_payload(service_schema, "body"), serviceController.createService as RequestHandler)
router.patch('/:id', authMiddleware, serviceController.updateService as RequestHandler)
router.patch('/change-status/:id', authMiddleware, serviceController.changeServiceStatus as RequestHandler)

export default router