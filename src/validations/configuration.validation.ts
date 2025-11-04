import Joi from "joi";

export const configuration_schema = Joi.object({
  flagType: Joi.string().min(3).max(30).required(),
  startRange: Joi.number().positive().required(),
  endRange: Joi.number().positive().required(),
});
