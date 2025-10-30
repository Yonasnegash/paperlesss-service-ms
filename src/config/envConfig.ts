import dotenv from 'dotenv';
import { envValidation } from '../validations/env.validation';

dotenv.config();

const { value: envVars } = envValidation.validate(process.env);
export interface Config {
  vault: {
    vault_addr: string;
    vault_token: string;
    vault_path_staging: string;
  };
  env: string;
  enableDebugLogs: boolean;
  jwt: {
    secret: string
    accessExpirationMinutes: number
  }
}

export const config: Config = {
  vault: {
    vault_addr: envVars.VAULT_ADDR,
    vault_token: envVars.VAULT_TOKEN,
    vault_path_staging: envVars.VAULT_PATH_STAGING,
  },
  env: envVars.NODE_ENV,
  enableDebugLogs: envVars.ENABLE_DEBUG_LOGS,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES
  }
};