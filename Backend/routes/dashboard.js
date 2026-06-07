import express from "express";
import MealLog from "../models/MealLog.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import { askAI } from "../services/ai.js";

const router = express.Router();
router.use(protect);

// GET /api/dashboard
router.get("/", protect, async (req, res) => {
  try {
    const user          = await User.findById(req.user.id).select("-password");
    
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);
    
    const meals         = await MealLog.find({ userId: req.user.id, date: { $gte: todayStart, $lte: todayEnd }}).sort({ date: 1 });
    const totalConsumed = meals.reduce((sum, m) => sum + m.totalSugar, 0);

    // Gemini se tip lo
    let aiTip = "Healthy diet rakho aur daily limit ka dhyan rakho.";
    try {
      const prompt = `
Ek ${user.sugarStatus} diabetic patient ke liye:
- Fasting sugar: ${user.lastFasting} mg/dL
- Post-meal sugar: ${user.lastPostMeal} mg/dL  
- Aaj consumed: ${totalConsumed}g sugar
- Daily limit: ${user.dailySugarLimit}g

Sirf ek practical diet tip do — 1-2 lines mein Hinglish mein. 
Koi JSON nahi, sirf plain text tip.
      `;
      aiTip = await askAI(prompt);
      aiTip = aiTip.trim();
    } catch (e) {
      console.error("AI tip error:", e.message);
    }

    res.json({
      user: {
        name:            user.name,
        age:             user.age,
        gender:          user.gender,
        weight:          user.weight,
        height:          user.height,
        dailySugarLimit: user.dailySugarLimit,
        sugarStatus:     user.sugarStatus,
        lastFasting:     user.lastFasting,
        lastPostMeal:    user.lastPostMeal,
      },
      consumed:  totalConsumed,
      meals,
      aiTip,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;