"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Activity,
  Utensils,
  Droplets,
  Trophy,
  Briefcase,
  Loader2
} from "lucide-react";
import { api } from "../services/api";

// --- TYPES ---
type UserProfile = {
  id: string;
  full_name?: string;
  email: string;
};

type FormData = {
  gender: "male" | "female" | "other" | "";
  dob: string;
  height: string;
  weight: string;
  activityLevel: "sedentary" | "light" | "active" | "";
  isAthlete: boolean | null;
  lifestyleGoal: "maintain" | "lose" | "gain" | "";
  occupation: string;
  sport: string;
  role: string;
  trainingPhase: "off-season" | "pre-season" | "in-season" | "";
  dietType: "veg" | "egg" | "non-veg" | "vegan" | "jain" | "";
  allergies: string[];
  kitchenType: "full" | "hostel" | "ordering" | "";
  medicalConditions: string[];
  waterIntake: number;
};

const INITIAL_DATA: FormData = {
  gender: "",
  dob: "",
  height: "",
  weight: "",
  activityLevel: "",
  isAthlete: null,
  lifestyleGoal: "",
  occupation: "",
  sport: "",
  role: "",
  trainingPhase: "",
  dietType: "",
  allergies: [],
  kitchenType: "",
  medicalConditions: [],
  waterIntake: 2.5,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA);
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -------------------------------------------------------------------
  // ✅ REPLACE LOCAL STORAGE → FETCH USER FROM BACKEND SESSION
  // -------------------------------------------------------------------
  useEffect(() => {
  const stored = localStorage.getItem("nutrix_user");

  if (!stored) {
    router.push("/");
    return;
  }

  const user = JSON.parse(stored);
  setUserInfo(user);
}, [router]);



  // -------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------
  const updateFields = (fields: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const toggleArrayItem = (field: "allergies" | "medicalConditions", value: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      return arr.includes(value)
        ? { ...prev, [field]: arr.filter((x) => x !== value) }
        : { ...prev, [field]: [...arr, value] };
    });
  };

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  // -------------------------------------------------------------------
  // FINAL SUBMIT
  // -------------------------------------------------------------------
  const handleSubmit = async () => {
    setIsSubmitting(true);

    const genderMap: any = {
      male: "Male",
      female: "Female",
      other: "Other"
    };

    const activityMap: any = {
      sedentary: "Sedentary",
      light: "Light Active",
      active: "Active",
    };

    const payload = {
      gender: genderMap[formData.gender],
      dob: formData.dob,
      height_cm: Number(formData.height),
      current_weight_kg: Number(formData.weight),
      activity_level: activityMap[formData.activityLevel],

      what_drives_you: formData.isAthlete ? "Athlete" : "Lifestyle",

      sport: formData.sport,
      role: formData.role,
      phase: formData.trainingPhase,

      primary_goal: formData.isAthlete ? undefined : formData.lifestyleGoal,

      diet_type: formData.dietType,
      allergies: formData.allergies,
      dislikes: [],
      medical_conditions: formData.medicalConditions,
      supplements_stack: [],

      kitchen_type: formData.kitchenType,
      water_target_liters: formData.waterIntake,
    };

    try {
      if (!userInfo?.id) throw new Error("User ID missing");

      await api.completeOnboarding(userInfo.id, payload);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding failed", err);
      alert("Onboarding failed: " + (err.message ?? "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI COMPONENTS ---

  // Progress Bar
  const ProgressBar = () => (
    <div className="w-full h-1.5 bg-nutrix-gray-light mb-6">
      <div
        className="h-full bg-nutrix-green transition-all duration-500 ease-out"
        style={{ width: `${(step / 4) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-nutrix-gray-light/30 py-10 px-4 flex flex-col items-center">

      {/* Top Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-nutrix-green-deep">
          <div className="w-8 h-8 bg-nutrix-green flex items-center justify-center text-white text-sm font-semibold">
            N
          </div>
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-nutrix-gray-medium">
              Onboarding
            </p>
            <p className="text-base font-semibold tracking-tight">NutriX</p>
          </div>
        </div>
        <div className="text-sm font-medium text-nutrix-gray-dark">
          {userInfo ? `Hi, ${(userInfo.name || userInfo.full_name || "Athlete").split(" ")[0]}` : "Profile setup"}
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white border border-nutrix-gray-light/60">

        {/* Step Banner */}
        <div className="px-8 pt-8 pb-4 border-b border-nutrix-gray-light">
          <ProgressBar />
          <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-nutrix-gray-medium mb-1">
            Step {step} of 4
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-nutrix-green-deep mb-1">
            {step === 1 && "Basics"}
            {step === 2 && "How you train"}
            {step === 3 && "Kitchen & access"}
            {step === 4 && "Health & hydration"}
          </h1>
          <p className="text-sm text-nutrix-gray-dark">
            {step === 1 && "We use this to calculate your baseline needs."}
            {step === 2 && "We tailor macros based on your lifestyle and sport."}
            {step === 3 && "So plans only include what you can practically eat."}
            {step === 4 && "To respect medical history and hydration targets."}
          </p>
        </div>

        <div className="p-8 min-h-[400px]">

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFields({ gender: e.target.value as any })}
                    className="w-full p-4 rounded-xl border-2 border-nutrix-gray-light focus:border-nutrix-green bg-transparent outline-none font-medium"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Birthday</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => updateFields({ dob: e.target.value })}
                    className="w-full p-3.5 rounded-xl border-2 border-nutrix-gray-light focus:border-nutrix-green outline-none font-medium text-nutrix-gray-dark"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Height (cm)</label>
                  <input
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={(e) => updateFields({ height: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-nutrix-gray-light focus:border-nutrix-green outline-none font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => updateFields({ weight: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-nutrix-gray-light focus:border-nutrix-green outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Activity level</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { val: "sedentary", label: "Sedentary", icon: "🛋️" },
                    { val: "light", label: "Light Active", icon: "🚶" },
                    { val: "active", label: "Very Active", icon: "🏃" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => updateFields({ activityLevel: opt.val as any })}
                      className={`p-4 border flex flex-col items-center gap-2 transition-all duration-200 text-sm ${formData.activityLevel === opt.val
                        ? "border-nutrix-green bg-nutrix-green/5 text-nutrix-green-deep"
                        : "border-nutrix-gray-light hover:border-nutrix-green/40 text-nutrix-gray-dark"
                        }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: IDENTITY */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateFields({ isAthlete: true })}
                  className={`p-5 border flex flex-col items-center gap-3 transition-all duration-200 text-sm ${formData.isAthlete === true
                    ? "border-nutrix-green bg-nutrix-green text-white"
                    : "border-nutrix-gray-light text-nutrix-gray-dark hover:border-nutrix-green/50 hover:bg-nutrix-gray-light/30"
                    }`}
                >
                  <div className={`p-3 ${formData.isAthlete === true ? "bg-white/20" : "bg-nutrix-gray-light"}`}>
                    <Trophy className={`w-8 h-8 ${formData.isAthlete === true ? "text-white" : "text-nutrix-gray-dark"}`} />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-base">Athlete</div>
                    <div className={`text-xs mt-1 ${formData.isAthlete === true ? "text-nutrix-green-light" : "text-nutrix-gray-medium"}`}>Performance & Matches</div>
                  </div>
                </button>

                <button
                  onClick={() => updateFields({ isAthlete: false })}
                  className={`p-5 border flex flex-col items-center gap-3 transition-all duration-200 text-sm ${formData.isAthlete === false
                    ? "border-nutrix-blue bg-nutrix-blue text-white"
                    : "border-nutrix-gray-light text-nutrix-gray-dark hover:border-nutrix-blue/50 hover:bg-nutrix-gray-light/30"
                    }`}
                >
                  <div className={`p-3 ${formData.isAthlete === false ? "bg-white/20" : "bg-nutrix-gray-light"}`}>
                    <Activity className={`w-8 h-8 ${formData.isAthlete === false ? "text-white" : "text-nutrix-gray-dark"}`} />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-base">Lifestyle</div>
                    <div className={`text-xs mt-1 ${formData.isAthlete === false ? "text-nutrix-blue-light" : "text-nutrix-gray-medium"}`}>Fitness & Health</div>
                  </div>
                </button>
              </div>

              {/* Dynamic Sub-Forms */}
              {formData.isAthlete === true && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Sport</label>
                    <input
                      type="text"
                      placeholder="e.g. Cricket, Football"
                      value={formData.sport}
                      onChange={(e) => updateFields({ sport: e.target.value })}
                      className="w-full p-3.5 border border-nutrix-green/50 focus:border-nutrix-green outline-none text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Bowler"
                        value={formData.role}
                        onChange={(e) => updateFields({ role: e.target.value })}
                        className="w-full p-3.5 border border-nutrix-green/50 focus:border-nutrix-green outline-none text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Training phase</label>
                      <select
                        value={formData.trainingPhase}
                        onChange={(e) => updateFields({ trainingPhase: e.target.value as any })}
                        className="w-full p-3.5 border border-nutrix-green/50 focus:border-nutrix-green outline-none bg-white text-sm"
                      >
                        <option value="">Select...</option>
                        <option value="off-season">Off-Season</option>
                        <option value="pre-season">Pre-Season</option>
                        <option value="in-season">In-Season</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formData.isAthlete === false && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Primary goal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["maintain", "lose", "gain"].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => updateFields({ lifestyleGoal: goal as any })}
                        className={`py-3 border text-sm font-medium capitalize transition-all ${formData.lifestyleGoal === goal
                          ? "border-nutrix-blue bg-nutrix-blue/10 text-nutrix-blue-deep"
                          : "border-nutrix-gray-light text-nutrix-gray-dark hover:border-nutrix-blue/40"
                          }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: FOOD */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Diet preference</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { val: "veg", label: "Pure Veg" },
                    { val: "egg", label: "Eggetarian" },
                    { val: "non-veg", label: "Non-Veg" },
                    { val: "vegan", label: "Vegan" },
                    { val: "jain", label: "Jain" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => updateFields({ dietType: opt.val as any })}
                      className={`p-3 border text-sm font-medium transition-all ${formData.dietType === opt.val
                        ? "border-nutrix-green bg-nutrix-green text-white"
                        : "border-nutrix-gray-light text-nutrix-gray-dark hover:border-nutrix-green/50"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Allergies</label>
                <div className="flex flex-wrap gap-2">
                  {["Lactose", "Peanuts", "Gluten", "Soy", "Shellfish", "Eggs"].map((allergy) => (
                    <button
                      key={allergy}
                      onClick={() => toggleArrayItem("allergies", allergy)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${formData.allergies.includes(allergy)
                        ? "bg-nutrix-red/10 border-nutrix-red text-nutrix-red"
                        : "border-nutrix-gray-light text-nutrix-gray-dark hover:border-nutrix-red/30"
                        }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Kitchen access</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { val: "full", label: "Full Kitchen", icon: "🍳" },
                    { val: "hostel", label: "Kettle/Basic", icon: "🥣" },
                    { val: "ordering", label: "No Kitchen", icon: "🛵" },
                  ].map((k) => (
                    <button
                      key={k.val}
                      onClick={() => updateFields({ kitchenType: k.val as any })}
                      className={`p-4 border flex flex-col items-center gap-2 text-sm transition-all ${formData.kitchenType === k.val
                        ? "border-nutrix-green bg-nutrix-green/5 text-nutrix-green-deep"
                        : "border-nutrix-gray-light text-nutrix-gray-dark hover:border-nutrix-green/40"
                        }`}
                    >
                      <span className="text-2xl">{k.icon}</span>
                      <span className="text-xs font-medium">{k.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: MEDICAL */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="space-y-3">
                <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Medical conditions</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Diabetes", "PCOS/PCOD", "Hypertension", "Thyroid", "None"].map((cond) => (
                    <button
                      key={cond}
                      onClick={() => toggleArrayItem("medicalConditions", cond)}
                      className={`p-4 text-left border text-sm font-medium transition-all flex justify-between items-center ${formData.medicalConditions.includes(cond)
                        ? "border-nutrix-blue bg-nutrix-blue/5 text-nutrix-blue-dark"
                        : "border-nutrix-gray-light text-nutrix-gray-dark hover:border-nutrix-blue/40"
                        }`}
                    >
                      {cond}
                      {formData.medicalConditions.includes(cond) && (
                        <Check className="w-4 h-4 text-nutrix-blue" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-nutrix-blue/5 border border-nutrix-blue/10 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-nutrix-blue" />
                    <span className="text-sm font-semibold text-nutrix-blue-deep">Daily water goal</span>
                  </div>
                  <span className="text-2xl font-semibold tracking-tight text-nutrix-blue">{formData.waterIntake} L</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={formData.waterIntake}
                  onChange={(e) => updateFields({ waterIntake: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-nutrix-gray-light rounded-lg appearance-none cursor-pointer accent-nutrix-blue"
                />
                <div className="flex justify-between text-xs font-medium text-nutrix-gray-medium">
                  <span>1 Liter</span>
                  <span>6 Liters</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-nutrix-gray-light flex justify-between items-center">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-nutrix-gray-dark hover:bg-nutrix-gray-light transition-colors ${step === 1 ? "opacity-0 pointer-events-none" : ""
              }`}
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-nutrix-green hover:bg-nutrix-green-dark text-white text-sm font-medium tracking-tight transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : step === 4 ? (
              "Complete profile"
            ) : (
              <>Next <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
