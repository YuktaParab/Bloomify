# Points System - Quick Integration Guide

## Overview
This guide helps you integrate point-awarding calls into existing features.

---

## Activity Types & Point Values

| Activity | Points | When to Award |
|----------|--------|---------------|
| `plant_view` | 5 | User opens plant detail page |
| `search` | 10 | User performs a search |
| `plant_select` | 15 | User selects plant for recommendations |
| `care_guide_read` | 8 | User opens care guide |
| `growth_guide_read` | 8 | User opens growth guide |
| `space_analysis` | 12 | User uploads space photo & gets analysis |
| `post_created` | 20 | User creates community post |
| `listing_created` | 25 | Seller creates product listing |
| `product_purchase` | 30 | User completes purchase |
| `community_interaction` | 10 | User likes/comments on post |

---

## Helper Function

Create this utility function in your components or utils:

### `utils/pointsHelper.js`
```javascript
export const awardPoints = async (userId, activityType, additionalData = {}) => {
  if (!userId) {
    console.warn('No userId provided for points award');
    return null;
  }

  try {
    const response = await fetch('http://localhost:3000/api/points/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        activityType,
        additionalData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to award points');
    }

    const result = await response.json();
    
    // Show level-up message if user just became Intermediate
    if (result.levelUpMessage) {
      console.log('🎉 ' + result.levelUpMessage);
      // Show toast notification if you have one
    }

    return result;
  } catch (error) {
    console.error('Error awarding points:', error);
    // Don't break user experience if points fail
    return null;
  }
};

export const fetchUserProfile = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/points/profile/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const fetchPathway = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/points/pathway/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch pathway');
    return await response.json();
  } catch (error) {
    console.error('Error fetching pathway:', error);
    return null;
  }
};
```

---

## Integration Examples by Component

### 1. PlantDetails.jsx - Award points when user views plant
```javascript
import { auth } from "./Firebase";
import { awardPoints } from "../utils/pointsHelper";

export default function PlantDetails() {
  const [plant, setPlant] = useState(null);

  useEffect(() => {
    const loadPlant = async (plantId) => {
      // Your existing plant loading logic
      const plantData = await fetchPlant(plantId);
      setPlant(plantData);

      // Award points for viewing
      if (auth.currentUser?.uid) {
        await awardPoints(auth.currentUser.uid, 'plant_view', {
          plantId: plantData.id,
          plantName: plantData.name
        });
      }
    };

    loadPlant(plantId);
  }, [plantId]);

  return (
    // Your component JSX
  );
}
```

### 2. PlantCatalogPage.jsx - Award points for search
```javascript
import { awardPoints } from "../utils/pointsHelper";

const handleSearch = async (searchTerm) => {
  if (!searchTerm.trim()) return;

  // Your existing search logic
  const results = await searchPlants(searchTerm);
  setResults(results);

  // Award points for search activity
  if (auth.currentUser?.uid && results.length > 0) {
    await awardPoints(auth.currentUser.uid, 'search', {
      searchTerm,
      resultsCount: results.length
    });
  }
};
```

### 3. CareGuide.jsx - Award points for reading guides
```javascript
import { awardPoints } from "../utils/pointsHelper";

export default function CareGuide({ plantId }) {
  useEffect(() => {
    // Award points when guide loads
    if (auth.currentUser?.uid) {
      awardPoints(auth.currentUser.uid, 'care_guide_read', {
        plantId
      });
    }
  }, [plantId]);

  return (
    // Your guide component
  );
}
```

### 4. SpacePhotoAnalysis.jsx - Award points for analysis
```javascript
import { awardPoints } from "../utils/pointsHelper";

const handleAnalysisComplete = async (results) => {
  // Your existing analysis logic
  
  // Award points for space analysis
  if (auth.currentUser?.uid) {
    await awardPoints(auth.currentUser.uid, 'space_analysis', {
      lightLevel: results.light,
      spaceType: results.type,
      recommendedPlants: results.plants.length
    });
  }
};
```

### 5. CreatePost.jsx - Award points for creating posts
```javascript
import { awardPoints } from "../utils/pointsHelper";

const handlePostCreate = async (postData) => {
  // Your existing post creation logic
  const post = await createPost(postData);

  // Award points for creating post
  if (auth.currentUser?.uid) {
    await awardPoints(auth.currentUser.uid, 'post_created', {
      postId: post.id,
      title: post.title
    });
  }
};
```

