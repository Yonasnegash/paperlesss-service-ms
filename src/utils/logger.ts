import pino from "pino";
import { Transform } from "stream";
import { createStream } from "rotating-file-stream";
import fs from "fs";
import path from "path";

const enviroment = process.env.NODE_ENV || "dev";
const SERVICE_NAME = process.env.SERVICE_NAME || "SERVICES";
const LOG_DIR = path.join(process.cwd(), `logs/${enviroment}/${SERVICE_NAME}/`);
const STREAM_NAME = `PAPERLESS-${SERVICE_NAME}-${enviroment}`;
const rotStream = createNamedRotatingStream(STREAM_NAME);


if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function createNamedRotatingStream(name: string) {
  return createStream((time, index) => {
    const dateObj = time instanceof Date ? time : new Date(time || Date.now());
    const date = dateObj.toISOString().split("T")[0].replace(/-/g, ""); 
    const suffix = index ? `(${index})` : "";

    return `${name}-${date}${suffix}.log`;
  }, {
    interval: "1d",
    size: "10M",
    compress: "gzip",
    path: LOG_DIR,
  });
}

const levelLabel = (n: number): string => {
  switch (n) {
    case 10: return "trace";
    case 20: return "debug";
    case 30: return "info";
    case 40: return "warn";
    case 50: return "error";
    case 60: return "fatal";
    default: return "info";
  }
};

class PrettyFormatter extends Transform {
  _transform(chunk: any, _encoding: BufferEncoding, callback: (err?: Error | null) => void) {
    try {
      const obj = JSON.parse(chunk.toString());
      const time = new Date(obj.time || obj.timestamp || Date.now())
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d+Z$/, "");
      const lvl = levelLabel(obj.level ?? 30).toUpperCase();
      const method = obj.req?.method ?? "-";
      const url = obj.req?.url ?? "-";
      const traceId = obj.requestId || obj.req?.id || obj.reqId || obj.id;
      const msg = obj.msg ?? obj.message ?? "";
      const responseBody = obj.response ?? null;

      let formatted = `${time} ${lvl}: [${method} ${url}] [Request ID: ${traceId}] ${msg}`;
      if (responseBody) {
        formatted += ` - ${
          typeof responseBody === "string"
            ? responseBody
            : JSON.stringify(responseBody)
        }`;
      }

    // Append user metadata if present
      const userMeta: Record<string, unknown> = {};
      ["userId", "fullName", "phoneNumber", "accountNumber", "userCode"].forEach((k) => {
        if (obj[k] !== undefined) userMeta[k] = obj[k];
      });
      if (Object.keys(userMeta).length) {
        formatted += ` - ${JSON.stringify(userMeta)}`;
      }
      formatted += "\n\n";

      this.push(formatted);
    } catch {
      this.push(chunk);
    }
    callback();
  }
}

const prettyFormatter = new PrettyFormatter();

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: { service: SERVICE_NAME },
    timestamp: pino.stdTimeFunctions.isoTime,
    messageKey: "msg",
  },
  prettyFormatter as unknown as NodeJS.WritableStream
);

prettyFormatter.pipe(rotStream);

export { rotStream, prettyFormatter };