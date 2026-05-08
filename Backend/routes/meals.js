import express from "express";
import MealLog from "../models/MealLog.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Sab routes protected hain — pehle login zaroori
// router.use(protect) — har route pe automatically middleware chalega
router.use(protect);

// ─────────────────────────────────────────
// MEAL ADD — POST /api/meals/add
// ─────────────────────────────────────────
router.post("/add", async (req, res) => {
  try {
    const { name, quantity, unit, icon, sugarPer, totalSugar, mealTime } = req.body;

    // Validation
    if (!name || !quantity || !sugarPer || !mealTime) {
      return res.status(400).json({ message: "Sab fields zaroori hain" });
    }

    // Naya meal banao
    // req.user.id — middleware ne attach kiya tha
    const meal = await MealLog.create({
      userId:     req.user.id,
      name,
      quantity,
      unit,
      icon,
      sugarPer,
      totalSugar,
      mealTime,
      date:       new Date()
    });

    res.status(201).json({
      message: "Meal add ho gaya!",
      meal
    });

  } catch (err) {
    console.error("Meal add error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// AAJ KE MEALS — GET /api/meals/today
// ─────────────────────────────────────────
router.get("/today", async (req, res) => {
  try {
    // Aaj ki date ki start aur end banao
    // Taaki sirf aaj ke meals aayein
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);      // 00:00:00

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);   // 23:59:59

    const meals = await MealLog.find({
      userId: req.user.id,
      date: {
        $gte: todayStart,   // greater than equal — aaj subah ke baad
        $lte: todayEnd      // less than equal — aaj raat se pehle
      }
    }).sort({ date: 1 }); // purane pehle

    // Total sugar calculate karo
    const totalSugar = meals.reduce((sum, m) => sum + m.totalSugar, 0);

    res.json({ meals, totalSugar });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────
// MEAL DELETE — DELETE /api/meals/:id
// ─────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const meal = await MealLog.findById(req.params.id);

    // Meal mila?
    if (!meal) {
      return res.status(404).json({ message: "Meal nahi mila" });
    }

    // Sirf apna meal delete kar sako
    if (meal.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Yeh tumhara meal nahi hai" });
    }

    await meal.deleteOne();
    res.json({ message: "Meal delete ho gaya!" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;