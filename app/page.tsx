"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Leaf,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  ChefHat,
  Loader2,
  AlertCircle
} from "lucide-react";
import { api } from "./services/api";

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError(""); // Clear error on typing
  };

  // --- LOGIN LOGIC ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Login to get ID and Token
      const loginResponse = await api.login({
        email: formData.email,
        password: formData.password
      });

      // 2. Fetch full user details using the ID
      // The login response has { access_token, user_id }
      const userDetails = await api.getUser(loginResponse.user_id);

      // 3. Merge and Store
      const fullUser = { ...loginResponse, ...userDetails };
      localStorage.setItem("nutrix_user", JSON.stringify(fullUser));

      console.log("Login Successful", fullUser);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SIGN UP LOGIC ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Register
      const registerResponse = await api.register({
        full_name: formData.name,
        email: formData.email,
        password: formData.password
      });
      console.log("Account Created:", registerResponse);

      // 2. Login immediately to get the user object (with ID)
      const loginResponse = await api.login({
        email: formData.email,
        password: formData.password
      });

      // 3. Fetch full user details
      const userDetails = await api.getUser(loginResponse.user_id);

      // 4. Merge and Store
      const fullUser = { ...loginResponse, ...userDetails };
      localStorage.setItem("nutrix_user", JSON.stringify(fullUser));

      console.log("Login Successful after Signup:", fullUser);
      router.push("/onboarding");
    } catch (err: any) {
      console.error("Signup Error:", err);
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 font-sans bg-background text-foreground">

      {/* LEFT SIDE: Brand Visuals */}
      <div className="hidden lg:flex flex-col justify-between bg-nutrix-green-deep px-12 py-10 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 border border-white/20">
            <Leaf className="h-6 w-6 text-nutrix-green-light" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">NutriX</span>
        </div>

        {/* Value Prop */}
        <div className="max-w-lg space-y-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-nutrix-green-light/70">
            AI nutrition for Indian athletes
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight">
            Eat like a pro, <br />
            <span className="text-nutrix-green-light">play like a champion.</span>
          </h1>
          <p className="text-nutrix-green-light/80 text-sm leading-relaxed">
            NutriX builds match-aware meal plans using your training load, schedule and verified Indian ingredients.
          </p>

          <div className="grid gap-3 pt-2">
            {[
              { icon: ChefHat, text: "Verified Indian recipes (IFCT 2017)" },
              { icon: Dumbbell, text: "Match-day specific fueling blocks" },
              { icon: CheckCircle2, text: "Macros tuned to your phase" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-nutrix-green/20 p-2 text-nutrix-green-light">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-nutrix-green-light/90">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[11px] text-white/40 font-medium pt-6">
          © {new Date().getFullYear()} NutriX • Built for athletes
        </div>
      </div>

      {/* RIGHT SIDE: Auth Forms */}
      <div className="flex items-center justify-center p-6 bg-nutrix-gray-light/30">
        <div className="w-full max-w-[420px] space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6 text-nutrix-green-deep">
            <div className="bg-nutrix-green-deep p-2 text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="text-2xl font-semibold tracking-tight">NutriX</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-nutrix-gray-medium">
              Account
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-nutrix-green-deep">
              {activeTab === "login" ? "Log in to NutriX" : "Create your NutriX account"}
            </h2>
            <p className="text-sm text-nutrix-gray-dark">
              Sync your profile, preferences and meal plans across devices.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-nutrix-gray-light p-1.5 flex gap-1">
            {["login", "signup"].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab as any); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 border ${activeTab === tab
                  ? "bg-white text-nutrix-green-deep border-nutrix-green"
                  : "bg-transparent text-nutrix-gray-dark border-transparent hover:text-nutrix-green-deep"
                  }`}
              >
                {tab === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Form Container */}
          <div className="bg-white p-8 border border-nutrix-gray-light/70">

            {/* Header Text */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold tracking-tight text-nutrix-green-deep">
                {activeTab === "login" ? "Welcome back" : "Let's get started"}
              </h2>
              <p className="text-nutrix-gray-dark text-sm mt-1">
                {activeTab === "login"
                  ? "Use the email and password you registered with."
                  : "A few details to personalise your plan."}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-nutrix-red/10 border border-nutrix-red/20 flex items-center gap-3 text-nutrix-red text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <form onSubmit={activeTab === "login" ? handleLogin : handleSignUp} className="space-y-5">

              {/* Name Field (Signup Only) */}
              {activeTab === "signup" && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em] ml-1">Full name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-nutrix-gray-light focus:border-nutrix-green outline-none transition-all text-sm font-medium placeholder:text-nutrix-gray-medium bg-nutrix-gray-light/10"
                    placeholder="e.g. Virat Kohli"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em] ml-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-nutrix-gray-light focus:border-nutrix-green outline-none transition-all text-sm font-medium placeholder:text-nutrix-gray-medium bg-nutrix-gray-light/10"
                  placeholder="athlete@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-medium text-nutrix-gray-dark uppercase tracking-[0.18em]">Password</label>
                  {activeTab === "login" && (
                    <Link href="#" className="text-[11px] font-medium text-nutrix-blue hover:text-nutrix-blue-dark transition-colors">
                      Forgot?
                    </Link>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-nutrix-gray-light focus:border-nutrix-green outline-none transition-all text-sm font-medium placeholder:text-nutrix-gray-medium bg-nutrix-gray-light/10"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-nutrix-green hover:bg-nutrix-green-dark text-white text-sm font-medium tracking-tight flex items-center justify-center gap-2 transition-colors mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {activeTab === "login" ? "Logging in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {activeTab === "login" ? "Login to dashboard" : "Start onboarding"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-[11px] text-nutrix-gray-dark">
            Protected by reCAPTCHA and subject to the NutriX{" "}
            <Link href="#" className="underline hover:text-nutrix-green-deep">Privacy Policy</Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
