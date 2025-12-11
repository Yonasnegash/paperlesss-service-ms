import express, { RequestHandler } from "express";
import {
  getLogs,
  getLogFile,
} from "../../controller/accessLogs.controller.ts";
import { authMiddleware } from "../../middleware/authenticate.ts";

const router = express.Router();

router.get(
  "/logs",
  authMiddleware,
  // authorization("create user") as RequestHandler,
  getLogs as RequestHandler
);

router.get(
  "/logs/file/:filename",
  // auth(),
  getLogFile as RequestHandler
);

export default router;
