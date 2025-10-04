import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'abandoned', 'completed'], default: 'active' }
});

CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model('Cart', CartSchema);

export default Cart;
