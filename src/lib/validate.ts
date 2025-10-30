import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError.ts';
import { logger } from '../config/logger.ts';

interface Schema {
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
}

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate params if schema.params exists
      if (schema.params) {
        const { error: paramsError } = schema.params.validate(req.params, {
          abortEarly: false,
          allowUnknown: false,   // Disallow unknown keys here
        });
        if (paramsError) {
          throw new ApiError(400, paramsError.details.map(d => d.message).join(', '));
        }
      }

      // Validate query if schema.query exists
      if (schema.query) {
        const { error: queryError } = schema.query.validate(req.query, {
          abortEarly: false,
          allowUnknown: false,
        });
        if (queryError) {
          throw new ApiError(400, queryError.details.map(d => d.message).join(', '));
        }
      }

      // Validate body if schema.body exists
      if (schema.body) {
        const { error: bodyError } = schema.body.validate(req.body, {
          abortEarly: false,
          allowUnknown: false,
        });
        if (bodyError) {
          throw new ApiError(400, bodyError.details.map(d => d.message).join(', '));
        }
      }

      next();
    } catch (error) {
      logger.error('Validation failed:', error);
      next(error);
    }
  };
};
