import Joi from "joi";
import mongoose from "mongoose";

export const configuration_edit_schema = Joi.object({
  configurations: Joi.array()
    .items(
      Joi.object({
        _id: Joi.string()
          .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              return helpers.error("any.invalid")
            }
            return value
          })
          .required()
          .messages({
            "any.invalid": "_id must be a valid MongoDB ObjectId",
            "any.required": "_id is required"
          }),

          range: Joi.object({
            start: Joi.number()
              .min(0)
              .max(100)
              .required()
              .messages({
                "number.base": "range.start must be a number",
                "number.min": "range.start must be >= 0",
                "number.max": "range.start must be <= 100",
                "any.required": "range.start is required"
              }),
              end: Joi.alternatives()
                .try(
                  Joi.number().min(0).max(100),
                  Joi.valid(null)
                )
                .messages({
                  "number.base": "range.end must be a number or null",
                  "number.min": "range.end must be >= 0",
                  "number.max": "range.end must be <= 100"
                })
          })
          .required()
          .messages({
            "any.required": "range is required"
          })
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "configurations must be an array",
      "array.min": "At least one configuration is required"
    })
}).custom((value, helpers) => {
  for (const config of value.configurations) {
    const { start, end } = config.range
    if (end !== null && start > end) {
      return helpers.error("any.invalid", {
        message: `Invalid range: start (${start}) cannot be greater than end (${end})`
      })
    }
  }
  return value
});