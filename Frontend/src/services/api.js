// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bsuger-backend.vercel.app/api";

// Helper function to get auth token
const getToken = () => {
    return localStorage.getItem("token");
};

// ─────────────────────────────────────────
// Profile API Calls
// ─────────────────────────────────────────
export const profileAPI = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            throw error;
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to update profile:", error);
            throw error;
        }
    },
};

// ─────────────────────────────────────────
// Auth API Calls
// ─────────────────────────────────────────
export const authAPI = {
    // Register new user
    register: async (name, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            return data;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    },

    // Login user
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);
            return data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },
};

// ─────────────────────────────────────────
// Dashboard API Calls
// ─────────────────────────────────────────
export const dashboardAPI = {
    // Get dashboard data
    getDashboard: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch dashboard:", error);
            throw error;
        }
    },
};

// ─────────────────────────────────────────
// Meals API Calls
// ─────────────────────────────────────────
export const mealsAPI = {
    // Log a meal
    logMeal: async (mealData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/meals/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(mealData),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to log meal:", error);
            throw error;
        }
    },

    // Get meals
    getMeals: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/meals/today`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Failed to fetch meals:", error);
            throw error;
        }
    },
};

export default {
    profileAPI,
    authAPI,
    dashboardAPI,
    mealsAPI,
};
