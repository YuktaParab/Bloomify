/**
 * Points System Helper Utilities
 * 
 * Use these functions to integrate points tracking into your components.
 * 
 * Example:
 * ```javascript
 * import { awardPoints } from '../utils/pointsHelper';
 * 
 * // In your component
 * if (auth.currentUser?.uid) {
 *   await awardPoints(auth.currentUser.uid, 'plant_view', {
 *     plantId: '123',
 *     plantName: 'Tomato'
 *   });
 * }
 * ```
 */

/**
 * Award points to a user for an activity
 * @param {string} userId - Firebase user ID
 * @param {string} activityType - Type of activity (plant_view, search, etc.)
 * @param {object} additionalData - Optional metadata about the activity
 * @returns {Promise<object|null>} Result object with points info or null on error
 */
export const awardPoints = async (userId, activityType, additionalData = {}) => {
  if (!userId) {
    console.warn('❌ No userId provided for points award');
    return null;
  }

  try {
    const response = await fetch('http://localhost:3000/api/points/award', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        activityType,
        additionalData,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error awarding points:', error);
      return null;
    }

    const result = await response.json();

    // Log success
    console.log(
      `✅ +${result.pointsAwarded} points for ${activityType} | Total: ${result.totalPoints}`
    );

    // Show level-up message if user just reached Intermediate
    if (result.levelUpMessage) {
      console.log('🎉 ' + result.levelUpMessage);
      // You can dispatch toast notification here
      // toast.success(result.levelUpMessage);
    }

    return result;
  } catch (error) {
    console.error('❌ Error awarding points:', error);
    // Don't break user experience if points system fails
    return null;
  }
};

/**
 * Initialize a user in the points system
 * @param {string} userId - Firebase user ID
 * @returns {Promise<object|null>} User object or null on error
 */
export const initializeUserPoints = async (userId) => {
  if (!userId) return null;

  try {
    const response = await fetch(
      `http://localhost:3000/api/points/init/${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) throw new Error('Failed to initialize user');

    const result = await response.json();
    console.log('✅ User initialized in points system');
    return result.user;
  } catch (error) {
    console.error('❌ Error initializing user:', error);
    return null;
  }
};

/**
 * Fetch user profile with points and status
 * @param {string} userId - Firebase user ID
 * @returns {Promise<object|null>} User profile object or null on error
 */
export const fetchUserProfile = async (userId) => {
  if (!userId) return null;

  try {
    const response = await fetch(
      `http://localhost:3000/api/points/profile/${userId}`
    );

    if (!response.ok) throw new Error('Failed to fetch profile');

    const profile = await response.json();
    console.log('✅ User profile fetched');
    return profile;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return null;
  }
};

/**
 * Fetch pathway to intermediate status with activity suggestions
 * @param {string} userId - Firebase user ID
 * @returns {Promise<object|null>} Pathway object with suggestions or null on error
 */
export const fetchPathway = async (userId) => {
  if (!userId) return null;

  try {
    const response = await fetch(
      `http://localhost:3000/api/points/pathway/${userId}`
    );

    if (!response.ok) throw new Error('Failed to fetch pathway');

    const pathway = await response.json();
    console.log('✅ Pathway fetched');
    return pathway;
  } catch (error) {
    console.error('❌ Error fetching pathway:', error);
    return null;
  }
};

/**
 * Fetch leaderboard of top users
 * @param {number} limit - Number of top users to fetch (default: 10)
 * @returns {Promise<array|null>} Array of user rankings or null on error
 */
