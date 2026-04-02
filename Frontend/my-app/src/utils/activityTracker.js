import { auth } from "../components/Firebase";

const API_URL = "http://localhost:3001";

/**
 * Track user activity
 * @param {string} action - Type of action (view, search, select)
 * @param {object} data - Additional data (plantName, category, searchTerm)
 */
export const trackActivity = async (action, data = {}) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("User not logged in, skipping activity tracking");
      return;
    }

    const activityData = {
      userId: user.uid,
      action,
      ...data,
    };

    const response = await fetch(`${API_URL}/api/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(activityData),
    });

    if (!response.ok) {
      console.error("Failed to track activity");
    }
  } catch (error) {
    console.error("Error tracking activity:", error);
    // Silently fail - don't interrupt user experience
  }
};

/**
 * Get user activities
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of activities to fetch
 */
export const getUserActivities = async (userId, limit = 50) => {
  try {
    const response = await fetch(
      `${API_URL}/api/activity/${userId}?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch activities");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching activities:", error);
    return { activities: [], preferences: {} };
  }
};

/**
 * Get user activity statistics
 * @param {string} userId - User ID
 */
export const getUserStats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/api/activity-stats/${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      totalViews: 0,
      totalSearches: 0,
      totalSelections: 0,
      favoriteCategories: {},
    };
  }
};
