import Joi from "joi";

const addressSchema = Joi.object({
  name: Joi.string().optional(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zip: Joi.string().required(),
  phone: Joi.string().optional(),
});

export default addressSchema;