
export interface Meal {
    id: string;
    name: string;
    time: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    status: "pending" | "eaten" | "skipped";
    description?: string;
    isSwapped?: boolean;
}

export interface DayPlan {
    day: number;
    date?: string;
    tag: string; // "Normal", "Match Day", "Travel", etc.
    targetCalories: number;
    macros: {
        protein: number;
        carbs: number;
        fats: number;
    };
    meals: Meal[];
}

export interface NutritionPlan {
    id: string;
    name: string;
    goal: string;
    duration: number;
    startDate: string;
    status: "active" | "completed" | "archived";
    days: DayPlan[];
    createdAt: string;
}

const getStorageKey = () => {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("nutrix_user");
    if (!storedUser) return null;
    try {
        const user = JSON.parse(storedUser);
        // Handle various user object structures
        const userId = user.user?.id || user.id || user.user_id;
        if (!userId) return null;
        return `nutrix_plan_${userId}`;
    } catch (e) {
        return null;
    }
};

export const planService = {
    savePlan(plan: NutritionPlan) {
        const key = getStorageKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(plan));
        }
    },

    getPlan(): NutritionPlan | null {
        const key = getStorageKey();
        if (!key) return null;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    },

    clearPlan() {
        const key = getStorageKey();
        if (key) {
            localStorage.removeItem(key);
        }
    },

    updateMealStatus(dayIndex: number, mealId: string, status: "pending" | "eaten" | "skipped") {
        const plan = this.getPlan();
        if (!plan) return;

        const day = plan.days[dayIndex];
        if (!day) return;

        const meal = day.meals.find((m) => m.id === mealId);
        if (meal) {
            meal.status = status;
            this.savePlan(plan);
        }
    },

    swapMealInPlan(dayIndex: number, mealId: string, newMeal: Meal) {
        const plan = this.getPlan();
        if (!plan) return;

        const day = plan.days[dayIndex];
        if (!day) return;

        const mealIndex = day.meals.findIndex((m) => m.id === mealId);
        if (mealIndex !== -1) {
            day.meals[mealIndex] = { ...newMeal, status: "pending", isSwapped: true };
            this.savePlan(plan);
        }
    }
};
