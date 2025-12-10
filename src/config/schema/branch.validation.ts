import Joi from "joi";

export const branch_schema = Joi.object({
  branchCode: Joi.string().trim().alphanum().min(2).max(20).required().messages({
    "string.empty": "Branch code is required",
    "string.alphanum": "Branch code must contain only letters and numbers"
  }),
  branchName: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "Branch name is requried",
    "string.min": "Branch name must be at least 3 characters long"
  }),
  district: Joi.string().trim().min(3).max(50).required().messages({
    "string.empty": "District is required",
    "string.min": "District must be atleast 3 characters long"
  })
});
