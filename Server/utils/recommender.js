import Product from '../modules/Product.js';
import Event from '../modules/Event.js';

/**
 * Get personalized product recommendations for a user
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} [params.limit=10]
 * @param {object} params.redisClient
 * @returns {Promise<Array>} Recommended products
 */
export async function getRecommendations({ userId, limit = 10, redisClient }) {
  // 1️⃣ Get recent events from Redis
  let recent = [];
  try {
    const data = await redisClient.lRange(`recent:${userId}`, 0, -1);
    recent = data.map((x) => JSON.parse(x));
  } catch (err) {
    console.log('Redis read error', err);
  }

  // 2️⃣ Fallback to Mongo if Redis is empty
  if (recent.length === 0) {
    recent = await Event.find({ userId }).sort({ timestamp: -1 }).limit(30);
  }

  // 3️⃣ Extract viewed product IDs
  const viewedIds = recent
    .filter((r) => r.productId)
    .map((r) => r.productId);

  // 4️⃣ Load products to get tags/categories
  const viewedProducts = await Product.find({ _id: { $in: viewedIds } });

  // 5️⃣ Build tag/category profile
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

  // 6️⃣ Find candidate products
  let candidates = await Product.find({
    _id: { $nin: viewedIds },
    $or: [
      { tags: { $in: tagSet } },
      { category: { $in: catSet } },
    ],
  });

  // 7️⃣ Fallback to popular products if not enough
  if (candidates.length < limit) {
    const extra = await Product.find({
      _id: { $nin: [...viewedIds, ...candidates.map((p) => p._id)] },
    })
      .sort({ popularity: -1 })
      .limit(limit - candidates.length);

    candidates = candidates.concat(extra);
  }

  // 8️⃣ Scoring
  const scored = candidates.map((p) => {
    let score = 0;
    p.tags.forEach((tag) => {
      if (tagCounts[tag]) score += tagCounts[tag];
    });
    if (catSet.includes(p.category)) score += 3;
    score += Math.log((p.popularity || 0) + 1);
    return { ...p.toObject(), score };
  });

  // 9️⃣ Sort & return top
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
