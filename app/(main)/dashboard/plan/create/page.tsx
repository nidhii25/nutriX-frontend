"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Target,
  ChefHat,
  Loader2,
  Sparkles,
  Trophy,
  Dumbbell,
  UtensilsCrossed,
  Plane,
  Briefcase,
  Clock
} from "lucide-react";

import { api } from "../../../../services/api"; // OUR BACKEND API SERVICE

export default function CreatePlanPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "Lifestyle",
    goal: "Maintain Performance",
    duration: 7,
    kitchenAccess: "Full Kitchen",
    dayTags: {} as Record<number, string>,
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // 📌 MAIN ACTION — CALL BACKEND TO GENERATE THE PLAN
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("nutrix_user");
      if (!storedUser) throw new Error("User not logged in");

      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.user?.id || parsedUser.id;

      if (!userId) throw new Error("User ID missing");

      // 🔥 Send request to backend
      const body = {
        user_profile: { id: userId },
        formData: {
          ...formData,
        },
      };

      const response = await api.createPlan(body);

      if (!response?.id) throw new Error("Plan not generated");

      router.push("/dashboard/plan");

    } catch (err) {
      console.error(err);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8">
        <p className="text-[10px] tracking-[0.2em] uppercase text-nutrix-gray-medium">New plan</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-nutrix-green-deep">
          Create your nutrition plan
        </h1>
        <p className="mt-1 text-sm text-nutrix-gray-dark">
          Let AI design your fueling strategy based on your context.
        </p>
      </div>

      <div className="bg-white border border-nutrix-gray-light/50 p-8">

        {/* STEP 1: CONTEXT */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <h2 className="text-lg font-semibold tracking-tight text-nutrix-green-deep flex items-center gap-2">
              <Target className="w-5 h-5" /> What's the context?
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {["Lifestyle", "Tournament"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`p-4 border text-left text-sm transition-all ${
                    formData.type === type
                      ? "border-nutrix-green bg-nutrix-green/5 text-nutrix-green-deep"
                      : "border-nutrix-gray-light hover:border-nutrix-green/50"
                  }`}
                >
                  <div className="font-medium">{type}</div>
                  <div className="text-xs text-nutrix-gray-dark mt-1">
                    {type === "Lifestyle"
                      ? "Routine training & daily life"
                      : "Competition-specific preparation"}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-nutrix-gray-dark">Primary Goal</label>
              <input
                type="text"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full p-3 rounded-xl border border-nutrix-gray-light focus:border-nutrix-green outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DURATION */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <h2 className="text-xl font-bold text-nutrix-green-deep flex items-center gap-2">
              <Calendar className="w-5 h-5" /> How long is this plan?
            </h2>

            <label className="text-sm font-semibold text-nutrix-gray-dark">Duration (Days)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="14"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full accent-nutrix-green"
              />
              <span className="text-2xl font-bold text-nutrix-green-deep w-12 text-center">
                {formData.duration}
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: DAY TAGGING */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <h2 className="text-xl font-bold text-nutrix-green-deep flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Tag Your Schedule
            </h2>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: formData.duration }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-xl">
                  <div className="w-10 h-10 flex flex-col items-center justify-center bg-nutrix-gray-light rounded-lg text-nutrix-green-deep font-bold">
                    <span className="text-[8px] uppercase opacity-60">Day</span>
                    <span className="text-sm">{i + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-4 gap-2">
                    {(formData.type === "Lifestyle"
                      ? [
                          { id: "Balanced", label: "Balanced" },
                          { id: "Work", label: "Busy/Work" },
                          { id: "Treat", label: "Treat Day" },
                          { id: "Fasting", label: "Fasting" }
                        ]
                      : [
                          { id: "Normal", label: "Normal" },
                          { id: "Match", label: "Match" },
                          { id: "Training", label: "Training" },
                          { id: "Travel", label: "Travel" }
                        ]
                    ).map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            dayTags: { ...formData.dayTags, [i]: tag.id }
                          })
                        }
                        className={`text-[10px] font-bold py-2 rounded-lg border transition-all ${
                          formData.dayTags[i] === tag.id
                            ? "bg-nutrix-green text-white border-nutrix-green"
                            : "bg-white text-nutrix-gray-dark border-nutrix-gray-medium"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CONSTRAINTS */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in">
            <h2 className="text-lg font-semibold tracking-tight text-nutrix-green-deep flex items-center gap-2">
              <ChefHat className="w-5 h-5" /> Kitchen & Constraints
            </h2>

            <label className="text-sm font-semibold text-nutrix-gray-dark">Kitchen Access</label>
            <select
              value={formData.kitchenAccess}
              onChange={(e) => setFormData({ ...formData, kitchenAccess: e.target.value })}
              className="w-full p-3 border border-nutrix-gray-light bg-white"
            >
              <option>Full Kitchen</option>
              <option>Hostel / Dorm</option>
              <option>Hotel Buffet</option>
              <option>Basic (Kettle/Microwave)</option>
              <option>Ordering Out</option>
            </select>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-between mt-8 pt-6 border-t border-nutrix-gray-light/50">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-6 py-2.5 font-medium text-sm text-nutrix-gray-dark hover:bg-nutrix-gray-light flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-medium bg-nutrix-green text-white hover:bg-nutrix-green-dark flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-8 py-2.5 text-sm font-medium bg-nutrix-green-deep text-white hover:bg-black flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Plan
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
