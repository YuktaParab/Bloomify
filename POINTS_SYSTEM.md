# Points & Intermediate Status System - Implementation Guide

## Overview
The Points System tracks user activity and awards points based on engagement with various features of the Bloomify application. When users accumulate 300 points, they achieve **Intermediate** status, unlocking additional benefits and recognition.

---

## Architecture

### Backend Components

#### 1. **points.js** - Core Points Module
Located at: `Backend/points.js`

**Key Functions:**

- `awardPoints(userId, activityType, additionalData)`
  - Awards points for a specific activity
  - Automatically promotes user to Intermediate when threshold is reached
  - Returns points awarded and new total

- `getUserProfile(userId)`
  - Fetches complete user profile with points data
  - Returns progress towards Intermediate
  - Includes estimated days to achievement
  - Shows recent activity history

- `getPathwayToIntermediate(userTotalPoints)`
  - Returns suggestions for earning points
  - Shows which activities give the most points
  - Provides motivational messages

- `getLeaderboard(limit)`
  - Returns top users by points
  - Great for community engagement

- `initializeUser(userId)`
  - Creates a new user in the points system
  - Called automatically on first profile fetch

**Point Values:**
```javascript
plant_view: 5              // View a plant
search: 10                 // Search for plants
plant_select: 15           // Select plant for recommendations
post_created: 20           // Create community post
care_guide_read: 8         // Read care guide
growth_guide_read: 8       // Read growth guide
listing_created: 25        // Create seller listing
product_purchase: 30       // Make a purchase
space_analysis: 12         // Use space analysis
community_interaction: 10  // Like/comment on posts
```

**Thresholds:**
- **Beginner**: 0 - 299 points 👶
- **Intermediate**: 300+ points 🌿

#### 2. **Backend API Endpoints** (in index.js)

**POST** `/api/points/award`
```json
Request: {
  "userId": "user123",
  "activityType": "plant_view",
  "additionalData": { "plantName": "Tomato" }
}
Response: {
  "success": true,
  "pointsAwarded": 5,
  "totalPoints": 45,
  "isIntermediate": false,
  "levelUpMessage": null
}
```

**GET** `/api/points/profile/:userId`
```json
Response: {
  "userId": "user123",
  "totalPoints": 250,
  "isIntermediate": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "lastActivityDate": "2024-01-20T14:22:00Z",
  "progress": {
    "current": 250,
    "target": 300,
    "remaining": 50,
    "percentage": 83
  },
  "estimatedDaysToIntermediate": "~2 days",
  "recentActivities": [...],
  "levelStatus": "👶 BEGINNER",
  "nextMilestone": 300
}
```

**GET** `/api/points/pathway/:userId`
```json
Response: {
  "pointsRemaining": 50,
  "targetPoints": 300,
  "suggestions": [
    {
      "activity": "Make purchases (30 points each)",
      "points": 30,
      "icon": "🛒",
      "description": "Buy plants or products from sellers",
      "countNeeded": 2,
      "totalPointsFromThis": 60
    },
    ...
  ],
  "motivationalMessage": "You're 50 points away from Intermediate status! 💪"
}
```

**GET** `/api/points/leaderboard?limit=10`
```json
Response: {
  "leaderboard": [
    { "rank": 1, "userId": "user001", "totalPoints": 850, "isIntermediate": true },
    { "rank": 2, "userId": "user002", "totalPoints": 720, "isIntermediate": true },
    ...
  ]
}
```

**POST** `/api/points/init/:userId`
- Initializes a new user in the points system

---

### Frontend Components

#### UserProfile.jsx - Enhanced Profile Display

**Features:**

1. **Tab Navigation**
   - Overview: Basic profile info + quick points summary
   - Points: Detailed points progress and activity reference
   - Pathway: Step-by-step guide to reach Intermediate
   - Recent: Recent activities and points earned

2. **Points Display**
   - Current points count
   - Progress bar to Intermediate (0-300)
   - Percentage completion
   - Estimated days to achievement

3. **Status Badge**
   - Shows current level (👶 BEGINNER or 🌿 INTERMEDIATE)
   - Special styling for Intermediate users

4. **Activity Reference**
   - Shows all activity types and their point values
   - Icon for each activity type
   - Sortable by points

5. **Recent Activities List**
   - Shows last 10 activities
   - Timestamp for each
   - Points awarded for each

---

## How to Integrate Points into Your Features

### Example: Award Points When User Views a Plant

**In Frontend Component:**
```javascript
const handleViewPlant = async (plantId) => {
  // Your existing view logic
  
  // Award points
  if (user?.uid) {
    try {
      const response = await fetch('http://localhost:3000/api/points/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          activityType: 'plant_view',
          additionalData: { plantId, plantName: 'Tomato Plant' }
        })
      });
      const result = await response.json();
      console.log(`+${result.pointsAwarded} points!`);
      if (result.levelUpMessage) alert(result.levelUpMessage);
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  }
};
```