export const fetchLeaderboard = async (limit = 10) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/points/leaderboard?limit=${limit}`
    );

    if (!response.ok) throw new Error('Failed to fetch leaderboard');

    const data = await response.json();
    console.log('✅ Leaderboard fetched');
    return data.leaderboard;
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    return null;
  }
};

/**
 * Get formatted level status text
 * @param {boolean} isIntermediate - Whether user is intermediate
 * @param {number} totalPoints - User's total points
 * @returns {string} Formatted status text with emoji
 */
export const getLevelStatus = (isIntermediate, totalPoints) => {
  if (isIntermediate) {
    return `🌿 INTERMEDIATE (${totalPoints} points)`;
  }
  return `👶 BEGINNER (${totalPoints} points)`;
};

/**
 * Format points for display
 * @param {number} points - Points to format
 * @returns {string} Formatted points string
 */
export const formatPoints = (points) => {
  if (points >= 1000) {
    return `${(points / 1000).toFixed(1)}k`;
  }
  return points.toString();
};

/**
 * Get progress percentage for progress bar
 * @param {number} currentPoints - Current points
 * @param {number} targetPoints - Target points (usually 300)
 * @returns {number} Percentage 0-100
 */
export const getProgressPercentage = (currentPoints, targetPoints = 300) => {
  return Math.min(100, Math.round((currentPoints / targetPoints) * 100));
};

/**
 * Get activity icon by type
 * @param {string} activityType - Type of activity
 * @returns {string} Unicode emoji or icon
 */
export const getActivityIcon = (activityType) => {
  const iconMap = {
    plant_view: '👁️',
    search: '🔍',
    plant_select: '🌱',
    post_created: '💬',
    care_guide_read: '📖',
    growth_guide_read: '📈',
    listing_created: '🛍️',
    product_purchase: '🛒',
    space_analysis: '📸',
    community_interaction: '🍃',
  };
  return iconMap[activityType] || '⚡';
};

/**
 * Format activity type for display
 * @param {string} activityType - Raw activity type
 * @returns {string} Formatted activity name
 */
export const formatActivityType = (activityType) => {
  const nameMap = {
    plant_view: 'Viewed Plant',
    search: 'Performed Search',
    plant_select: 'Selected Plant',
    post_created: 'Created Post',
    care_guide_read: 'Read Care Guide',
    growth_guide_read: 'Read Growth Guide',
    listing_created: 'Created Listing',
    product_purchase: 'Made Purchase',
    space_analysis: 'Analyzed Space',
    community_interaction: 'Interacted with Community',
  };
  return nameMap[activityType] || activityType;
};

/**
 * Get activity point value
 * @param {string} activityType - Type of activity
 * @returns {number} Points awarded for activity
 */
export const getActivityPoints = (activityType) => {
  const pointMap = {
    plant_view: 5,
    search: 10,
    plant_select: 15,
    post_created: 20,
    care_guide_read: 8,
    growth_guide_read: 8,
    listing_created: 25,
    product_purchase: 30,
    space_analysis: 12,
    community_interaction: 10,
  };
  return pointMap[activityType] || 0;
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'Unknown';

  const dateObj = new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Debounce function to prevent multiple rapid calls
 * Useful for preventing duplicate point awards
 * 
 * Example:
 * ```javascript
 * const debouncedAward = debounce((userId) => {
 *   awardPoints(userId, 'plant_view');
 * }, 1000);
 * 
 * // Call it multiple times, but only executes once after 1 second of silence
 * debouncedAward(userId);
 * debouncedAward(userId);
 * ```
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Show toast notification (if you have a toast library)
 * Falls back to console.log if no toast library is available
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'info', 'warning'
 */
export const showNotification = (message, type = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`);

  // Uncomment if you have a toast library like react-toastify
  // import { toast } from 'react-toastify';
  // toast[type](message);

  // Or for react-hot-toast
  // import toast from 'react-hot-toast';
  // toast[type](message);
};

/**
 * Validate activity type before awarding points
 * @param {string} activityType - Activity type to validate
 * @returns {boolean} Whether activity type is valid
 */
export const isValidActivityType = (activityType) => {
  const validTypes = [
    'plant_view',
    'search',
    'plant_select',
    'post_created',
    'care_guide_read',
    'growth_guide_read',
    'listing_created',
    'product_purchase',
    'space_analysis',
    'community_interaction',
  ];
  return validTypes.includes(activityType);
};

// Export all activity types for easy reference
export const ACTIVITY_TYPES = {
  PLANT_VIEW: 'plant_view',
  SEARCH: 'search',
  PLANT_SELECT: 'plant_select',
  POST_CREATED: 'post_created',
  CARE_GUIDE_READ: 'care_guide_read',
  GROWTH_GUIDE_READ: 'growth_guide_read',
  LISTING_CREATED: 'listing_created',
  PRODUCT_PURCHASE: 'product_purchase',
  SPACE_ANALYSIS: 'space_analysis',
  COMMUNITY_INTERACTION: 'community_interaction',
};

// Export thresholds
export const THRESHOLDS = {
  INTERMEDIATE: 300,
  BEGINNER: 0,
};

export default {
  awardPoints,
  initializeUserPoints,
  fetchUserProfile,
  fetchPathway,
  fetchLeaderboard,
  getLevelStatus,
  formatPoints,
  getProgressPercentage,
  getActivityIcon,
  formatActivityType,
  getActivityPoints,
  formatDate,
  debounce,
  showNotification,
  isValidActivityType,
  ACTIVITY_TYPES,
  THRESHOLDS,
};
