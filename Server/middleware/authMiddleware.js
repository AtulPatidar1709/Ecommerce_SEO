// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../modules/User_Schema.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("token")) {
      return res.status(401).json({ ok: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).lean();
    if (!user) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
};

// Restrict access to Admin only
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ ok: false, error: "Access denied: Admin only" });
};