### Example: Track Search Activity

```javascript
const handleSearch = async (searchTerm) => {
  // Your search logic
  
  // Award points
  await fetch('http://localhost:3000/api/points/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.uid,
      activityType: 'search',
      additionalData: { searchTerm }
    })
  });
};
```

### Example: Track Purchase

```javascript
const handlePurchaseComplete = async (orderId) => {
  // Your purchase logic
  
  // Award significant points for purchase
  await fetch('http://localhost:3000/api/points/award', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.uid,
      activityType: 'product_purchase',
      additionalData: { orderId }
    })
  });
};
```

---

## Database Schema

### Users Collection (MongoDB)
```javascript
{
  userId: "firebase-uid",
  totalPoints: 250,
  isIntermediate: false,
  intermediateAchievedDate: null,
  createdAt: ISODate("2024-01-15"),
  lastActivityDate: ISODate("2024-01-20"),
  pointHistory: [
    {
      activityType: "plant_view",
      points: 5,
      timestamp: ISODate("2024-01-20T14:22:00Z"),
      plantId: "123",
      plantName: "Tomato"
    },
    ...
  ]
}
```

---

## Features Explained

### 1. Progress Tracking
- Real-time calculation of points to next level
- Percentage-based progress bar (0-100%)
- Visual feedback on achievement

### 2. Estimated Time to Achievement
Calculated based on past 30 days of activity:
- Counts unique days of activity
- Calculates average points per day
- Estimates days needed to reach 300 points
- Updates as user earns more points

### 3. Pathway to Intermediate
Shows:
- Which activities give the most points
- How many of each activity needed to reach Intermediate
- Sorted by efficiency (points per activity)
- Motivational messages

### 4. Activity History
- Last 10 recent activities
- Timestamp for each
- Points earned for each
- Activity icons for visual recognition

### 5. Leaderboard
- Top 10 users by points (customizable)
- Rank, points, and status
- Encourages community engagement

---

## Gamification Elements

### Benefits of Intermediate Status:
1. **Recognition**: Visual badge in profile
2. **Community**: Appears on leaderboards
3. **Future Enhancements**:
   - Exclusive features for Intermediate users
   - Special plant recommendations
   - Advanced analytics
   - Priority seller status

---

## Future Enhancements

1. **Advanced Tier** (600+ points)
2. **Achievement Badges** for specific milestones
3. **Daily Streaks** for consistent activity
4. **Seasonal Competitions** with rewards
5. **referral bonus** points
6. **Social Sharing** points
7. **Weekly Challenges** to earn bonus points
8. **Level-based Unlocks** - new features at each level

---

## Testing Points System

### Test Case 1: Award Points
```bash
curl -X POST http://localhost:3000/api/points/award \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "activityType": "plant_view",
    "additionalData": { "plantName": "Rose" }
  }'
```

### Test Case 2: Get User Profile
```bash
curl http://localhost:3000/api/points/profile/test-user-123
```

### Test Case 3: Get Pathway
```bash
curl http://localhost:3000/api/points/pathway/test-user-123
```

---

## Performance Considerations

1. **Database Indexing**: Index on `userId` and `totalPoints`
2. **Caching**: Consider caching user profiles (refresh on activity)
3. **Batch Operations**: Aggregate point updates periodically
4. **Leaderboard**: Cache top 10 users, refresh hourly

---

## Error Handling

✅ **Handled Scenarios:**
- User doesn't exist (auto-creates)
- Invalid activity type (logged, no error to user)
- Network failures (graceful fallback)
- Duplicate awards (prevented by client-side debouncing)

---

## Security Notes

1. ✅ Backend validates userId ownership (implement authorization)
2. ✅ Activity types are server-side defined (prevent arbitrary awards)
3. ✅ Point values are immutable
4. ✅ Activity history is append-only (no deletion)

---

## Support & Troubleshooting

**Issue**: Points not showing in profile
- Solution: Ensure user is initialized with POST `/api/points/init/:userId`

**Issue**: Points awarded but not updated in UI
- Solution: Refresh profile after awarding points

**Issue**: Database connection errors
- Check MongoDB is running on `mongodb://0.0.0.0:27017`
- Verify `bloomify` database & `users` collection exist

**Issue**: Estimated time shows "Unknown"
- Solution: User needs at least one activity. Activities accumulate data.

---

## Contact & Support

For issues or feature requests, refer to the Bloomify documentation or raise an issue in the repository.

---

**Version**: 1.0  
**Last Updated**: 2024-01-22  
**Maintained by**: Bloomify Development Team
