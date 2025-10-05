import { Router } from 'express';
import Product from '../modules/Product.js';
import Pair from '../modules/Pair.js';

const PairRoutes = new Router();

PairRoutes.get('/:productId', async (req, res) => {
  const pid = req.params.productId;
  const p = await Pair.findOne({ productId: pid }).lean();
  if (!p) return res.json({ ok: true, items: [] });
  const relatedSorted = (p.related || []).sort((a, b) => b.count - a.count).slice(0, 6);
  const ids = relatedSorted.map(r => r.otherId);
  const products = await Product.find({ _id: { $in: ids } }).lean();
  res.json({ ok: true, items: products });
});

export default PairRoutes;