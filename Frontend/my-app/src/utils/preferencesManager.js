import { auth } from "../components/Firebase";

const API_URL = "http://localhost:3000";

/**
 * Save user preferences
 * @param {object} preferences - User preferences (favoriteCategories, etc)
 */
export const saveUserPreferences = async (preferences) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("User not logged in");
      // Save to localStorage as backup
      localStorage.setItem(
        "userPreferences",
        JSON.stringify(preferences)
      );
      return;
    }

    // Save to localStorage
    localStorage.setItem(
      `userPreferences_${user.uid}`,
      JSON.stringify(preferences)
    );

    // Optionally save to backend
    const response = await fetch(`${API_URL}/api/user-preferences/${user.uid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.uid,
        preferences,
        updatedAt: new Date(),
      }),
    });

    if (!response.ok) {
      console.error("Failed to save preferences to backend");
    }
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
};

/**
 * Get user preferences
 * @param {string} userId - User ID
 */
export const getUserPreferences = async (userId) => {
  try {
    // Try to get from localStorage first
    const localPrefs = localStorage.getItem(`userPreferences_${userId}`);
    if (localPrefs) {
      return JSON.parse(localPrefs);
    }

    // Try backend
    const response = await fetch(`${API_URL}/api/user-preferences/${userId}`);

    if (response.ok) {
      const data = await response.json();
      return data.preferences;
    }

    // Default preferences
    return {
      favoriteCategories: [],
      favoriteSeasons: [],
      favoriteTypes: [],
      maxPlants: 10,
      experienceLevel: "beginner",
    };
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return {};
  }
};

/**
 * Update specific preference
 */
export const updatePreference = async (key, value) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const preferences = await getUserPreferences(user.uid);
    preferences[key] = value;
    await saveUserPreferences(preferences);
  } catch (error) {
    console.error("Error updating preference:", error);
  }
};

/**
 * Add favorite plant to preferences
 */
export const addFavoritePlant = async (plantName, category) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const preferences = await getUserPreferences(user.uid);
    
    if (!preferences.favoritePlants) {
      preferences.favoritePlants = [];
    }

    // Avoid duplicates
    if (!preferences.favoritePlants.includes(plantName)) {
      preferences.favoritePlants.push({ name: plantName, category, addedAt: new Date() });
    }

    await saveUserPreferences(preferences);
  } catch (error) {
    console.error("Error adding favorite plant:", error);
  }
};

/**
 * Get recommended plants based on user preferences
 */
export const getRecommendedPlants = async (availablePlants) => {
  try {
    const user = auth.currentUser;
    if (!user) return availablePlants;

    const preferences = await getUserPreferences(user.uid);
    const stats = await getUserActivityStats(user.uid);

    // Score plants based on user preferences and activity
    const scoredPlants = availablePlants.map((plant) => {
      let score = 0;

      // Boost score if category matches user preferences
      if (preferences.favoriteCategories?.includes(plant.type)) {
        score += 30;
      }

      // Boost easy plants for beginners
      if (
        preferences.experienceLevel === "beginner" &&
        plant.difficulty === "Easy"
      ) {
        score += 20;
      }

      // Give priority to previously viewed categories
      if (stats?.favoriteCategories?.[plant.type]) {
        score += stats.favoriteCategories[plant.type] * 5;
      }

      return { ...plant, recommendedScore: score };
    });

    // Sort by recommendation score
    return scoredPlants.sort(
      (a, b) => (b.recommendedScore || 0) - (a.recommendedScore || 0)
    );
  } catch (error) {
    console.error("Error getting recommended plants:", error);
    return availablePlants;
  }
};

/**
 * Get user activity statistics
 */
export const getUserActivityStats = async (userId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/activity-stats/${userId}`
    );

    if (response.ok) {
      return await response.json();
    }

    return {
      totalViews: 0,
      totalSearches: 0,
      totalSelections: 0,
      favoriteCategories: {},
    };
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    return {};
  }
};
