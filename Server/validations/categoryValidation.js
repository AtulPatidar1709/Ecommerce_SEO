// validations/categoryValidation.js
import Joi from "joi";

export const categoryValidationSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters long",
      "string.max": "Name must not exceed 50 characters",
      "any.required": "Category name is required",
    }),
  description: Joi.string()
    .max(200)
    .allow("", null)
    .messages({
      "string.base": "Description must be a string",
      "string.max": "Description must not exceed 200 characters",
    }),
});
