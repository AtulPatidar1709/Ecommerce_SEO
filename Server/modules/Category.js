import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: { type: String },
});

// Pre-save hook to capitalize name
CategorySchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.toUpperCase();
  }
  next();
});

const Category = mongoose.model("Category", CategorySchema);

export default Category;