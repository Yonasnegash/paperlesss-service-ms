import { RequestHandler, Router } from "express";
import { credentialController } from "../../controller/credential.controller";
import validate_payload from "../../middleware/validationMiddleware";
import { authMiddleware } from "../../middleware/authenticate";
import { branch_schema } from "../../config/schema/branch.validation";

const router = Router()

// Credentials route
router.get('/', authMiddleware, credentialController.getCredentials as RequestHandler)
router.post('/generate', authMiddleware, validate_payload(branch_schema, "body"), credentialController.generateCredential as RequestHandler)
router.get('/:id', authMiddleware, credentialController.viewCredential as RequestHandler)

export default router