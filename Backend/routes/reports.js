import express from "express";
import protect from "../middleware/auth.js";
import SugarReport from "../models/SugarReport.js";
import { askAI } from "../services/ai.js";

const router = express.Router();

// GET all reports for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const reports = await SugarReport.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("GET reports error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST to save a new report
router.post("/add", protect, async (req, res) => {
  try {
    const { month, fastingSugar, postMealSugar, hba1c, aiVerdict, aiFastingNote, aiPostMealNote, aiAdvice } = req.body;

    if (!month || fastingSugar === undefined || postMealSugar === undefined) {
      return res.status(400).json({ message: "Month, fasting, and post-meal sugar are required" });
    }

    const report = await SugarReport.create({
      userId: req.user.id,
      month,
      fastingSugar: Number(fastingSugar),
      postMealSugar: Number(postMealSugar),
      hba1c: hba1c ? Number(hba1c) : null,
      aiVerdict: aiVerdict || "Same",
      aiFastingNote: aiFastingNote || "",
      aiPostMealNote: aiPostMealNote || "",
      aiAdvice: aiAdvice || ""
    });

    res.status(201).json(report);
  } catch (err) {
    console.error("POST report add error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST to run AI comparison securely on the backend
router.post("/ai-compare", protect, async (req, res) => {
  try {
    const { current, previous } = req.body;
    if (!current || !previous) {
      return res.status(400).json({ message: "Current and previous reports are required" });
    }

    const currentFasting = current.fastingSugar !== undefined ? current.fastingSugar : current.fasting;
    const currentPostMeal = current.postMealSugar !== undefined ? current.postMealSugar : current.postMeal;
    const prevFasting = previous.fastingSugar !== undefined ? previous.fastingSugar : previous.fasting;
    const prevPostMeal = previous.postMealSugar !== undefined ? previous.postMealSugar : previous.postMeal;

    const prompt = `
    Analyze this diabetic patient's sugar reports comparison.
    
    Previous Month (${previous.month}):
    - Fasting: ${prevFasting} mg/dL
    - Post-Meal: ${prevPostMeal} mg/dL
    - HbA1c: ${previous.hba1c || "N/A"}%
    
    Current Month (${current.month}):
    - Fasting: ${currentFasting} mg/dL
    - Post-Meal: ${currentPostMeal} mg/dL
    - HbA1c: ${current.hba1c || "N/A"}%
    
    Return ONLY a JSON object with no explanation, no markdown backticks, and no extra text:
    {
      "verdict": "Better" or "Worse" or "Same",
      "fastingChange": "one line in Hinglish comparing fasting sugar",
      "postMealChange": "one line in Hinglish comparing post-meal sugar",
      "advice": "one practical health tip in Hinglish",
      "emoji": "one relevant emoji"
    }
    `;

    const raw = await askAI(prompt);
    
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return res.status(500).json({ error: "AI response parsing failed" });
    }
    
    const jsonStr = raw.substring(start, end + 1);
    const data = JSON.parse(jsonStr);
    res.json(data);
  } catch (err) {
    console.error("AI Comparison Error:", err.message);
    res.status(500).json({ error: "AI comparison failed" });
  }
});

export default router;
