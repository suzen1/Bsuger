import express from "express";
import MealLog from "../models/MealLog.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
    // Aaj ki date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // User ki info
 const user = await User.findById(req.user.id)
  .select("-password");

    // Aaj ke meals
    const meals = await MealLog.find({
      userId: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd }
    }).sort({ date: 1 });

    // Total sugar calculate karo
    const totalConsumed = meals.reduce((sum, m) => sum + m.totalSugar, 0);

 

res.json({
  user: {
    name:            user.name,
    age:             user.age,
    gender:          user.gender,
    weight:          user.weight,
    height:          user.height,
    dailySugarLimit: user.dailySugarLimit,
    sugarStatus:     user.sugarStatus,
    lastFasting:     user.lastFasting,   // ← yeh add karo
    lastPostMeal:    user.lastPostMeal,  // ← yeh add karo
  },
  consumed:  totalConsumed,
  meals,
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;