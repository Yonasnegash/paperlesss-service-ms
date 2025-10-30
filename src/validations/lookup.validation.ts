import Joi from "joi";

const account_number = Joi.number().min(1).required();

export const other_bank_lookupschema = Joi.object({
  account_number: account_number,
  bank_code: Joi.number().positive().required(),
});
