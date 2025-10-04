import { Router } from "express";
import validate from "../middleware/validate.js";
import Product from "../modules/Product.js";
import Category from "../modules/Category.js";
import { productValidationSchema } from "../validations/productValidation.js";

const productRouter = Router();

// Get All products
productRouter.get("/", async (req, res) => {
  try {
    const result = await Product.find().populate("category", "name");
    if (!result || result.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }
    res.json({ message: "Products fetched successfully", data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product with category auto-handling
productRouter.post("/add", validate(productValidationSchema), async (req, res) => {
  try {
    const { title, price, images, category } = req.body;

    // Capitalize category name
    const formattedCategory = category.toUpperCase();

    let foundCategory = await Category.findOne({ name: formattedCategory });

    if (!foundCategory) {
      foundCategory = new Category({ name: formattedCategory });
      await foundCategory.save();
    }

    const product = new Product({
      title,
      price,
      images,
      category: foundCategory._id,
    });

    await product.save();

    res.json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Product by ID
productRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product fetched successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product by ID
productRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, images, category } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (price) updateData.price = price;
    if (images) updateData.images = images;

    if (category) {
      const formattedCategory = category.toUpperCase();
      let foundCategory = await Category.findOne({ name: formattedCategory });

      if (!foundCategory) {
        foundCategory = new Category({ name: formattedCategory });
        await foundCategory.save();
      }

      updateData.category = foundCategory._id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // return updated doc
    ).populate("category", "name");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Product by ID
productRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default productRouter;
