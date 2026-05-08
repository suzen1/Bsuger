import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes      from "./routes/auth.js";
import mealRoutes      from "./routes/meals.js";
import reportRoutes    from "./routes/reports.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/api/auth",      authRoutes);
app.use("/api/meals",     mealRoutes);
app.use("/api/reports",   reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "BSUGAR Server chal raha hai! 🩸" });
});

// MongoDB connect karo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected!");
    app.listen(PORT, () => {
      console.log(`🚀 Server: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
  });