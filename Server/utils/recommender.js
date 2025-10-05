import axios from 'axios';
import Product from '../modules/Product.js';
import Event from '../modules/Event.js';

const AI_SERVICE_BASE = 'http://localhost:5000'; // Flask service URL

/**
 * Get AI content-based recommendations for a product
 * @param {string} productId
 * @returns {Promise<Array>} Recommended products
 */
export async function getAIRecommendations(productId) {
  try {
    const { data } = await axios.get(`${AI_SERVICE_BASE}/recommend/${productId}`);
    const aiRecs = data.recommendations || [];

    if (aiRecs.length === 0) return [];

    // Extract the product IDs from Flask response
    const ids = aiRecs.map((r) => r.id);

    // Fetch actual product documents from MongoDB
    const products = await Product.find({ _id: { $in: ids } }).lean();

    // Optional: Attach AI similarity scores to each product for debugging
    return products.map((p) => {
      const rec = aiRecs.find((r) => r.id === String(p._id));
      return { ...p, aiScore: rec?.score || 0 };
    });
  } catch (err) {
    console.error('AI Recommender error:', err.message);
    return [];
  }
}

/**
 * Get personalized product recommendations for a user
 * (based on tags, categories & popularity)
 */

export async function getRecommendations({ userId, limit = 10, redisClient }) {
  // Get recent events from Redis
  let recent = [];
  try {
    const data = await redisClient.lRange(`recent:${userId}`, 0, -1);
    recent = data.map((x) => JSON.parse(x));
  } catch (err) {
    console.log('Redis read error', err);
  }

  // Fallback to Mongo if Redis is empty
  if (recent.length === 0) {
    recent = await Event.find({ userId }).sort({ timestamp: -1 }).limit(30);
  }

  // Extract viewed product IDs
  const viewedIds = recent
    .filter((r) => r.productId)
    .map((r) => r.productId);

  if (viewedIds.length === 0) {
    // No history → recommend popular products
    return Product.find({})
      .sort({ popularity: -1 })
      .limit(limit)
      .lean();
  }

  // Load products to get tags/categories
  const viewedProducts = await Product.find({ _id: { $in: viewedIds } });

  // Build tag/category profile
  const tagCounts = {};
  const categoryCounts = {};

  viewedProducts.forEach((p) => {
    p.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const tagSet = Object.keys(tagCounts);
  const catSet = Object.keys(categoryCounts);

  // Find candidate products
  let candidates = await Product.find({
    _id: { $nin: viewedIds },
    $or: [
      { tags: { $in: tagSet } },
      { category: { $in: catSet } },
    ],
  });

  // Fallback to popular products if not enough
  if (candidates.length < limit) {
    const extra = await Product.find({
      _id: { $nin: [...viewedIds, ...candidates.map((p) => p._id)] },
    })
      .sort({ popularity: -1 })
      .limit(limit - candidates.length);

    candidates = candidates.concat(extra);
  }

  // Scoring
  const scored = candidates.map((p) => {
    let score = 0;
    p.tags.forEach((tag) => {
      if (tagCounts[tag]) score += tagCounts[tag];
    });
    if (catSet.includes(p.category)) score += 3;
    score += Math.log((p.popularity || 0) + 1);
    return { ...p.toObject(), score };
  });

  // Sort & return top
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
