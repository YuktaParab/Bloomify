const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://0.0.0.0:27017";
const DB_NAME = "tinder";
const USERS_COLLECTION = "users";
const TRIAL_USES_LIMIT = 10; // Free tier limit per month
const SUBSCRIPTION_PRICE = 10; // $10/month

/**
 * Initialize or get user subscription data
 */
async function getOrCreateUser(email) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    let user = await usersCollection.findOne({ email });

    if (!user) {
      // Create new user with Beginner tier (free trial)
      const newUser = {
        email,
        tier: "Beginner", // "Beginner" or "Advanced"
        subscriptionStatus: "trial", // "trial", "active", "inactive"
        trialUsesRemaining: TRIAL_USES_LIMIT,
        trialStartDate: new Date(),
        trialResetDate: getNextMonthDate(new Date()),
        subscriptionEndDate: null,
        spaceAnalysisUsageCount: 0,
        stripeCustomerId: null,
        createdAt: new Date()
      };

      await usersCollection.insertOne(newUser);
      user = newUser;
    } else {
      // Check if trial needs reset (monthly reset)
      const now = new Date();
      if (user.trialResetDate && now >= user.trialResetDate && user.subscriptionStatus === "trial") {
        // Reset trial for next month
        await usersCollection.updateOne(
          { email },
          {
            $set: {
              trialUsesRemaining: TRIAL_USES_LIMIT,
              trialResetDate: getNextMonthDate(now)
            }
          }
        );
        user.trialUsesRemaining = TRIAL_USES_LIMIT;
        user.trialResetDate = getNextMonthDate(now);
      }

      // Check if subscription expired
      if (user.subscriptionStatus === "active" && user.subscriptionEndDate) {
        if (now >= user.subscriptionEndDate) {
          // Subscription expired, downgrade to Beginner trial
          await usersCollection.updateOne(
            { email },
            {
              $set: {
                tier: "Beginner",
                subscriptionStatus: "trial",
                trialUsesRemaining: TRIAL_USES_LIMIT,
                trialResetDate: getNextMonthDate(now),
                subscriptionEndDate: null
              }
            }
          );
          user.tier = "Beginner";
          user.subscriptionStatus = "trial";
        }
      }
    }

    return user;
  } finally {
    await client.close();
  }
}

/**
 * Track space analysis usage and check if user can proceed
 */
async function canUseSpaceAnalysis(email) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const user = await getOrCreateUser(email);

    // Advanced tier (paid subscription) has unlimited access
    if (user.tier === "Advanced" && user.subscriptionStatus === "active") {
      return {
        allowed: true,
        reason: "Premium subscriber",
        tier: "Advanced",
        usesRemaining: null
      };
    }

    // Beginner tier (free trial) - limited uses
    if (user.tier === "Beginner") {
      if (user.trialUsesRemaining > 0) {
        return {
          allowed: true,
          reason: "Trial uses available",
          tier: "Beginner",
          usesRemaining: user.trialUsesRemaining
        };
      } else {
        return {
          allowed: false,
          reason: "trial_exhausted",
          tier: "Beginner",
          usesRemaining: 0,
          resetDate: user.trialResetDate,
          upgradeLink: "/pricing"
        };
      }
    }

    return {
      allowed: false,
      reason: "invalid_status",
      tier: user.tier
    };
  } finally {
    await client.close();
  }
}

/**
 * Deduct one trial use from user
 */
async function deductSpaceAnalysisUse(email) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const result = await usersCollection.updateOne(
      { email, tier: "Beginner", subscriptionStatus: "trial" },
      {
        $inc: {
          trialUsesRemaining: -1,
          spaceAnalysisUsageCount: 1
        }
      }
    );

    return result.modifiedCount > 0;
  } finally {
    await client.close();
  }
}

/**
 * Upgrade user to Advanced tier (after Stripe payment)
 */
async function upgradeToAdvanced(email, stripeCustomerId, subscriptionDurationMonths = 1) {
  const client = new MongoClient(MONGODB_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection(USERS_COLLECTION);

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + subscriptionDurationMonths);

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          tier: "Advanced",
          subscriptionStatus: "active",
          stripeCustomerId,
          subscriptionEndDate,
          subscriptionUpgradedAt: new Date()
        }
      },
      { upsert: true }
    );

    return { success: true, message: "Upgraded to Advanced tier" };
  } finally {
    await client.close();
  }
}

/**
 * Get user subscription details
 */
async function getUserSubscription(email) {
  try {
    const user = await getOrCreateUser(email);

    const now = new Date();
    const daysUntilReset = Math.ceil((user.trialResetDate - now) / (1000 * 60 * 60 * 24));

    return {
      email: user.email,
      tier: user.tier,
      subscriptionStatus: user.subscriptionStatus,
      spaceAnalysisUsageCount: user.spaceAnalysisUsageCount,
      trialUsesRemaining: user.trialUsesRemaining,
      trialResetDate: user.trialResetDate,
      subscriptionEndDate: user.subscriptionEndDate,
      daysUntilReset: daysUntilReset > 0 ? daysUntilReset : 0,
      canAccessSpaceAnalysis: user.tier === "Advanced" || user.trialUsesRemaining > 0
    };
  } catch (error) {
    console.error("Error in getUserSubscription:", error);
    throw error; // Re-throw so the caller can handle it
  }
}

/**
 * Helper: Get next month date for trial reset
 */
function getNextMonthDate(date) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}

module.exports = {
  getOrCreateUser,
  canUseSpaceAnalysis,
  deductSpaceAnalysisUse,
  upgradeToAdvanced,
  getUserSubscription,
  TRIAL_USES_LIMIT,
  SUBSCRIPTION_PRICE
};
