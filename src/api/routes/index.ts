import { Router } from "express";
import serviceRoutes from "./service.route";
import credentialRoutes from "./credentials.route"
import configurationRoutes from "./configuration.route"
import accessLogRoutes from "./accessLog.routes.ts";
import bankRoutes from "./bank.routes";
import videoRoutes from "./videos.routes.ts"
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
const router = Router();

router.use("/banks", bankRoutes);
router.use("/services", serviceRoutes);
router.use("/credentials", credentialRoutes)
router.use("/configurations", configurationRoutes)
router.use("/videos", videoRoutes)

// Serve static files from the uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.use('/uploads', express.static(path.join(__dirname, "../../../uploads")));
router.use('/assets/images', express.static(path.join(__dirname, "../../assets/images")));
router.use("/access-log", accessLogRoutes);

export default router;
