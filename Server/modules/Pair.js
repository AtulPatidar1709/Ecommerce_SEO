import mongoose from "mongoose";

const PairSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
  related: [
    {
      otherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      count: Number
    }
  ]
});

const Pair = mongoose.model("Pair", PairSchema);

export default Pair;