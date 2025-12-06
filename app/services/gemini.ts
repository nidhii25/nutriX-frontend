
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY_STORAGE = "AIzaSyAmelVhSNYkH8YuDUkXCUeSdaU_85yJA8M";

export const geminiService = {
    getApiKey(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(API_KEY_STORAGE);
    },

    setApiKey(key: string) {
        localStorage.setItem(API_KEY_STORAGE, key);
    },

    async generateNutritionPlan(userProfile: any, planContext: any) {
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error("API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      You are an expert sports nutritionist AI. Create a detailed ${planContext.duration}-day nutrition plan for an athlete with the following profile:
      
      **Profile:**
      - Name: ${userProfile.user.full_name}
      - Sport: ${userProfile.athlete_or_lifestyle.sport}
      - Role: ${userProfile.athlete_or_lifestyle.role}
      - Phase: ${userProfile.athlete_or_lifestyle.phase_or_goal}
      - Height: ${userProfile.profile.height_cm}cm, Weight: ${userProfile.profile.current_weight_kg}kg
      - Dietary Prefs: ${userProfile.dietary_preferences.diet_type}
      - Allergies: ${userProfile.dietary_preferences.allergies?.join(", ") || "None"}
      - Kitchen Access: ${userProfile.profile.kitchen_type}

      **Plan Context:**
      - Goal: ${planContext.goal}
      - Context: ${planContext.type} (e.g., Tournament vs Lifestyle)
      - Duration: ${planContext.duration} days
      
      **Specific Day Schedule (CRITICAL):**
      ${Object.entries(planContext.dayTags || {}).map(([day, tag]) => `- Day ${Number(day) + 1}: ${tag}`).join("\n")}

      **Requirements:**
      1. Calculate specific daily calorie and macro targets based on the profile and goal.
      2. Provide a day-by-day plan.
      3. **CRITICAL**: For each day, use the specific "Tag" provided in the schedule above (e.g., if Day 1 is "Travel", plan specifically for travel).
      4. Provide 4-6 meals per day.
      5. Use Indian ingredients where appropriate but keep it globally accessible.
      6. **CRITICAL**: Return ONLY valid JSON in the following format, no markdown, no code blocks:
      
      {
        "name": "Plan Name",
        "goal": "Plan Goal",
        "days": [
          {
            "day": 1,
            "tag": "Training",
            "targetCalories": 2800,
            "macros": { "protein": 180, "carbs": 350, "fats": 80 },
            "meals": [
              {
                "id": "unique_id_1",
                "name": "Meal Name",
                "time": "08:00 AM",
                "calories": 500,
                "protein": 30,
                "carbs": 60,
                "fats": 15,
                "description": "Brief description"
              }
            ]
          }
        ]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonString);
    },

    async swapMeal(currentMeal: any, userProfile: any) {
        const apiKey = this.getApiKey();
        if (!apiKey) throw new Error("API Key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Suggest a healthy alternative meal for an athlete.
      
      **Original Meal to Replace:**
      - Name: ${currentMeal.name}
      - Calories: ${currentMeal.calories}
      - Macros: P:${currentMeal.protein}g, C:${currentMeal.carbs}g, F:${currentMeal.fats}g
      
      **Constraints:**
      - Diet: ${userProfile.dietary_preferences.diet_type}
      - Allergies: ${userProfile.dietary_preferences.allergies?.join(", ") || "None"}
      
      **Requirement:**
      Provide a SINGLE meal option that has similar caloric and macro profile but different ingredients.
      Return ONLY valid JSON:
      {
        "name": "New Meal Name",
        "calories": 500,
        "protein": 30,
        "carbs": 60,
        "fats": 15,
        "description": "Brief description"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonString);
    },

    // Simple verification against IFCT data
    // Calls the Next.js API route to avoid fs issues in browser
    async verifyWithIFCT(foodName: string) {
        try {
            const response = await fetch("/api/nutrition/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ foodName })
            });

            if (!response.ok) return { verified: false };
            return await response.json();
        } catch (e) {
            console.error("IFCT Verification failed", e);
            return { verified: false };
        }
    }
};
