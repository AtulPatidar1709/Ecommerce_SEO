import express from "express";
import Category from "../modules/Category.js";
import { categoryValidationSchema } from "../validations/categoryValidation.js";
import validate from "../middleware/validate.js";
const categoryRoutes = express.Router();

// Create a new category
categoryRoutes.post("/", validate(categoryValidationSchema), async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Category name must be unique" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
categoryRoutes.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID
categoryRoutes.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category by ID
categoryRoutes.put("/:id", validate(categoryValidationSchema), async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    if (name) category.name = name;
    if (description) category.description = description;

    await category.save();
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Category name must be unique" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete category by ID
categoryRoutes.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default categoryRoutes;