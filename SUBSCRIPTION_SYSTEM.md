# Bloomify 2-Tier Subscription System

## Overview

The Bloomify subscription system provides a freemium model with two tiers:
- **Beginner (Free)**: 10 Space Analysis uses per month
- **Advanced (Premium)**: $10/month with unlimited Space Analysis access

## System Architecture

### Backend Components

#### 1. **Subscription Module** (`Backend/subscription.js`)
Core subscription management logic:

```javascript
// Key Functions:
- getOrCreateUser(email)           // Initialize or fetch user subscription
- canUseSpaceAnalysis(email)        // Check if user can analyze space
- deductSpaceAnalysisUse(email)     // Subtract a trial use
- upgradeToAdvanced(email, stripeId) // Upgrade user to premium
- getUserSubscription(email)        // Get full subscription details
```

**User Schema (MongoDB)**:
```javascript
{
  email: String,
  tier: "Beginner" | "Advanced",
  subscriptionStatus: "trial" | "active" | "inactive",
  trialUsesRemaining: Number,
  trialStartDate: Date,
  trialResetDate: Date,               // Monthly reset
  subscriptionEndDate: Date,          // Premium expiry date
  spaceAnalysisUsageCount: Number,
  stripeCustomerId: String,
  createdAt: Date
}
```

#### 2. **Backend Endpoints** (`Backend/server.js`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/subscription/:email` | GET | Fetch user subscription status |
| `/check-space-analysis-access/:email` | GET | Check if user can analyze space |
| `/record-space-analysis-use/:email` | POST | Record space analysis usage |
| `/create-checkout-session` | POST | Create Stripe checkout session |
| `/analyze-space` | POST | Analyze space (now with subscription check) |

#### 3. **Subscription Check in Image Analysis**
The `/analyze-space` endpoint now:
1. Requires `email` in request body
2. Checks user subscription before processing
3. Deducts trial use if Beginner tier
4. Returns 403 error if trial exhausted

### Frontend Components

#### 1. **PricingPlans.jsx** (`/pricing` route)
- Displays pricing tiers
- Shows current subscription status
- Handles upgrade to Premium tier
- Shows trial uses remaining
- FAQ section with subscription info

**Features**:
- Real-time subscription status fetching
- One-click upgrade button
- Trial reset date display
- Features comparison

#### 2. **UpgradeModal.jsx**
- Modal dialog showing when user exhausts trial uses
- Displays upgrade benefits
- Links to pricing page
- Shows trial limit info and reset date

#### 3. **Modified SpacePhotoAnalysis.jsx**
- Displays subscription status banner
- Checks access before allowing analysis
- Shows trial uses remaining
- Prompts upgrade when limit reached
- Auto-refreshes subscription after use

#### 4. **App.jsx**
- New route added: `/pricing` → PricingPlans component

## User Flow

### Trial User (Beginner Tier)
1. User signs up → Creates account with Beginner tier
2. Gets 10 free Space Analysis uses per month
3. Accesses `/space-analysis`
4. Banner shows: "10/10 uses remaining"
5. Clicks "Analyze Space" → Sends request
6. Subscription check passes → Analysis proceeds
7. Uses decremented to "9/10"
8. After 10 uses → Modal shows "Upgrade Now"
9. Clicks "Upgrade Now" → Redirected to `/pricing`

### Upgrade Flow
1. User clicks upgrade button
2. Backend creates Stripe checkout session (currently mocked)
3. On successful payment:
   - Tier changes to "Advanced"
   - Subscription status becomes "active"
   - Subscription end date set to 30 days from now
   - Can now use Space Analysis unlimited times

### Premium User (Advanced Tier)
1. Can access Space Analysis unlimited times
2. No restrictions on usage
3. Still sees "Premium Subscriber" status
4. Premium features available

### Monthly Trial Reset
- Every month, Beginner users get fresh 10 uses
- Reset happens automatically when accessing subscription
- No manual intervention needed

## Implementation Details

### Trial Deduction Logic
```javascript
// File: Backend/server.js - /analyze-space endpoint
if (accessStatus.tier === "Beginner") {
  await subscription.deductSpaceAnalysisUse(email);
}
// Decrements trialUsesRemaining by 1
// Increments spaceAnalysisUsageCount by 1
```

