import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meals.js";
import reportRoutes from "./routes/reports.js";
import dashboardRoutes from "./routes/dashboard.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
const frontendUrl = process.env.FRONTEND_URL;
app.use(cors({
  origin: frontendUrl ? [frontendUrl, "http://localhost:5173"] : "http://localhost:5173",
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "BSUGAR Server chal raha hai! 🩸" });
});

// MongoDB connect karo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected!");
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Local Server running on http://localhost:${PORT}`);
  });
}

export default app;