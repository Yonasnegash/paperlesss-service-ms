import Joi from "joi";

export const query_validation = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  searchKey: Joi.string().allow("").optional(),
});
