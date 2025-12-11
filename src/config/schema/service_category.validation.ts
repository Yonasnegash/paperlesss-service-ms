import Joi from "joi";

export const service_category_schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  number: Joi.number().positive().required(),
});
