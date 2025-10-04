import Joi from "joi";

export const productValidationSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
  }),

  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required",
  }),

  images: Joi.array().items(Joi.string().uri()).min(1).required().messages({
    "array.min": "At least one image is required",
    "string.uri": "Each image must be a valid URL",
  }),
  
  category: Joi.string().required().messages({
    "string.empty": "Category is required",
  }),

  popularity: Joi.number().integer().min(0).default(0),
});