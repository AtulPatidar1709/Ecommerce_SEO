import express from "express";
import Cart from "../modules/Cart.js";
import Product from "../modules/Product.js";
import Order from "../modules/Order.js"; // new
import updatePairsForOrder from "../services/pairsService.js";
import { awardPoints } from "../services/loyaltyService.js";
import validateAndUseCoupon from "../services/couponService.js";
import { addCartSchema } from "../validations/cartValidation.js";
import validate from "../middleware/validate.js";

const cartRoutes = express.Router();

// GET Cart by userId
cartRoutes.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate("items.productId")
      .lean();
    res.json({ ok: true, cart });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Create or Update Cart
cartRoutes.post("/", validate(addCartSchema), async (req, res) => {
  try {
    const { userId, userEmail, userPhone, items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { userId, userEmail, userPhone, items, updatedAt: new Date(), status: "active" },
      { upsert: true, new: true }
    );
    res.json({ ok: true, cart });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Checkout - create order
cartRoutes.post("/checkout", validate(addCartSchema), async (req, res) => {
  try {
    const { userId, paymentInfo, couponCode, addressId } = req.body;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return res.status(400).json({ ok: false, error: "Cart empty" });
    }

    // compute total
    let total = 0;
    const orderItems = cart.items.map(it => {
      total += it.productId.price * (it.quantity || 1);
      return { productId: it.productId._id, quantity: it.quantity, price: it.productId.price };
    });

    // apply coupon if provided
    if (couponCode) {
      await validateAndUseCoupon(couponCode, userId); 
    }

    // create new Order
    const order = await Order.create({
      userId,
      items: orderItems,
      total,
      status: "paid",
      address: addressId,
      paymentInfo,
    });

    // update product popularity & stock
    for (const it of cart.items) {
      await Product.findByIdAndUpdate(it.productId._id, {
        $inc: { popularity: 1, stock: -(it.quantity || 1) },
      });
    }

    // update product pairs
    await updatePairsForOrder(orderItems.map(i => String(i.productId)));

    // award loyalty points
    await awardPoints(userId, total);

    // clear cart
    cart.items = [];
    cart.status = "completed";
    await cart.save();

    res.json({ ok: true, message: "Checkout complete", orderId: order._id, total });
  } catch (err) {
    console.error("checkout err", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Get all orders for a user
cartRoutes.get("/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.productId")
      .populate("address")
      .sort({ createdAt: -1 });

    res.json({ ok: true, orders });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default cartRoutes;