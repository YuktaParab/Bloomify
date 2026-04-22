/**
 * Points System Module
 * Handles user activity points and intermediate status tracking
 */

const { MongoClient } = require("mongodb");

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://0.0.0.0:27017";
const DB_NAME = "bloomify";
const USERS_COLLECTION = "users";

// Point values for different activities
const POINT_VALUES = {
  plant_view: 5,           // Viewing a plant
  search: 10,              // Searching for plants
  plant_select: 15,        // Selecting a plant for recommendations
  post_created: 20,        // Creating a community post
  care_guide_read: 8,      // Reading care guide
  growth_guide_read: 8,    // Reading growth guide
  listing_created: 25,     // Creating a seller listing
  product_purchase: 30,    // Making a purchase
  space_analysis: 12,      // Using space analysis feature
  community_interaction: 10 // Liking/commenting on posts
};

const INTERMEDIATE_THRESHOLD = 300;
const BEGINNER_THRESHOLD = 0;

/**
 * Award points to a user for an activity
 * @param {string} userId - User ID
 * @param {string} activityType - Type of activity
 * @param {object} additionalData - Additional data about the activity
 */
async function awardPoints(userId, activityType, additionalData = {}) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const points = POINT_VALUES[activityType] || 0;

    if (points === 0) {
      console.log(`Unknown activity type: ${activityType}`);
      return null;
    }

    // Update user with new points
    const result = await usersCollection.findOneAndUpdate(
      { userId },
      {
        $inc: { totalPoints: points },
        $push: {
          pointHistory: {
            activityType,
            points,
            timestamp: new Date(),
            ...additionalData
          }
        },
        $set: { lastActivityDate: new Date() }
      },
      { returnDocument: "after", upsert: true }
    );

    // Check if user reached intermediate status
    const updatedUser = result.value;
    if (updatedUser.totalPoints >= INTERMEDIATE_THRESHOLD && !updatedUser.isIntermediate) {
      await usersCollection.updateOne(
        { userId },
        {
          $set: {
            isIntermediate: true,
            intermediateAchievedDate: new Date()
          }
        }
      );
      updatedUser.isIntermediate = true;
      updatedUser.intermediateAchievedDate = new Date();
    }

    return {
      success: true,
      pointsAwarded: points,
      totalPoints: updatedUser.totalPoints,
      isIntermediate: updatedUser.isIntermediate,
      levelUpMessage: updatedUser.totalPoints >= INTERMEDIATE_THRESHOLD && !updatedUser.isIntermediate 
        ? "🎉 Congratulations! You've reached INTERMEDIATE status!"
        : null
    };
  } catch (error) {
    console.error("Error awarding points:", error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Get user profile with points and status
 * @param {string} userId - User ID
 */
async function getUserProfile(userId) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    let user = await usersCollection.findOne({ userId });

    if (!user) {
      // Create new user with initialized points
      const newUser = {
        userId,
        totalPoints: 0,
        isIntermediate: false,
        createdAt: new Date(),
        lastActivityDate: null,
        pointHistory: [],
        intermediateAchievedDate: null
      };
      await usersCollection.insertOne(newUser);
      user = newUser;
    }

    // Calculate progress to intermediate
    const pointsToIntermediate = Math.max(0, INTERMEDIATE_THRESHOLD - user.totalPoints);
    const progressPercentage = Math.min(100, Math.round((user.totalPoints / INTERMEDIATE_THRESHOLD) * 100));

    // Calculate estimated days to intermediate based on average daily points
    const estimatedDaysToIntermediate = calculateEstimatedDaysToIntermediate(user);

    return {
      userId,
      totalPoints: user.totalPoints || 0,
      isIntermediate: user.isIntermediate || false,
      intermediateAchievedDate: user.intermediateAchievedDate || null,
      createdAt: user.createdAt,
      lastActivityDate: user.lastActivityDate,
      progress: {
        current: user.totalPoints || 0,
        target: INTERMEDIATE_THRESHOLD,
        remaining: pointsToIntermediate,
        percentage: progressPercentage
      },
      estimatedDaysToIntermediate,
      recentActivities: (user.pointHistory || []).slice(-10),
      levelStatus: user.isIntermediate ? "🌿 INTERMEDIATE" : "👶 BEGINNER",
      nextMilestone: INTERMEDIATE_THRESHOLD
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Calculate estimated days to intermediate based on activity history
 */
function calculateEstimatedDaysToIntermediate(user) {
  if (!user.pointHistory || user.pointHistory.length === 0) {
    return "Unknown (Start earning points!)";
  }

  if (user.isIntermediate) {
    return "✅ Already Intermediate!";
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentActivities = (user.pointHistory || []).filter(
    activity => new Date(activity.timestamp) > thirtyDaysAgo
  );

  if (recentActivities.length === 0) {
    return "30+ days (based on no recent activity)";
  }

  const totalRecentPoints = recentActivities.reduce((sum, activity) => sum + activity.points, 0);
  const daysOfActivity = new Set(
    recentActivities.map(activity => 
      new Date(activity.timestamp).toDateString()
    )
  ).size;

  const avgPointsPerDay = totalRecentPoints / daysOfActivity;
  const pointsRemaining = INTERMEDIATE_THRESHOLD - (user.totalPoints || 0);
  const estimatedDays = Math.ceil(pointsRemaining / avgPointsPerDay);

  return estimatedDays <= 0 ? "Very soon!" : `~${estimatedDays} days`;
}

/**
 * Get pathway to intermediate - suggestions for earning points
 */
function getPathwayToIntermediate(userTotalPoints) {
  const pointsRemaining = INTERMEDIATE_THRESHOLD - userTotalPoints;
  
  const activities = [
    {
      activity: "View plants (5 points each)",
      points: 5,
      icon: "👁️",
      description: "Browse through our plant catalog"
    },
    {
      activity: "Read care guides (8 points each)",
      points: 8,
      icon: "📖",
      description: "Learn how to care for different plants"
    },
    {
      activity: "Read growth guides (8 points each)",
      points: 8,
      icon: "📈",
      description: "Understand plant growth patterns"
    },
    {
      activity: "Search for plants (10 points each)",
      points: 10,
      icon: "🔍",
      description: "Search for specific plants or categories"
    },
    {
      activity: "Analyze your space (12 points each)",
      points: 12,
      icon: "📸",
      description: "Use AI to get plant recommendations for your space"
    },
    {
      activity: "Select plants for recommendations (15 points each)",
      points: 15,
      icon: "🌱",
      description: "Add plants to your personalized recommendations"
    },
    {
      activity: "Create community posts (20 points each)",
      points: 20,
      icon: "💬",
      description: "Share your gardening experiences"
    },
    {
      activity: "Create seller listings (25 points each)",
      points: 25,
      icon: "🛍️",
      description: "Sell plants or gardening products"
    },
    {
      activity: "Make purchases (30 points each)",
      points: 30,
      icon: "🛒",
      description: "Buy plants or products from sellers"
    }
  ];

  // Sort by points to show quickest ways first
  const sorted = [...activities].sort((a, b) => b.points - a.points);

  // Calculate how many of each activity would get you to intermediate
  const suggestions = sorted.map(activity => ({
    ...activity,
    countNeeded: Math.ceil(pointsRemaining / activity.points),
    totalPointsFromThis: Math.min(activity.points * Math.ceil(pointsRemaining / activity.points), pointsRemaining)
  }));

  return {
    pointsRemaining,
    targetPoints: INTERMEDIATE_THRESHOLD,
    suggestions,
    motivationalMessage: pointsRemaining === 0 
      ? "🎉 You're at Intermediate level!" 
      : `You're ${pointsRemaining} points away from reaching Intermediate status! 💪`
  };
}

/**
 * Get all user ranks (for leaderboard)
 */
async function getLeaderboard(limit = 10) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const leaderboard = await usersCollection
      .find({})
      .sort({ totalPoints: -1 })
      .limit(limit)
      .toArray();

    return leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      totalPoints: user.totalPoints || 0,
      isIntermediate: user.isIntermediate || false,
      lastActivityDate: user.lastActivityDate
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  } finally {
    await client.close();
  }
}

/**
 * Initialize user in points system
 */
async function initializeUser(userId) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const existingUser = await usersCollection.findOne({ userId });

    if (!existingUser) {
      const newUser = {
        userId,
        totalPoints: 0,
        isIntermediate: false,
        createdAt: new Date(),
        lastActivityDate: null,
        pointHistory: [],
        intermediateAchievedDate: null
      };
      await usersCollection.insertOne(newUser);
      return newUser;
    }

    return existingUser;
  } catch (error) {
    console.error("Error initializing user:", error);
    throw error;
  } finally {
    await client.close();
  }
}

module.exports = {
  awardPoints,
  getUserProfile,
  getPathwayToIntermediate,
  getLeaderboard,
  initializeUser,
  POINT_VALUES,
  INTERMEDIATE_THRESHOLD,
  BEGINNER_THRESHOLD
};
