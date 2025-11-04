import { RequestHandler, Router } from "express";
import { credentialController } from "../../controller/credential.controller";
import validate_payload from "../../middleware/validationMiddleware";
import { authMiddleware } from "../../middleware/authenticate";
import { branch_schema } from "../../validations/branch.validation";

const router = Router()

// Credentials route
router.get('/', credentialController.getCredentials as RequestHandler)
router.post('/generate', validate_payload(branch_schema, "body"), credentialController.generateCredential as RequestHandler)
router.get('/:id', credentialController.viewCredential as RequestHandler)

export default router