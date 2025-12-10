import { Router } from "express";
import { videoController } from "../../controller/video.controller";
import { authMiddleware } from "../../middleware/authenticate";
import validate_payload from "../../middleware/validationMiddleware";
import { video_create_schema } from "../../config/schema/video.validation";
import { upload } from "../../utils/multer";
import { handleMulterErrors } from "../../middleware/multerErrorHandler";

const router = Router()

router.post('/', validate_payload(video_create_schema, "body"), (req, res, next) => {upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]) (req, res, (err) => {
    if (err) return handleMulterErrors(err, req, res, next)
        next()
})}, videoController.createVideo)
router.get('/', videoController.getVideos)
router.get('/:id', videoController.getVideo)
router.patch('/:id', videoController.updateVideo)
router.patch('/change-status/:id', videoController.changeVideoStatus)

export default router