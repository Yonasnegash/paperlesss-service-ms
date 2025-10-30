import { Router } from "express";
import serviceRoutes from "./service.route";
import bankRoutes from "./bank.routes";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
const router = Router();

router.use("/banks", bankRoutes);
router.use("/services", serviceRoutes);

// Serve static files from the uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.use('/uploads', express.static(path.join(__dirname, "../../../uploads")));
router.use('/assets/images', express.static(path.join(__dirname, "../../assets/images")));

export default router;
