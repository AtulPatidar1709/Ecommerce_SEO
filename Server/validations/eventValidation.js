import Joi from "joi";

export const eventValidationSchema = Joi.object({
  userId: Joi.string().required().messages({
    "any.required": "User ID is required",
    "string.base": "User ID must be a string",
  }),
  productId: Joi.string().optional().allow(null).messages({
    "string.base": "Product ID must be a string",
  }),
  eventType: Joi.string()
    .valid("view", "click", "add_to_cart", "purchase") // add more types if needed
    .required()
    .messages({
      "any.required": "Event type is required",
      "any.only": "Event type must be one of view, click, add_to_cart, purchase",
    }),
});
