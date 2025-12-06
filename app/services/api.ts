const API_BASE_URL = "https://nutrix-backend.onrender.com";

export const api = {
    async register(data: any) {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const resData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(resData.detail || "Registration failed");
        }
        return resData;
    },

    async login(data: any) {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const resData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(resData.detail || "Login failed");
        }
        return resData;
    },

    async completeOnboarding(userId: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/onboarding/api/onboarding/complete/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const resData = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(resData.detail || "Onboarding failed");
        }
        return resData;
    },

    async getUser(userId: string) {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);

        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }

        return response.json();
    },

    async getProfile(userId: string) {
        const response = await fetch(`${API_BASE_URL}/onboarding/api/onboarding/${userId}`);

        if (!response.ok) {
            throw new Error("Failed to fetch profile");
        }

        return response.json();
    },

    async getCurrentUser() {
    const stored = localStorage.getItem("nutrix_user");
    if (!stored) throw new Error("Not authenticated");
    return JSON.parse(stored);
    },

    async createPlan(data: any) {
        const res = await fetch(`${API_BASE_URL}/plans/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error("Failed to create plan");

        return res.json();
    },

    async getUserPlan(userId: string) {
        const r = await fetch(`${API_BASE_URL}/plans/${userId}`);
        if (!r.ok) throw new Error("Failed to fetch plan");
        return r.json();
    },

    async updateMealStatus(planId: string, mealId: string, status: string) {
        const r = await fetch(
            `${API_BASE_URL}/plans/${planId}/meal/${mealId}?status=${encodeURIComponent(status)}`,
            { method: "PUT" }
        );

        if (!r.ok) throw new Error("Failed to update meal");

        return r.json();
    },

    async swapMeal(planId: string, meal: any) {
        const r = await fetch(`${API_BASE_URL}/plans/${planId}/swap`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify(meal), // ✅ send meal directly
        });

        if (!r.ok) {
            const err = await r.text();
            console.error("Swap meal error:", err);
            throw new Error("Failed to swap meal");
        }

        return r.json();
    },

    async deletePlan(planId: string) {
        const r = await fetch(`${API_BASE_URL}/plans/${planId}`, { method: "DELETE" });

        if (!r.ok) throw new Error("Failed to delete plan");

        return r.json();
    }
};
