import joi from 'joi';

const envVarSchema = joi
  .object({
      VAULT_ADDR: joi.string().uri().required(),
      VAULT_TOKEN: joi.string().required(),
      VAULT_PATH_STAGING: joi.string().required(),
      NODE_ENV: joi.string().valid('dev', 'production').default('dev'),
      ENABLE_DEBUG_LOGS: joi.boolean().default(false),
  })
  .unknown();

  export const envValidation = {
    validate: (env: NodeJS.ProcessEnv) => envVarSchema.validate(env)
  };
