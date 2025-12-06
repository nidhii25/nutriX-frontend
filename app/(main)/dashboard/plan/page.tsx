"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Plane,
  Dumbbell,
  BatteryCharging,
  ChefHat,
  UtensilsCrossed,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2
} from "lucide-react";
import { api } from "@/app/services/api";

export default function MyPlanPage() {
  const router = useRouter();

  const [plan, setPlan] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swappingMealId, setSwappingMealId] = useState<string | null>(null);

  // ---------------------------------------
  // 🚀 FETCH ACTIVE PLAN ON LOAD
  // ---------------------------------------
  const loadPlan = async () => {
    try {
      const storedUser = localStorage.getItem("nutrix_user");
      if (!storedUser) throw new Error("User not logged in");

      const parsed = JSON.parse(storedUser);
      const userId = parsed.user?.id || parsed.id;

      const res = await api.getUserPlan(userId);

      if (res && res.days) {
        setPlan(res);
      } else {
        setPlan(null);
      }
    } catch (err) {
      console.error("Failed to load plan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  // ---------------------------------------
  // 🚀 UPDATE MEAL STATUS (eaten / skipped / pending)
  // ---------------------------------------
  const handleStatusUpdate = async (mealId: string, status: "eaten" | "skipped" | "pending") => {
    if (!plan) return;

    try {
      await api.updateMealStatus(plan.id, mealId, status);
      await loadPlan();
    } catch (err) {
      console.error(err);
      alert("Failed to update meal status");
    }
  };

  // ---------------------------------------
  // 🚀 SWAP MEAL USING BACKEND AI
  // ---------------------------------------
  const handleSwap = async (meal: any) => {
    if (!plan) return;
    setSwappingMealId(meal.id);

    try {
      const { new_meal } = await api.swapMeal(plan.id, meal);
      await loadPlan();
    } catch (err) {
      console.error(err);
      alert("Swap failed");
    } finally {
      setSwappingMealId(null);
    }
  };

  // ---------------------------------------
  // 🚀 DELETE PLAN
  // ---------------------------------------
  const handleDeletePlan = async () => {
    if (!plan) return;

    if (confirm("Are you sure you want to delete this plan?")) {
      await api.deletePlan(plan.id);
      setPlan(null);
    }
  };

  // ---------------------------------------
  // Render Logic
  // ---------------------------------------

  if (loading) return <div className="p-10 text-center">Loading plan...</div>;

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="bg-nutrix-green/10 p-6">
          <ChefHat className="w-12 h-12 text-nutrix-green" />
        </div>

        <h2 className="text-2xl font-semibold text-nutrix-green-deep">No active plan</h2>
        <p className="text-sm text-nutrix-gray-dark max-w-md">
          Create a personalized nutrition plan to get started.
        </p>

        <button
          onClick={() => router.push("/dashboard/plan/create")}
          className="px-8 py-2.5 bg-nutrix-green text-white hover:bg-nutrix-green-dark text-sm font-medium"
        >
          Create New Plan
        </button>
      </div>
    );
  }

  const currentDay = plan.days[selectedDayIndex];

  // Helper for day icons
  const getDayMeta = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes("match")) return { icon: Trophy };
    if (t.includes("travel")) return { icon: Plane };
    if (t.includes("rest") || t.includes("recovery")) return { icon: BatteryCharging };
    return { icon: Dumbbell };
  };

  const dayMeta = getDayMeta(currentDay.tag);

  // Nutrition Calculations
  const dailyStats = currentDay.meals.reduce(
    (acc: any, m: any) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fats: acc.fats + m.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const consumedStats = currentDay.meals.reduce(
    (acc: any, m: any) => {
      if (m.status === "eaten") {
        return {
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fats: acc.fats + m.fats
        };
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const remainingCalories = dailyStats.calories - consumedStats.calories;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">

      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-nutrix-gray-light pb-4">
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.2em] uppercase text-nutrix-gray-medium">Nutrition plan</p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-nutrix-green-deep">
              {plan.name}
            </h1>
            <span className="text-[10px] font-semibold px-2 py-0.5 border border-nutrix-green text-nutrix-green uppercase tracking-wide">
              Active
            </span>
          </div>
          <p className="text-sm text-nutrix-gray-dark">
            Goal: <span className="font-medium text-nutrix-green-deep">{plan.goal}</span> • {plan.duration} days
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDeletePlan}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-nutrix-red/40 text-nutrix-red font-medium text-sm hover:bg-nutrix-red/5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Plan
          </button>
          <button
            onClick={() => router.push("/dashboard/plan/create")}
            className="flex items-center gap-2 px-4 py-2.5 bg-nutrix-green hover:bg-nutrix-green-dark text-white font-medium text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>
      </div>

      {/* 2. HORIZONTAL DAY SELECTOR */}
      <div className="bg-white p-4 border border-nutrix-gray-light overflow-x-auto">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-semibold text-nutrix-gray-dark text-[11px] uppercase tracking-[0.18em]">Schedule</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))}
              disabled={selectedDayIndex === 0}
              className="px-2 py-1 border border-nutrix-gray-light text-nutrix-gray-dark text-xs disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedDayIndex(Math.min(plan.days.length - 1, selectedDayIndex + 1))}
              disabled={selectedDayIndex === plan.days.length - 1}
              className="px-2 py-1 border border-nutrix-gray-light text-nutrix-gray-dark text-xs disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 min-w-max pb-1">
          {plan.days.map((day: any, index:number) => {
            const isSelected = index === selectedDayIndex;
            const meta = getDayMeta(day.tag);
            return (
              <button
                key={day.day}
                onClick={() => setSelectedDayIndex(index)}
                className={`relative flex flex-col items-center px-3 py-2 border transition-all duration-150 w-24 ${isSelected
                  ? "border-nutrix-green bg-nutrix-green/5"
                  : "border-nutrix-gray-light hover:bg-nutrix-gray-light/60"
                  }`}
              >
                <span className={`text-[11px] font-semibold mb-1 ${isSelected ? "text-nutrix-green-deep" : "text-nutrix-gray-medium"}`}>
                  Day {day.day}
                </span>
                <div className={`mb-1 ${isSelected ? "text-nutrix-green" : "text-nutrix-gray-dark"}`}>
                  <meta.icon className="w-6 h-6" />
                </div>

                {/* Type Badge */}
                <span className={`mt-1 text-[10px] font-medium truncate w-full text-center ${isSelected
                  ? "text-nutrix-green-deep"
                  : "text-nutrix-gray-dark/60"
                  }`}>
                  {day.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DAY DETAILS VIEW */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-nutrix-blue-deep text-white p-6 relative overflow-hidden">
            <h3 className="text-[11px] mb-4 uppercase tracking-[0.18em] text-nutrix-blue-light">Day strategy</h3>

            <div className="space-y-5 relative z-10">
              <div>
                <div className="text-3xl font-bold">
                  {remainingCalories} <span className="text-sm font-normal opacity-60">/ {dailyStats.calories}</span>
                </div>
                <div className="text-sm opacity-80">Remaining Calories</div>
              </div>

              <div>
                <div className="text-xl font-bold text-nutrix-green-light">{currentDay.tag}</div>
                <div className="text-sm opacity-80">Focus</div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm font-medium">
                  <ChefHat className="w-5 h-5 text-nutrix-yellow" />
                  <span>{currentDay.meals.length} Meals Planned</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-nutrix-gray-light">
            <h3 className="font-semibold text-sm tracking-tight text-nutrix-green-deep mb-3">Nutrient distribution</h3>
            <div className="space-y-4">
              {[
                { label: "Carbs", val: dailyStats.carbs, unit: "g", color: "bg-nutrix-yellow", consumed: consumedStats.carbs },
                { label: "Protein", val: dailyStats.protein, unit: "g", color: "bg-nutrix-green", consumed: consumedStats.protein },
                { label: "Fats", val: dailyStats.fats, unit: "g", color: "bg-nutrix-red", consumed: consumedStats.fats },
              ].map((macro) => {
                const total = dailyStats.carbs + dailyStats.protein + dailyStats.fats;
                const pct = total > 0 ? Math.round((macro.val / total) * 100) + "%" : "0%";
                const consumedPct = macro.val > 0 ? Math.round((macro.consumed / macro.val) * 100) + "%" : "0%";
                return (
                  <div key={macro.label}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium text-nutrix-gray-dark">
                      <span className="uppercase tracking-wide">{macro.label}</span>
                      <span className="text-xs">
                        <span className="text-nutrix-green-deep font-bold">{macro.consumed}</span> / {macro.val}{macro.unit}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-nutrix-gray-light overflow-hidden">
                      <div className={`h-full ${macro.color}`} style={{ width: pct }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Meal Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-nutrix-gray-light overflow-hidden">
            <div className="p-5 border-b border-nutrix-gray-light bg-nutrix-gray-light/20">
              <h3 className="font-semibold text-sm text-nutrix-green-deep flex items-center gap-2 tracking-tight">
                <UtensilsCrossed className="w-5 h-5" />
                Meal schedule
              </h3>
            </div>

            <div className="divide-y divide-nutrix-gray-light">
              {currentDay.meals.map((meal: any) => (
                <div key={meal.id} className={`p-5 flex gap-4 transition-colors group ${meal.status === 'eaten' ? 'bg-nutrix-green/5' : ''}`}>
                  <div className="flex-shrink-0 w-16 text-center pt-1">
                    <span className="text-xs font-bold text-nutrix-gray-dark block">{meal.time.split(' ')[0]}</span>
                    <span className="text-[10px] text-nutrix-gray-medium">{meal.time.split(' ')[1]}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium text-sm tracking-tight transition-colors ${meal.status === 'eaten' ? 'text-nutrix-green line-through' : 'text-nutrix-green-deep'}`}>
                        {meal.name}
                      </h4>
                      <span className="text-xs font-semibold text-nutrix-green">{meal.calories} kcal</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[11px] font-medium text-nutrix-blue uppercase tracking-wide bg-nutrix-blue/5 inline-block px-2 py-0.5">
                        P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                      </p>
                      {meal.isSwapped && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5">Swapped</span>
                      )}
                    </div>

                    {meal.description && (
                      <p className="text-xs text-nutrix-gray-dark italic">{meal.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      {meal.status !== 'eaten' && (
                        <button
                          onClick={() => handleStatusUpdate(meal.id, "eaten")}
                          className="text-[11px] flex items-center gap-1 text-nutrix-green font-semibold hover:bg-nutrix-green/10 px-2 py-1 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" /> Mark Eaten
                        </button>
                      )}
                      {meal.status === 'eaten' && (
                        <button
                          onClick={() => handleStatusUpdate(meal.id, "pending")}
                          className="text-[11px] flex items-center gap-1 text-nutrix-gray-dark font-semibold hover:bg-nutrix-gray-light px-2 py-1 transition-colors"
                        >
                          <XCircle className="w-3 h-3" /> Undo
                        </button>
                      )}

                      <button
                        onClick={() => handleSwap(meal)}
                        disabled={swappingMealId === meal.id || meal.status === 'eaten'}
                        className="text-[11px] flex items-center gap-1 text-nutrix-blue font-semibold hover:bg-nutrix-blue/10 px-2 py-1 transition-colors disabled:opacity-50"
                      >
                        {swappingMealId === meal.id ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Swapping...</>
                        ) : (
                          <><RefreshCw className="w-3 h-3" /> Swap Meal</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-nutrix-gray-light/30 text-center">

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
