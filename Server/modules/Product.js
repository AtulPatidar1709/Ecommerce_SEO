import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  images: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // 👈 reference
  popularity: { type: Number, default: 0 },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
