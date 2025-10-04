import express from 'express';
import { getRecommendations } from "../utils/recommender.js"
import redisClient from '../config/connect.js';

const RecommendationRouter = express.Router();

RecommendationRouter.get('/', async (req, res) => {
  try {
    const { userId, limit } = req.query;
    if (!userId) return res.status(400).json({ ok: false, error: 'userId required' });

    const recs = await getRecommendations({ userId, limit: Number(limit || 10), redisClient });
    res.json({ ok: true, recs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default RecommendationRouter;