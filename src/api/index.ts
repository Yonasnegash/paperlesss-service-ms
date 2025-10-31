import { type Express } from "express";

import router from "./routes";
export default function initRoutes(app: Express): void {
  app.use("/v1.0/chatbirrapi/paperless", router);
}
