import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  discountPercent: Number,
  expiresAt: Date,
  usedBy: [{ userId: String, usedAt: Date }],
  maxUses: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const Coupon = mongoose.model("Coupon", CouponSchema);

export default Coupon;