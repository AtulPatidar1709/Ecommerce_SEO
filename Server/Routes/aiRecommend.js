import { Router } from 'express';
import { getAIRecommendations } from '../utils/recommender.js';

const aiRouter = Router();

aiRouter.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const items = await getAIRecommendations(productId);
    res.json({ ok: true, items });
  } catch (err) {
    console.error('AI Recommend error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default aiRouter;
