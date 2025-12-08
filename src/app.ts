declare global {
  var _CONFIG: TopLevelConfig;
}

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import timeout from "connect-timeout";
import chalk from "chalk";
// import { connectRedis } from "./redisDB/redisConnection";

import { TopLevelConfig } from "./config/types/config";
import initConfig from "./config";
import mongoDB from "./mongoDB/mongoDB";
import router from "./api";
import { errorHandler, successHandler } from "./config/morgan";
import { errHandler, errorConverter } from "./lib/error";
import { connectProducer } from "./lib/kafkaProducer";
import { seedConfiguration } from "./lib/configuration.seeder";
import { seedServicesCategory } from "./lib/serviceSeeder";
import { seedBanks } from "./lib/bankSeeder";
import { useLogger } from "./middleware/loggerMiddleware";

// Load Environment Variables

dotenv.config();
const SEED_DB = true

// Handle Unhandled Rejections and Exceptions

process.on("unhandledRejection", (reason: string, p: Promise<any>) => {
  console.error("Unhandled Rejection at:", p, "reason:", reason);
});

process.on("uncaughtException", (error: Error) => {
  console.error(`Caught exception: ${error}\nException origin: ${error.stack}`);
});

// Database Connection

void mongoDB.connect();

// Initialize Express Application

const app = express();

// Middleware Setup

app.use(cors());
app.use(timeout("30s"));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Content-Type, access-control-allow-origin, x-api-applicationid, authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, PUT, PATCH, POST, DELETE"
  );
  next();
});
app.use(express.json());
app.set('query parser', 'extended')

app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(useLogger())

// API Routes
router(app);

// Start Server

const initApp = async () => {
  try {
    let _CONFIG: TopLevelConfig = await initConfig();

    global._CONFIG = _CONFIG;

    app.listen(_CONFIG.PORT_PAPERLESS_SERVICES, async () => {
      console.log(
        chalk.blue.italic(`Server listening on port ${_CONFIG.PORT_PAPERLESS_SERVICES}`)
      );
      await connectProducer();
    });
    void seedConfiguration();
    void seedBanks()
    if (SEED_DB) {
      void seedServicesCategory()
    }
  } catch (error) {
    console.error("Failed to load configuration and start the server:", error);
  }
};

initApp();

export default app;
