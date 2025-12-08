import pinoHttp, { Options } from "pino-http";
import { logger } from "../utils/logger.ts";
import { randomUUID } from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import { Request, Response, NextFunction } from "express";

export function useLogger() {
  const options: Options = {
    logger,
    customLogLevel: () => "silent",
    customSuccessMessage: () => (undefined as any),
    serializers: {
      req(req: IncomingMessage) {
        return { method: req.method, url: req.url, id: (req as any).id };
      },
      res(res: ServerResponse) {
        return { statusCode: res.statusCode };
      },
    },
  };

  const pinoMiddleware = pinoHttp(options);

  return (req: Request, res: Response, next: NextFunction) => {
    (pinoMiddleware as any)(req, res, () => {
      const reqHeader = req.headers["x-request-id"] as string || randomUUID();
      (req as any).id = reqHeader;
      req.log = req.log.child({ requestId: reqHeader });

      const originalJson = res.json.bind(res);

      res.json = function (body: any) {
        const status = res.statusCode;
        try {
          if (status >= 200 && status < 300) {
            req.log?.info({ statusCode: status }, "Response sent successfully");
          } else if (status >= 400) {
            const level: "error" | "warn" = status >= 500 ? "error" : "warn";
            req.log?.[level]({ response: body, statusCode: status }, "Response sent");
          }
        } catch {}
        return originalJson(body);
      };

      next();
    });
  };
}
