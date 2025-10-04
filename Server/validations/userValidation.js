// validations/userValidation.js
import Joi from "joi";

const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/) // 10-digit phone
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required",
    }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),

  points: Joi.number().integer().min(0).default(0), // default handled by mongoose

  rewards: Joi.array().items(Joi.string()).default([]), // array of strings
});

const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export { registerUserSchema, loginUserSchema };
