import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────
function calculateLimit(data) {
  if (data.fastingSugar >= 126 || data.postMealSugar >= 200) return 25;
  if (data.fastingSugar >= 100 || data.postMealSugar >= 140) return 35;
  return 50;
}

function getStatus(data) {
  if (data.fastingSugar >= 126 || data.postMealSugar >= 200) return "diabetic";
  if (data.fastingSugar >= 100 || data.postMealSugar >= 140) return "pre-diabetic";
  return "normal";
}

const steps = ["Personal Info", "Sugar Report", "Summary"]

const Onboarding = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    fastingSugar: "",
    postMealSugar: "",
    hba1c: "",
    reportMonth: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    // Step 1 validation
    if (currentStep === 0) {
      if (!formData.name || !formData.age || !formData.gender || !formData.weight || !formData.height) {
        setError("Sab fields zaroori hain");
        return;
      }
    }
    // Step 2 validation
    if (currentStep === 1) {
      if (!formData.fastingSugar || !formData.postMealSugar) {
        setError("Fasting aur Post-Meal sugar zaroori hai");
        return;
      }
    }
    setError("");
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        navigate("/");
        return;
      }

      const res = await fetch("/api/auth/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId:          user.id,
          age:             Number(formData.age),
          gender:          formData.gender,
          weight:          Number(formData.weight),
          height:          Number(formData.height),
          lastFasting:     Number(formData.fastingSugar),
          lastPostMeal:    Number(formData.postMealSugar),
          dailySugarLimit: calculateLimit(formData),
          sugarStatus:     getStatus(formData),
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Kuch galat hua");
        return;
      }

      // ✅ FIXED — sahi route
      navigate("/dashbord");

    } catch (err) {
      console.error(err);
      setError("Server se connect nahi ho pa raha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* App Name */}
        <h1 className="text-3xl font-bold text-emerald-600 text-center mb-1">
          🩸 BSUGAR
        </h1>
        <p className="text-center text-gray-400 text-sm mb-6">
          Smart Sugar Tracker
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${index < currentStep ? "bg-emerald-500 text-white" : ""}
                ${index === currentStep ? "bg-emerald-600 text-white ring-4 ring-emerald-200" : ""}
                ${index > currentStep ? "bg-gray-100 text-gray-400" : ""}
              `}>
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span className={`ml-1 text-xs hidden sm:block
                ${index === currentStep ? "text-emerald-600 font-semibold" : "text-gray-400"}
              `}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-8 mx-2 rounded
                  ${index < currentStep ? "bg-emerald-400" : "bg-gray-200"}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-4 py-3 mb-4 font-medium">
            ❌ {error}
          </div>
        )}

        {/* STEP 1 — Personal Info */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              👤 Personal Information
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Tumhara naam"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="age"
                placeholder="Age (years)"
                value={formData.age}
                onChange={handleChange}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-500"
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="absolute right-3 top-3.5 text-xs text-gray-400">kg</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="height"
                  placeholder="Height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <span className="absolute right-3 top-3.5 text-xs text-gray-400">cm</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Sugar Report */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              🧪 Sugar Report
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Pichhle mahine ki report ke numbers daalo
            </p>

            {/* Fasting */}
            <div className="bg-blue-50 rounded-xl p-4">
              <label className="text-sm font-semibold text-blue-700 block mb-1">
                🌙 Fasting Sugar
              </label>
              <p className="text-xs text-blue-400 mb-2">
                Subah khali pet — test se pehle kuch nahi khaya
              </p>
              <div className="relative">
                <input
                  type="number"
                  name="fastingSugar"
                  placeholder="e.g. 95"
                  value={formData.fastingSugar}
                  onChange={handleChange}
                  className="w-full border border-blue-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">mg/dL</span>
              </div>
              {formData.fastingSugar && (
                <p className={`text-xs mt-1 font-medium
                  ${formData.fastingSugar < 100 ? "text-green-600" : ""}
                  ${formData.fastingSugar >= 100 && formData.fastingSugar < 126 ? "text-yellow-600" : ""}
                  ${formData.fastingSugar >= 126 ? "text-red-600" : ""}
                `}>
                  {formData.fastingSugar < 100 && "✅ Normal range"}
                  {formData.fastingSugar >= 100 && formData.fastingSugar < 126 && "⚠️ Pre-diabetic range"}
                  {formData.fastingSugar >= 126 && "🔴 Diabetic range"}
                </p>
              )}
            </div>

            {/* Post Meal */}
            <div className="bg-orange-50 rounded-xl p-4">
              <label className="text-sm font-semibold text-orange-700 block mb-1">
                🍽️ Post-Meal Sugar (PP)
              </label>
              <p className="text-xs text-orange-400 mb-2">
                Khane ke 2 ghante baad ka reading
              </p>
              <div className="relative">
                <input
                  type="number"
                  name="postMealSugar"
                  placeholder="e.g. 130"
                  value={formData.postMealSugar}
                  onChange={handleChange}
                  className="w-full border border-orange-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">mg/dL</span>
              </div>
              {formData.postMealSugar && (
                <p className={`text-xs mt-1 font-medium
                  ${formData.postMealSugar < 140 ? "text-green-600" : ""}
                  ${formData.postMealSugar >= 140 && formData.postMealSugar < 200 ? "text-yellow-600" : ""}
                  ${formData.postMealSugar >= 200 ? "text-red-600" : ""}
                `}>
                  {formData.postMealSugar < 140 && "✅ Normal range"}
                  {formData.postMealSugar >= 140 && formData.postMealSugar < 200 && "⚠️ Pre-diabetic range"}
                  {formData.postMealSugar >= 200 && "🔴 Diabetic range"}
                </p>
              )}
            </div>

            {/* HbA1c - Optional */}
            <div className="bg-purple-50 rounded-xl p-4">
              <label className="text-sm font-semibold text-purple-700 block mb-1">
                📊 HbA1c % <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <p className="text-xs text-purple-400 mb-2">
                3 mahine ka average — report mein hota hai
              </p>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="hba1c"
                  placeholder="e.g. 6.5"
                  value={formData.hba1c}
                  onChange={handleChange}
                  className="w-full border border-purple-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <span className="absolute right-3 top-2.5 text-xs text-gray-400">%</span>
              </div>
            </div>

            <input
              type="month"
              name="reportMonth"
              value={formData.reportMonth}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        )}

        {/* STEP 3 — Summary */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              ✅ Summary — Sab theek hai?
            </h2>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Personal Info</p>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <span className="text-gray-500">Naam:</span>
                  <span className="font-medium">{formData.name || "—"}</span>
                  <span className="text-gray-500">Age:</span>
                  <span className="font-medium">{formData.age || "—"} yrs</span>
                  <span className="text-gray-500">Gender:</span>
                  <span className="font-medium capitalize">{formData.gender || "—"}</span>
                  <span className="text-gray-500">Weight:</span>
                  <span className="font-medium">{formData.weight || "—"} kg</span>
                  <span className="text-gray-500">Height:</span>
                  <span className="font-medium">{formData.height || "—"} cm</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Sugar Report</p>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <span className="text-gray-500">Fasting:</span>
                  <span className="font-medium">{formData.fastingSugar || "—"} mg/dL</span>
                  <span className="text-gray-500">Post-Meal:</span>
                  <span className="font-medium">{formData.postMealSugar || "—"} mg/dL</span>
                  <span className="text-gray-500">HbA1c:</span>
                  <span className="font-medium">{formData.hba1c || "—"} %</span>
                </div>
              </div>

              {/* Calculated values preview */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">AI Calculated</p>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <span className="text-gray-500">Daily Limit:</span>
                  <span className="font-bold text-emerald-600">{calculateLimit(formData)}g sugar</span>
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-bold capitalize
                    ${getStatus(formData) === "normal" ? "text-green-600" : ""}
                    ${getStatus(formData) === "pre-diabetic" ? "text-yellow-600" : ""}
                    ${getStatus(formData) === "diabetic" ? "text-red-600" : ""}
                  `}>
                    {getStatus(formData)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex-1 border border-gray-200 text-gray-500 py-3 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              ← Back
            </button>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            >
              {loading ? "⏳ Saving..." : "🚀 Start Tracking"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default Onboarding