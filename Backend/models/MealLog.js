import mongoose from "mongoose";

const mealLogSchema = new mongoose.Schema(
  {
    // Konse user ka meal hai — User model se link
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",       // User model se reference
      required: true
    },

    name:     { type: String, required: true },  // "roti"
    quantity: { type: Number, required: true },  // 2
    unit:     { type: String, required: true },  // "piece"
    icon:     { type: String, default: "🍽️" },

    // Per unit sugar aur total
    sugarPer:   { type: Number, required: true },  // 2.5g
    totalSugar: { type: Number, required: true },  // 5g (2.5 × 2)

    mealTime: {
      type: String,
      enum: ["breakfast", "lunch", "snack", "dinner"],
      required: true
    },

    // Kis din ka meal hai
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const MealLog = mongoose.model("MealLog", mealLogSchema);
export default MealLog;