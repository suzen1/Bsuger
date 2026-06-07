import express from "express";
import protect from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// ─────────────────────────────────────────
// GET /api/profile — User profile data fetch karo
// ─────────────────────────────────────────
router.get("/", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            age: user.age || "Not set",
            phone: user.phone || "Not set",
            bloodType: user.bloodType || "Not set",
            gender: user.gender || "Not set",
            weight: user.weight || "Not set",
            height: user.height || "Not set",
            targetFasting: user.targetFasting || 100,
            targetPostMeal: user.targetPostMeal || 140,
            medications: user.medications || "None",
            doctorName: user.doctorName || "Not set",
            doctorPhone: user.doctorPhone || "Not set",
            dailySugarLimit: user.dailySugarLimit || 50,
            sugarStatus: user.sugarStatus || "normal"
        });
    } catch (err) {
        console.error("Profile fetch error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// ─────────────────────────────────────────
// PUT /api/profile — User profile update karo
// ─────────────────────────────────────────
router.put("/", protect, async (req, res) => {
    try {
        const {
            name,
            age,
            phone,
            bloodType,
            gender,
            weight,
            height,
            targetFasting,
            targetPostMeal,
            medications,
            doctorName,
            doctorPhone
        } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                age,
                phone,
                bloodType,
                gender,
                weight,
                height,
                targetFasting,
                targetPostMeal,
                medications,
                doctorName,
                doctorPhone
            },
            { new: true }
        ).select("-password");

        res.json({
            message: "Profile updated successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                phone: user.phone,
                bloodType: user.bloodType,
                gender: user.gender,
                weight: user.weight,
                height: user.height,
                targetFasting: user.targetFasting,
                targetPostMeal: user.targetPostMeal,
                medications: user.medications,
                doctorName: user.doctorName,
                doctorPhone: user.doctorPhone
            }
        });
    } catch (err) {
        console.error("Profile update error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
