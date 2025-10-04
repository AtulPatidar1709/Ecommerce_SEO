import Pair from "../modules/Pair.js";

async function updatePairsForOrder(productIds = []) {
  const uniq = [...new Set(productIds.map(id => String(id)))];

  for (let i = 0; i < uniq.length; i++) {
    for (let j = 0; j < uniq.length; j++) {
      if (i === j) continue;

      const pid = uniq[i];
      const other = uniq[j];

      const res = await Pair.updateOne(
        { productId: pid, 'related.otherId': other },
        { $inc: { 'related.$.count': 1 } }
      );

      if (res.matchedCount === 0) {
        await Pair.updateOne(
          { productId: pid },
          { $push: { related: { otherId: other, count: 1 } } },
          { upsert: true }
        );
      }
    }
  }
}

export default updatePairsForOrder;
