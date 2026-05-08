import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ─────────────────────────────────────────
// JWT TOKEN BANAO — helper function
// User ka ID andar hoga token mein
// ─────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // token mein kya store karna hai
    process.env.JWT_SECRET,   // secret key .env se
    { expiresIn: "7d" }      // 7 din baad expire hoga
  );
};

// ─────────────────────────────────────────
// REGISTER — POST /api/auth/register
// ─────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Step 1 — fields check karo
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Sab fields zaroori hain" });
    }

    // Step 2 — email pehle se toh nahi hai?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Yeh email pehle se registered hai" });
    }

    // Step 3 — naya user banao
    // Password yahan plain text hai — User model mein
    // pre("save") hook automatically hash kar dega
    const user = await User.create({ name, email, password });

    // Step 4 — token banao aur bhejo
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account ban gaya!",
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
      }
    });

  } catch (err) {
    console.error("Register error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ─────────────────────────────────────────
// LOGIN — POST /api/auth/login
// ─────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1 — fields check
    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password dono chahiye" });
    }

    // Step 2 — user dhundo DB mein
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email ya password galat hai" });
    }

    // Step 3 — password check karo
    // matchPassword — User model mein banaya tha
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email ya password galat hai" });
    }

    // Step 4 — token banao aur bhejo
    const token = generateToken(user._id);

    res.json({
      message: "Login ho gaya!",
      token,
      user: {
        id:              user._id,
        name:            user.name,
        email:           user.email,
        dailySugarLimit: user.dailySugarLimit,
        sugarStatus:     user.sugarStatus,
      }
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// ONBOARDING UPDATE — PUT /api/auth/onboarding
// Weight, height, gender — onboarding ke baad save
// ─────────────────────────────────────────
router.put("/onboarding", async (req, res) => {
  try {
    const { userId, age, gender, weight, height, dailySugarLimit, sugarStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { age, gender, weight, height, dailySugarLimit, sugarStatus },
      { new: true }   // updated user return karo
    );

    res.json({
      message: "Profile update ho gaya!",
      user
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;