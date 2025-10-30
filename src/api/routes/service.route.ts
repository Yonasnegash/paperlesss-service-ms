import { RequestHandler, Router } from "express";
import { serviceController } from "../../controller/service.controller";
import { authMiddleware } from "../../middleware/authenticate";

const router = Router()

router.get('/', authMiddleware , serviceController.getServices as RequestHandler)
router.get('/sub', authMiddleware ,serviceController.getSubServices as RequestHandler)

export default router