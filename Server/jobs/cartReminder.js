const cron = require('node-cron');
const Cart = require('../modules/Cart');
const nodemailer = require('nodemailer');
import {createOneTimeCoupon} from "../services/couponService.js"

// configure mail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

cron.schedule('*/30 * * * *', async () => {
  console.log('Checking for abandoned carts...');
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  const abandonedCarts = await Cart.find({
    status: 'active',
    updatedAt: { $lt: cutoff },
  }).populate('items.productId');

  for (const cart of abandonedCarts) {
    // 1️⃣ Send mail reminder
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'user@example.com', // you should map to user's email
      subject: 'Your cart is waiting!',
      text: `You left ${cart.items.length} item(s) in your cart. Hurry up before they’re gone!`,
    });

    // 2️⃣ Mark as abandoned (to avoid spamming)
    cart.status = 'abandoned';
    await cart.save();
  }
});
