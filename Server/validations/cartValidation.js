// validations/cartValidation.js
import Joi from "joi";

export const addCartSchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.base": "User ID must be a string",
    "any.required": "User ID is required",
  }),
  userEmail: Joi.string().email().optional().messages({
    "string.email": "Email must be valid",
  }),
  userPhone: Joi.string().optional(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().messages({
          "any.required": "Product ID is required",
        }),
        quantity: Joi.number().integer().min(1).default(1).messages({
          "number.base": "Quantity must be a number",
          "number.min": "Quantity must be at least 1",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Items must be an array",
      "array.min": "At least one item is required",
      "any.required": "Items field is required",
    }),
});

export const checkoutSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
  }),
  paymentInfo: Joi.object().required().messages({
    "any.required": "Payment info is required",
  }),
  couponCode: Joi.string().optional(),
});