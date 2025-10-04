import Coupon from '../modules/Coupon.js';
import crypto from 'crypto'; 

async function createOneTimeCoupon({ percent = 10, hoursValid = 24 }) {
  const code = 'SAVE' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const expiresAt = new Date(Date.now() + hoursValid * 3600 * 1000);
  const c = await Coupon.create({ code, discountPercent: percent, expiresAt, maxUses: 1 });
  return c;
}

export default createOneTimeCoupon;