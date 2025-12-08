import dotenv from "dotenv";
dotenv.config();

import vault from "node-vault";
import { TopLevelConfig } from "./types/config";

const vaultClient = vault({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN,
});

async function loadConfig() {
  try {
    const result = await vaultClient.read(
      process.env.VAULT_PATH_STAGING as string
    );
    // console.log("result ", result.data.data);

    return result.data.data;
  } catch (error) {
    console.error("Error reading from Vault:", error);
    throw error;
  }
}

const getConfig = (config: TopLevelConfig) => ({
  // MONGODB_URL: 'mongodb://10.1.15.163/CBEIB-Sandbox-DB',
  MONGODB_URL: config.MONGODB_URL as string,
  MONGODB_PAPERLESS_URL: config.MONGODB_PAPERLESS_URL as string,
  PAPERLESS_LOGS_BASE_URL: config.PAPERLESS_LOGS_BASE_URL as string,
  MINIO_ENDPOINT: config.MINIO_ENDPOINT as string,
  PAPERLESS_ASSETS_BASE_URL: config.PAPERLESS_ASSETS_BASE_URL as string,
  PORT_MINIO: config.PORT_MINIO as number,
  MINIO_ACCESS_KEY: config.MINIO_ACCESS_KEY as string,
  MINIO_SECRET_KEY: config.MINIO_SECRET_KEY as string,
  MINIO_BUCKET_NAME: config.MINIO_BUCKET_NAME as string,
  _JWTSECRET: config._JWTSECRET as string,
  _JWTEXPIREY: config._JWTEXPIREY as string,
  _TEMPSESSIONTIMEOUT: config._TEMPSESSIONTIMEOUT as string,
  PORT_PAPERLESS: config.PORT_PAPERLESS as string,
  PORT_PAPERLESS_APPLICATIONS: config.PORT_PAPERLESS_APPLICATIONS as string,
  PORT_PAPERLESS_AUTH: config.PORT_PAPERLESS_AUTH as string,
  PORT_PAPERLESS_SERVICES: config.PORT_PAPERLESS_SERVICES as string,
  PORT_PAPERLESS_BANKING: config.PORT_PAPERLESS_BANKING as string,
  PORT_PAPERLESS_NOTIFICATION: config.PORT_PAPERLESS_NOTIFICATION as string,
  PAPERLESS_CREDENTIAL_SECRET_KEY: config.PAPERLESS_CREDENTIAL_SECRET_KEY as string,
  BANK_URL: config.BANK_URL as string,
  OTHER_BANK_URL: config.OTHER_BANK_URL,
  WALLET_URL: config.WALLET_URL,
  REDIS_HOST: config.REDIS_HOST,
  REDIS_PORT: config.REDIS_PORT,
  REDIS_BASICAUTH: config.REDIS_BASICAUTH,
  PWDSecretKey: config.PWDSecretKey,
  PWDiv: config.PWDiv,
  UTILITIES_URL: config.UTILITIES_URL as string,
  DSTV_URL: config.DSTV_URL as string,
  TRAFFIC_URL: config.TRAFFIC_URL as string,
  CPS_PUBLIC_ASSET_DOMAIN: config.CPS_PUBLIC_ASSET_DOMAIN as string,
  QR_URL: config.QR_URL as string,
  QR_EXPIREY: config.QR_EXPIREY as string,
  DSTV_CORE_URL: config.DSTV_CORE_URL as string,
  DSTV_SOAP_ACTION: config.DSTV_SOAP_ACTION as string,
  DSTV_BUSINESS_UNIT: config.DSTV_BUSINESS_UNIT as string,
  DSTV_INTERFACE_TYPE: config.DSTV_INTERFACE_TYPE as string,
  DSTV_USERNAME: config.DSTV_USERNAME as string,
  DSTV_PASSWORD: config.DSTV_PASSWORD as string,
  DSTV_CLIENT_ID: config.DSTV_CLIENT_ID as string,
  DSTV_IPADDRESS: config.DSTV_IPADDRESS as string,
  DSTV_LANGUAGE: config.DSTV_LANGUAGE as string,
  DSTV_VENDOR_CODE: config.DSTV_VENDOR_CODE as string,
  PAPERLESS_DASHEN_SMS: config.PAPERLESS_DASHEN_SMS as string,
  PAPERLESS_SMS_USERNAME: config.PAPERLESS_SMS_USERNAME as string,
  PAPERLESS_SMS_PASSWORD: config.PAPERLESS_SMS_PASSWORD as string,
  KAFKA_ADDRESS: config.KAFKA_ADDRESS as string,
  LDAP_URL: config.LDAP_URL as string
});

async function initConfig(): Promise<TopLevelConfig> {
  const config = await loadConfig();
  // const { error } = configSchema.validate(config, {
  //   abortEarly: false,
  //   allowUnknown: true,
  // });
  // if (error) {
  //   console.log(`config validation error message: ${error.message}`);
  //   throw new Error(`config validation error throw: ${error.details}`);
  // }
  const initConf = await getConfig(config);
  return initConf;
}

export default initConfig;