### 6. SellerDashboard.jsx - Award points for creating listings
```javascript
import { awardPoints } from "../utils/pointsHelper";

const handleCreateListing = async (listingData) => {
  // Your existing listing creation logic
  const listing = await createListing(listingData);

  // Award points for seller listing
  if (auth.currentUser?.uid) {
    await awardPoints(auth.currentUser.uid, 'listing_created', {
      listingId: listing.id,
      productName: listing.productName,
      price: listing.price
    });
  }
};
```

### 7. Checkout.jsx - Award points for purchase
```javascript
import { awardPoints } from "../utils/pointsHelper";

const handleCheckoutComplete = async (orderData) => {
  // Your existing checkout logic
  const order = await processPayment(orderData);

  // Award points for purchase
  if (auth.currentUser?.uid) {
    await awardPoints(auth.currentUser.uid, 'product_purchase', {
      orderId: order.id,
      itemsCount: order.items.length,
      totalAmount: order.total
    });
  }
};
```

### 8. ShowPost.jsx - Award points for interactions
```javascript
import { awardPoints } from "../utils/pointsHelper";

const handleLikePost = async (postId) => {
  // Your existing like logic
  await likePost(postId);

  // Award points for community interaction
  if (auth.currentUser?.uid) {
    await awardPoints(auth.currentUser.uid, 'community_interaction', {
      postId,
      actionType: 'like'
    });
  }
};

const handleCommentPost = async (postId, comment) => {
  // Your existing comment logic
  await addComment(postId, comment);

  // Award points for community interaction
  if (auth.currentUser?.uid) {
    await awardPoints(auth.currentUser.uid, 'community_interaction', {
      postId,
      actionType: 'comment'
    });
  }
};
```

---

## Adding Points Display to Components

### Minimal Points Badge Component

```javascript
// components/PointsBadge.jsx
import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { fetchUserProfile } from '../utils/pointsHelper';
import { auth } from './Firebase';

export default function PointsBadge() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (auth.currentUser?.uid) {
      fetchUserProfile(auth.currentUser.uid).then(profile => {
        if (profile) setPoints(profile.totalPoints);
      });
    }
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
      <Zap className="w-4 h-4 text-yellow-500" />
      <span className="text-sm font-semibold text-yellow-600">{points}</span>
    </div>
  );
}
```

### Add to Navigation Header
```javascript
// In your App.jsx or Header component
import PointsBadge from "./components/PointsBadge";

export default function Header() {
  return (
    <header className="flex items-center justify-between">
      {/* Your existing header content */}
      <PointsBadge />
    </header>
  );
}
```

---

## Testing Points Integration

### Easy Testing Function
```javascript
// Place in your browser console while app is running
const testAwardPoints = async (userId, activityType) => {
  try {
    const response = await fetch('http://localhost:3000/api/points/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, activityType })
    });
    const result = await response.json();
    console.log('Points awarded:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Usage:
// testAwardPoints('your-user-id', 'plant_view')
```

---

## Checklist for Integration

- [ ] Import `awardPoints` helper in component
- [ ] Call `awardPoints()` after action completes
- [ ] Avoid double-counting (debounce if needed)
- [ ] Pass relevant metadata in `additionalData`
- [ ] Test with real user (check UserProfile)
- [ ] Verify points appear in profile after 1-2 seconds
- [ ] Check leaderboard updates

---

## Common Pitfalls

❌ **DON'T**: Call points on every render
```javascript
// WRONG ❌
render() {
  awardPoints(userId, 'plant_view'); // Called every render!
  return <div>{plant.name}</div>;
}
```

✅ **DO**: Call in useEffect or event handler
```javascript
// RIGHT ✅
useEffect(() => {
  awardPoints(userId, 'plant_view');
}, [plantId]); // Only run when plant changes
```

---

❌ **DON'T**: Award without checking auth
```javascript
// WRONG ❌
awardPoints(userId, 'plant_view'); // What if user not logged in?
```

✅ **DO**: Check auth first
```javascript
// RIGHT ✅
if (auth.currentUser?.uid) {
  awardPoints(auth.currentUser.uid, 'plant_view');
}
```

---

## Need Help?

Refer to:
- [POINTS_SYSTEM.md](./POINTS_SYSTEM.md) - Full documentation
- [Backend Points Module](./Backend/points.js) - Source code
- [UserProfile Component](./Frontend/my-app/src/components/UserProfile.jsx) - UI reference