### Monthly Reset Logic
```javascript
// File: Backend/subscription.js - getOrCreateUser()
const now = new Date();
if (user.trialResetDate && now >= user.trialResetDate) {
  // Reset trial for next month
  await usersCollection.updateOne({ email }, {
    $set: {
      trialUsesRemaining: 5,
      trialResetDate: getNextMonthDate(now)
    }
  });
}
```

### Subscription Expiration Check
```javascript
// File: Backend/subscription.js - getOrCreateUser()
if (user.subscriptionStatus === "active" && now >= user.subscriptionEndDate) {
  // Subscription expired, downgrade to Beginner
  await usersCollection.updateOne({ email }, {
    $set: {
      tier: "Beginner",
      subscriptionStatus: "trial",
      trialUsesRemaining: 5,
      subscriptionEndDate: null
    }
  });
}
```

## API Response Examples

### Check Access (Successful)
```json
{
  "allowed": true,
  "reason": "Trial uses available",
  "tier": "Beginner",
  "usesRemaining": 3
}
```

### Check Access (Trial Exhausted)
```json
{
  "allowed": false,
  "reason": "trial_exhausted",
  "tier": "Beginner",
  "usesRemaining": 0,
  "resetDate": "2024-02-15T10:30:00.000Z",
  "upgradeLink": "/pricing"
}
```

### Get Subscription Status
```json
{
  "email": "user@example.com",
  "tier": "Beginner",
  "subscriptionStatus": "trial",
  "spaceAnalysisUsageCount": 3,
  "trialUsesRemaining": 2,
  "trialResetDate": "2024-02-15T10:30:00.000Z",
  "subscriptionEndDate": null,
  "daysUntilReset": 7,
  "canAccessSpaceAnalysis": true
}
```

## Configuration

### Backend Constants (`Backend/subscription.js`)
```javascript
const TRIAL_USES_LIMIT = 10;          // Free uses per month
const SUBSCRIPTION_PRICE = 10;        // Premium price in USD
const MONGODB_URL = "mongodb://0.0.0.0:27017";
const DB_NAME = "tinder";
```

### Stripe Integration (TODO)
Currently, upgrade creates a mock Stripe customer ID. To enable real payments:

1. Install Stripe: `npm install stripe`
2. Add Stripe API key to `.env`
3. Implement checkout session creation in `server.js`
4. Set up webhook for payment confirmation

## Testing the System

### Test Beginner Trial
```bash
# 1. Sign up new account
# 2. Visit /space-analysis
# 3. Notice "10/10 uses remaining"
# 4. Upload 10 images (or switch to manual mode)
# 5. After 10 uses, try to analyze → Shows upgrade modal
```

### Test Upgrade Flow
```bash
# 1. With trial exhausted account
# 2. Click "Upgrade Now" button
# 3. Redirected to /pricing page
# 4. Click "Upgrade Now" button
# 5. Subscription updated in database
# 6. Can now use Space Analysis unlimited times
```

### Test Monthly Reset
```bash
# 1. Manually update trialResetDate to past date in MongoDB
# 2. Refresh subscription status
# 3. trialUsesRemaining should reset to 10
```

## Future Enhancements

1. **Real Stripe Integration**
   - Connect to Stripe API
   - Implement checkout flow
   - Handle webhooks for payment confirmation

2. **Subscription Management**
   - Cancel subscription
   - Change billing cycle
   - Manage payment methods
   - Download invoices

3. **Analytics**
   - Track usage patterns
   - Generate reports
   - Identify power users

4. **Promotional Features**
   - Coupon codes
   - Referral bonuses
   - Trial extensions

5. **Multiple Tiers**
   - Add "Pro" tier at $20/month
   - Advanced features per tier
   - Granular permission system

## Support

For issues or questions about the subscription system:
1. Check MongoDB "users" collection
2. Verify subscription status with GET `/subscription/{email}`
3. Review backend logs for API errors
4. Check browser console for frontend errors

## File References

- Backend: [subscription.js](Backend/subscription.js)
- Backend: [server.js](Backend/server.js#L400-L500) (subscription endpoints)
- Frontend: [PricingPlans.jsx](Frontend/my-app/src/components/PricingPlans.jsx)
- Frontend: [UpgradeModal.jsx](Frontend/my-app/src/components/UpgradeModal.jsx)
- Frontend: [SpacePhotoAnalysis.jsx](Frontend/my-app/src/components/SpacePhotoAnalysis.jsx) (modified)
- Route: [App.jsx](Frontend/my-app/src/App.jsx) (/pricing route)
