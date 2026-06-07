import express from "express";
import MealLog from "../models/MealLog.js";
import protect from "../middleware/auth.js";
import { askAI } from "../services/ai.js";

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

    // Validation (allow sugarPer and totalSugar to be 0)
    if (!name || quantity === undefined || sugarPer === undefined || !mealTime) {
      return res.status(400).json({ message: "Sab fields zaroori hain" });
    }

    // Naya meal banao
    // req.user.id — middleware ne attach kiya tha
    const meal = await MealLog.create({
      userId:     req.user.id,
      name,
      quantity:   Number(quantity),
      unit,
      icon:       icon || "🍽️",
      sugarPer:   Number(sugarPer),
      totalSugar: Number(sugarPer) * Number(quantity),
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
    // Aaj ki date ki start aur end banao (UTC-safe)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);      // 00:00:00

    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);   // 23:59:59

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

router.post("/sugar-search", async (req, res) => {
  try {
    const { foodName } = req.body;

    const prompt = `You are a nutrition expert. Analyze "${foodName}" and return ONLY a JSON object with no explanation, no markdown, no backticks.

Example for "roti": {"sugarPer": 3, "unit": "piece", "icon": "🫓", "note": "Roti mein complex carbs hain, limit mein khao"}
Example for "chai": {"sugarPer": 8, "unit": "cup", "icon": "☕", "note": "Chai mein sugar kam karo"}
Example for "rice": {"sugarPer": 10, "unit": "cup", "icon": "🍚", "note": "Chawal ka glycemic index high hai"}
Example for "water": {"sugarPer": 0, "unit": "glass", "icon": "🥛", "note": "Paani mein sugar nahi hoti, yeh health ke liye best hai"}

Important rules:
- sugarPer must be a REAL number (can be 0 if the food has no sugar) based on actual nutrition data
- unit should be the common serving size
- icon must be a relevant food emoji
- note should be a health tip in Hinglish

Now for "${foodName}", return ONLY the JSON:`;

    const raw = await askAI(prompt);

    // JSON extract safely
    const start = raw.indexOf("{");
    const end   = raw.lastIndexOf("}");

    if (start === -1 || end === -1) {
      return res.status(500).json({ error: "AI ne galat format diya" });
    }

    const data = JSON.parse(raw.substring(start, end + 1));

    // Force number
    data.sugarPer = Number(data.sugarPer);

    // Reject undefined/null/NaN, but permit 0 sugar
    if (data.sugarPer === undefined || data.sugarPer === null || isNaN(data.sugarPer)) {
      return res.status(500).json({ error: "Sugar value nahi mili — dobara try karo" });
    }

    // Icon nahi aaya toh default do
    if (!data.icon || data.icon.trim() === "") data.icon = "🍽️";

    res.json(data);

  } catch (err) {
    console.error("Sugar search error:", err.message);
    res.status(500).json({ error: "AI se connect nahi hua" });
  }
});

export default router;