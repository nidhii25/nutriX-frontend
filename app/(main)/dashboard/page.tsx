"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  RotateCcw,
  CheckCircle2,
  Clock,
  Plus,
  Calendar,
  Trophy,
  Utensils,
  ArrowRight,
  Leaf
} from "lucide-react";

import { api } from "@/app/services/api";

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("Athlete");
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // -------------------------------------------------------
  // LOAD USER + PLAN FROM BACKEND
  // -------------------------------------------------------
  const loadPlan = async () => {
    try {
      const storedUser = localStorage.getItem("nutrix_user");
      if (!storedUser) throw new Error("Not logged in");

      const user = JSON.parse(storedUser);
      const userId = user.user?.id || user.id;

      setUserName((user.user?.full_name || "Athlete").split(" ")[0]);

      // Fetch plan from backend
      const response = await api.getUserPlan(userId);

      if (response?.plan === null) {
        setActivePlan(null);
      } else {
        setActivePlan(response);
      }
    } catch (e) {
      console.error(e);
      setActivePlan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  // -------------------------------------------------------
  // MARK MEAL EATEN
  // -------------------------------------------------------
  const handleMarkEaten = async (mealId: string) => {
    if (!activePlan) return;

    await api.updateMealStatus(activePlan.id, mealId, "eaten");
    await loadPlan();
  };

  // -------------------------------------------------------
  // SWAP MEAL → REQUIRE BACKEND INTEGRATION
  // -------------------------------------------------------
  const handleSwap = async (meal: any) => {
    if (!activePlan) return;

    await api.swapMeal(activePlan.id, meal);
    await loadPlan();
  };

  // -------------------------------------------------------
  // ACTIVE PLAN VIEW
  // -------------------------------------------------------
  const ActivePlanView = () => {
    if (!activePlan) return null;

    const currentDay = activePlan.days[currentDayIndex];

    const dailyStats = currentDay.meals.reduce(
      (acc: any, meal: any) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const consumedStats = currentDay.meals.reduce(
      (acc: any, meal: any) => {
        if (meal.status === "eaten") {
          return {
            calories: acc.calories + meal.calories,
            protein: acc.protein + meal.protein,
            carbs: acc.carbs + meal.carbs,
            fats: acc.fats + meal.fats
          };
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Calculate ring progress
    const progressPercent =
    dailyStats.calories > 0
      ? Math.min((consumedStats.calories / dailyStats.calories) * 100, 100)
      : 0;

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (progressPercent / 100) * circumference;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-nutrix-gray-light pb-4">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-nutrix-gray-medium">Today</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-nutrix-green-deep">
              Hi {userName}, here&apos;s your focus
            </h1>
            <p className="text-sm text-nutrix-gray-dark mt-1">
              Day {currentDay.day} • <span className="font-medium text-nutrix-blue">{currentDay.tag}</span>
            </p>
          </div>
          <Link href="/dashboard/plan" className="text-xs font-medium text-nutrix-green hover:underline">
            View full plan
          </Link>
        </div>

        {/* Macro Card */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-nutrix-green-deep p-6 text-white flex items-center justify-between">
            <div className="z-10 space-y-6 flex-1">
              <div>
                <div className="text-nutrix-green-light font-medium text-[11px] mb-1 uppercase tracking-[0.18em] opacity-80">Calories reached</div>
                <div className="text-4xl font-semibold flex items-end gap-2 tracking-tight">
                  {consumedStats.calories}
                  <span className="text-lg text-white/60 font-medium mb-1">/ {dailyStats.calories} kcal</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "protein", current: consumedStats.protein, target: dailyStats.protein },
                  { label: "carbs", current: consumedStats.carbs, target: dailyStats.carbs },
                  { label: "fats", current: consumedStats.fats, target: dailyStats.fats },
                ].map((val) => (
                  <div key={val.label}>
                    <div className="flex justify-between text-[11px] text-nutrix-green-light/80 mb-1 uppercase tracking-wide">{val.label}</div>
                    <div className="h-1.5 w-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-nutrix-green-light" style={{ width: val.target > 0 ? `${(val.current / val.target) * 100}%` : '0%' }}></div>
                    </div>
                    <div className="text-xs font-semibold mt-1">{val.current}g <span className="opacity-50">/ {val.target}g</span></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Ring SVG */}
            <div className="relative w-32 h-32 flex-shrink-0 ml-4 hidden sm:block">
              <svg className="transform -rotate-90 w-full h-full">
                <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                <circle cx="64" cy="64" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="text-nutrix-green-light transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-8 h-8 text-nutrix-green-light fill-current" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-nutrix-gray-light flex flex-col justify-center space-y-4">
            <h3 className="font-semibold text-sm tracking-tight text-nutrix-green-deep">Hydration</h3>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-nutrix-blue/10">
                <span className="text-2xl">💧</span>
              </div>
              <div>
                <div className="text-2xl font-semibold tracking-tight text-nutrix-blue-deep">1.5L</div>
                <div className="text-xs text-nutrix-gray-dark">of 3.0L goal</div>
              </div>
            </div>
            <button className="w-full py-2 border border-nutrix-blue/40 text-nutrix-blue font-medium text-sm hover:bg-nutrix-blue/5 transition-colors">
              + Add water
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-nutrix-green-deep">Meals</h2>
          </div>
          <div className="space-y-4">
            {currentDay.meals.map((meal) => (
              <div key={meal.id} className={`relative bg-white p-5 border transition-all duration-200 group ${meal.status === "eaten" ? "border-nutrix-green/30 bg-nutrix-green/5" : "border-nutrix-gray-light hover:border-nutrix-green/50"}`}>
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-nutrix-gray-light/50 -z-10 group-first:top-1/2 group-last:bottom-1/2"></div>
                <div className="flex gap-4 items-start">
                  <div className={`mt-1 h-3 w-3 rounded-full ring-4 ring-white flex-shrink-0 ${meal.status === "eaten" ? "bg-nutrix-green" : "bg-nutrix-gray-medium"}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-nutrix-gray-dark uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> {meal.time}</span>
                        </div>
                        <h3 className={`text-lg font-bold ${meal.status === 'eaten' ? 'text-nutrix-green-dark line-through opacity-70' : 'text-nutrix-green-deep'}`}>{meal.name}</h3>
                      </div>
                      <div className="text-right"><div className="font-bold text-nutrix-green-deep">{meal.calories} kcal</div></div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-medium text-nutrix-blue uppercase tracking-wide bg-nutrix-blue/5 inline-block px-2 py-0.5">
                        P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fats}g
                      </span>
                      {meal.isSwapped && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Swapped</span>
                      )}
                    </div>

                    {meal.status !== "eaten" && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-nutrix-gray-light/50">
                        <button
                          onClick={() => handleMarkEaten(meal.id)}
                          className="flex-1 py-2 bg-nutrix-green hover:bg-nutrix-green-dark text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Mark Eaten
                        </button>
                        <button
                          onClick={() => router.push("/dashboard/plan")}
                          className="px-4 py-2 border border-nutrix-gray-medium hover:border-nutrix-green hover:text-nutrix-green text-nutrix-gray-dark text-sm font-medium flex items-center gap-2 transition-all"
                        >
                          <RotateCcw className="w-4 h-4" /> Swap
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- COMPONENT: EMPTY STATE VIEW ---
  const EmptyStateView = () => (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <Leaf className="w-14 h-14 text-nutrix-green mb-4" />
      <h1 className="text-4xl font-bold text-nutrix-green-deep mb-3">
        Ready to fuel up, {userName}?
      </h1>
      <p className="text-nutrix-gray-dark max-w-md text-lg mb-6">
        You don’t have a plan yet. Create one to begin.
      </p>

      <button
        onClick={() => router.push("/dashboard/plan/create")}
        className="px-6 py-3 bg-nutrix-green text-white font-semibold rounded-xl"
      >
        Create Plan
      </button>
    </div>
  );

  return loading ? (
    <div className="p-10 text-center">Loading...</div>
  ) : activePlan ? (
    <ActivePlanView />
  ) : (
    <EmptyStateView />
  );
}
