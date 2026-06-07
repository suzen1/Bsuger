import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String },
    profilePicture: { type: String },
    name: {
      type: String,
      required: true,    // yeh field zaroori hai
      trim: true         // spaces hatao automatically
    },
    email: {
      type: String,
      required: true,
      unique: true,      // do users same email nahi rakh sakte
      lowercase: true    // hamesha lowercase save ho
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },

    // Personal info — onboarding se aayega
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    weight: { type: Number },   // kg mein
    height: { type: Number },   // cm mein
    phone: { type: String },
    bloodType: { type: String },

    // Health targets
    targetFasting: { type: Number, default: 100 },      // fasting blood sugar target mg/dL
    targetPostMeal: { type: Number, default: 140 },     // post-meal blood sugar target mg/dL

    // Medical info
    medications: { type: String },
    doctorName: { type: String },
    doctorPhone: { type: String },

    // AI ne calculate kiya daily sugar limit
    dailySugarLimit: { type: Number, default: 50 },

    // Onboarding values
    lastFasting: { type: Number },
    lastPostMeal: { type: Number },

    // User ka status — report se decide hoga
    sugarStatus: {
      type: String,
      enum: ["normal", "pre-diabetic", "diabetic"],
      default: "normal"
    }
  },
  {
    timestamps: true   // createdAt aur updatedAt auto add hoga
  }

);

// ── PASSWORD HASH ──
// Save se PEHLE password encrypt karo
// Plain text kabhi database mein mat rakho
userSchema.pre("save", async function () {
  // Sirf tab hash karo jab password change hua ho
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// ── PASSWORD CHECK ──
// Login mein use hoga — entered password vs stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;