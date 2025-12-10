import Joi from "joi"

export const video_create_schema = Joi.object({
    title: Joi.string().required().messages({
        "any.requried": "Video tilte is required"
    }),
    subText: Joi.string().optional(),
    type: Joi.string().required().messages({
        "any.required": "Video type is requried"
    })
})