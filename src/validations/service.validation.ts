import Joi from "joi";

export const service_schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  serviceCategory: Joi.string().required(),
  expectedResponseTime: Joi.number().positive().required(),
  description: Joi.string().optional(),
  number: Joi.number().positive().optional(),
  url: Joi.string().optional()
});
