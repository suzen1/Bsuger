import mongoose from "mongoose";

const sugarReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    month: { type: String, required: true },  // "2025-04"

    // Dono readings zaroori hain
    fastingSugar:  { type: Number, required: true },
    postMealSugar: { type: Number, required: true },
    hba1c:         { type: Number },   // optional

    // AI ne jo analysis di
    aiVerdict:      { type: String },  // "Better" / "Worse" / "Same"
    aiFastingNote:  { type: String },  // "Fasting 20 points kam hua"
    aiPostMealNote: { type: String },
    aiAdvice:       { type: String },  // "Roti kam karo"
  },
  {
    timestamps: true
  }
);

const SugarReport = mongoose.model("SugarReport", sugarReportSchema);
export default SugarReport;