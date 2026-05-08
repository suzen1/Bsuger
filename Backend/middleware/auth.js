import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function protect(req, res, next) {
  try {
    // Request header se token nikalo
    // Frontend bhejta hai: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Login zaroori hai" });
    }

    // "Bearer abc123" → "abc123"
    const token = authHeader.split(" ")[1];

    // Token verify karo — agar tamper hua toh error aayega
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User DB se dhundo aur req mein attach karo
    // Password exclude karo — zaroorat nahi aage
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User nahi mila" });
    }

    next(); // sab theek — aage jao

  } catch (err) {
    res.status(401).json({ message: "Token invalid hai — dobara login karo" });
  }
}