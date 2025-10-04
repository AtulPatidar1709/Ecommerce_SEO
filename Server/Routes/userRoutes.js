// routes/userRouter.js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modules/User_Schema.js";
import { registerUserSchema, loginUserSchema } from "../validations/userValidation.js";
import validate from "../middleware/validate.js";

const userRouter = Router();

// Register route
userRouter.post("/register", validate(registerUserSchema), async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // Optional: exclude password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Login route
userRouter.post("/login", validate(loginUserSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // 4. Send token in response ✅
    res.json({
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default userRouter;
