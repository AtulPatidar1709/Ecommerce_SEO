import express from 'express';
import Event from '../modules/Event.js';
import Product from '../modules/Product.js';
import redisClient from '../config/connect.js';
import { eventValidationSchema } from '../validations/eventValidation.js';
import validate from '../middleware/validate.js';

const eventRoutes = express.Router();

eventRoutes.post('/', validate(eventValidationSchema), async (req, res) => {
  try {
    const { userId, productId, eventType } = req.body;

    const event = await Event.create({ userId, productId, eventType });

    if (productId && eventType === 'view') {
      await Product.findByIdAndUpdate(productId, { $inc: { popularity: 1 } });
    }

    if (redisClient) {
      await redisClient.lPush(`recent:${userId}`, JSON.stringify(event));
      await redisClient.lTrim(`recent:${userId}`, 0, 19);
    }

    res.json({ ok: true, event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default eventRoutes;