"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Trophy,
  Utensils,
  Droplets,
  Edit2,
  Save,
  LogOut,
  ChevronRight,
  CreditCard,
  Activity,
} from "lucide-react";

import { api } from "../../../services/api";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ------------------------------------------------------------
  // LOGOUT (now from backend cookie)
  // ------------------------------------------------------------
  const handleLogout = () => {
  // If you use cookies, backend clears on expiry automatically
  // Optional: call a backend logout later if created
  router.push("/");
};

  // ------------------------------------------------------------
  // LOAD PROFILE securely + onboarding guard
  // ------------------------------------------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        // 1️⃣ Get logged-in user from backend session
        const currentUser = await api.getCurrentUser();
        const userId = currentUser.id;

        // 2️⃣ Fetch full onboarding profile
        const onboarding = await api.getProfile(userId);

        // 3️⃣ Onboarding completion guard
        const isCompleted =
          onboarding.profile?.height_cm &&
          onboarding.profile?.current_weight_kg &&
          onboarding.athlete_or_lifestyle?.is_athlete !== null &&
          onboarding.dietary_preferences?.diet_type;

        if (!isCompleted) {
          router.push("/onboarding");
          return;
        }

        // 4️⃣ Merge and store profile info for UI
        setUser({
          user: currentUser,
          profile: onboarding.profile,
          athlete: onboarding.athlete_or_lifestyle,
          dietary: onboarding.dietary_preferences,
        });
      } catch (err) {
        console.error("User not authenticated:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  // ------------------------------------------------------------
  // EDIT TOGGLE
  // ------------------------------------------------------------
  const toggleEdit = () => {
    if (isEditing) {
      console.log("Saving profile...", user);
      // TODO — add updateProfile() later
    }
    setIsEditing(!isEditing);
  };

  if (loading) return <div className="p-10 text-center">Loading profile...</div>;
  if (!user) return <div className="p-10 text-center">Profile not found.</div>;

  // ------------------------------------------------------------
  // UI DISPLAY MAPPING
  // ------------------------------------------------------------
  const display = {
    name: user.user.full_name,
    email: user.user.email,
    joined: new Date(user.user.created_at).toLocaleDateString(),

    stats: {
      height: user.profile?.height_cm || "-",
      weight: user.profile?.current_weight_kg || "-",
      age: user.profile?.dob
        ? new Date().getFullYear() - new Date(user.profile.dob).getFullYear()
        : "-",
      bmi: user.athlete?.bmi || "-",
    },

    athlete: {
      isAthlete: user.athlete?.is_athlete,
      sport: user.athlete?.sport || "N/A",
      role: user.athlete?.role || "N/A",
      phase: user.athlete?.phase_or_goal || "N/A",
    },

    prefs: {
      diet: user.dietary?.diet_type || "-",
      kitchen: user.profile?.kitchen_type || "-",
      allergies: user.dietary?.allergies?.join(", ") || "-",
      waterGoal: (user.profile?.water_target_liters || "-") + " L",
    },
  };

  return (
    <div className="space-y-8 pb-10">

      {/* PROFILE HEADER */}
      <div className="bg-white p-6 border border-nutrix-gray-light">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-nutrix-green-deep text-white flex items-center justify-center text-2xl font-semibold">
            {display.name.charAt(0)}
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <p className="text-[10px] uppercase text-nutrix-gray-medium tracking-[0.2em]">Profile</p>
            <h1 className="text-2xl font-semibold text-nutrix-green-deep">{display.name}</h1>

            <div className="flex items-center justify-center md:justify-start text-sm gap-2 text-nutrix-gray-dark">
              <Mail className="w-3 h-3" />
              {display.email}
            </div>

            <div className="flex items-center justify-center md:justify-start text-sm gap-2">
              <Trophy className="w-3 h-3 text-nutrix-yellow" />
              <span className="font-semibold text-nutrix-green">{display.athlete.phase}</span>
              • {display.athlete.sport}
            </div>
          </div>

          <button
            onClick={toggleEdit}
            className={`px-6 py-2.5 text-sm font-medium flex items-center gap-2 border ${
              isEditing
                ? "bg-nutrix-green text-white border-nutrix-green"
                : "bg-white text-nutrix-gray-dark border-nutrix-gray-light hover:bg-nutrix-gray-light/40"
            }`}
          >
            {isEditing ? <><Save className="w-4 h-4" /> Save</> : <><Edit2 className="w-4 h-4" /> Edit</>}
          </button>
        </div>
      </div>

      {/* METRICS + PREFERENCES */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Body Metrics */}
          <div className="bg-white border border-nutrix-gray-light p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-6 text-nutrix-green-deep">
              <Activity className="w-5 h-5" /> Body metrics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Height", val: display.stats.height, unit: "cm" },
                { label: "Weight", val: display.stats.weight, unit: "kg" },
                { label: "Age", val: display.stats.age, unit: "yrs" },
                { label: "BMI", val: display.stats.bmi, unit: "" },
              ].map((s) => (
                <div key={s.label} className="p-4 bg-nutrix-gray-light/30 border">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-nutrix-gray-dark">{s.label}</div>
                  <div className="text-2xl font-semibold text-nutrix-green-deep">
                    {isEditing ? (
                      <input defaultValue={s.val} className="bg-white border-b-2 border-nutrix-green w-full" />
                    ) : (
                      s.val
                    )}
                    <span className="text-sm text-nutrix-gray-medium ml-1">{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border border-nutrix-gray-light p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-6 text-nutrix-green-deep">
              <Utensils className="w-5 h-5" /> Nutrition settings
            </h3>

            {[
              { label: "Diet Type", val: display.prefs.diet },
              { label: "Water Goal", val: display.prefs.waterGoal },
              { label: "Kitchen Access", val: display.prefs.kitchen },
              { label: "Allergies", val: display.prefs.allergies },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 border-b hover:bg-nutrix-gray-light/20">
                <div>
                  <div className="text-sm text-nutrix-gray-dark">{item.label}</div>
                  <div className="text-base font-bold text-nutrix-green-deep">{item.val}</div>
                </div>
                {isEditing && <ChevronRight className="w-5 h-5 text-nutrix-gray-medium" />}
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">

          {/* Subscription Card */}
          <div className="bg-nutrix-blue-deep text-white p-6">
            <CreditCard className="w-6 h-6 mb-2" />
            <h3 className="text-sm font-semibold mb-1">NutriX Premium</h3>
            <p className="text-xs mb-4">Next billing: Nov 24, 2025</p>
            <button className="w-full bg-white text-nutrix-blue-deep py-2.5">Manage Subscription</button>
          </div>

          {/* Account Actions */}
          <div className="bg-white border p-2">
            <button className="w-full p-3 flex justify-between hover:bg-nutrix-gray-light/40">
              Change Password <ChevronRight className="w-4 h-4" />
            </button>

            <button className="w-full p-3 flex justify-between hover:bg-nutrix-gray-light/40">
              Notification Settings <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full p-3 flex justify-between text-nutrix-red hover:bg-nutrix-gray-light/40"
            >
              Sign Out <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
