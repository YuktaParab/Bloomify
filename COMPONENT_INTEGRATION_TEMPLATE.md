/**
 * COMPONENT TEMPLATE - How to Add Points to Your Components
 * 
 * This file shows the exact pattern to follow when integrating points
 * into your existing components. Copy and adapt the relevant section.
 */

// ============================================================================
// PATTERN 1: Award Points on Component Load/View
// Use for: PlantDetails, GrowthGuide, CareGuide, etc.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { auth } from './Firebase';
import { awardPoints } from '../utils/pointsHelper';

export default function PlantDetailsExample({ plantId }) {
  const [plant, setPlant] = useState(null);

  useEffect(() => {
    // Load your component data
    const loadData = async () => {
      const data = await fetchPlant(plantId);
      setPlant(data);
    };

    loadData();

    // ✨ Award points when component loads/plant changes
    if (auth.currentUser?.uid && plantId) {
      awardPoints(auth.currentUser.uid, 'plant_view', {
        plantId,
        plantName: plant?.name || 'Unknown'
      });
    }
  }, [plantId]); // Only run when plantId changes

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}

// ============================================================================
// PATTERN 2: Award Points on User Action/Event
// Use for: Search, clicking buttons, submissions, etc.
// ============================================================================

import React, { useState } from 'react';
import { auth } from './Firebase';
import { awardPoints } from '../utils/pointsHelper';

export default function SearchPageExample() {
  const [results, setResults] = useState([]);

  // ✨ Award points when search completes
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    try {
      // Your existing search logic
      const searchResults = await searchPlants(searchTerm);
      setResults(searchResults);

      // Award points only on successful search with results
      if (auth.currentUser?.uid && searchResults.length > 0) {
        await awardPoints(auth.currentUser.uid, 'search', {
          searchTerm,
          resultsCount: searchResults.length
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search plants..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      {/* Display results */}
    </div>
  );
}

// ============================================================================
// PATTERN 3: Award Points on Form Submission
// Use for: CreatePost, CreateListing, Signup follow-ups, etc.
// ============================================================================

import React, { useState } from 'react';
import { auth } from './Firebase';
import { awardPoints } from '../utils/pointsHelper';

export default function CreatePostExample() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  // ✨ Award points on successful post creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Your existing post creation logic
      const newPost = await createPost({
        userId: auth.currentUser?.uid,
        ...formData,
        createdAt: new Date()
      });

      if (newPost?.id) {
        // Award points for creating post
        await awardPoints(auth.currentUser.uid, 'post_created', {
          postId: newPost.id,
          title: formData.title,
          category: formData.category
        });

        // Success feedback
        alert('Post created! +20 points earned! 🎉');
        setFormData({ title: '', content: '', category: '' });
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Post title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <textarea
        placeholder="Post content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
      />
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="">Select category</option>
        <option value="general">General</option>
        <option value="tips">Tips & Tricks</option>
        <option value="showcase">Showcase</option>
      </select>
      <button type="submit">Create Post</button>
    </form>
  );
}

// ============================================================================
// PATTERN 4: Award Points on Multi-Step Process Completion
// Use for: Checkout, Complex workflows, Multi-stage features, etc.
// ============================================================================

import React, { useState } from 'react';
import { auth } from './Firebase';
import { awardPoints } from '../utils/pointsHelper';

export default function CheckoutExample() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [orderData, setOrderData] = useState({});

  // ✨ Award points when entire checkout completes
  const handleCheckoutComplete = async () => {
    try {
      // Process payment
      const order = await processPayment({
        ...orderData,
        items: cart,
        total: calculateTotal(cart)
      });

      if (order?.id) {
        // Award points for purchase
        await awardPoints(auth.currentUser.uid, 'product_purchase', {
          orderId: order.id,
          itemCount: cart.length,
          totalAmount: calculateTotal(cart),
          items: cart.map(item => item.name)
        });

        // Success feedback
        alert(`Order placed! +30 points earned! 🎉`);
        setStep(1);
        setCart([]);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed');
    }
  };

  const calculateTotal = (items) => items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div>
      {step === 1 && (
        <div>
          {/* Cart review */}
          <button onClick={() => setStep(2)}>Proceed to Shipping</button>
        </div>
      )}
      {step === 2 && (
        <div>
          {/* Shipping info */}
          <button onClick={() => setStep(3)}>Proceed to Payment</button>
        </div>
      )}
      {step === 3 && (
        <div>
          {/* Payment info */}
          <button onClick={handleCheckoutComplete}>Complete Order</button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PATTERN 5: Award Points for Interactions (Likes, Comments)
// Use for: ShowPost, Reviews, Comments, Reactions, etc.
// ============================================================================

import React, { useState } from 'react';
import { auth } from './Firebase';
import { awardPoints } from '../utils/pointsHelper';

export default function PostInteractionExample({ postId }) {
  const [likes, setLikes] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);

  // ✨ Award points when user likes (only once per post)
  const handleLike = async () => {
    if (userHasLiked) {
      alert('You already liked this post!');
      return;
    }

    try {
      // Your existing like logic
      await likePost(postId, auth.currentUser?.uid);
      setLikes(likes + 1);
      setUserHasLiked(true);

      // Award points for community interaction
      await awardPoints(auth.currentUser.uid, 'community_interaction', {
        postId,
        actionType: 'like',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  // ✨ Award points when user comments
  const handleComment = async (commentText) => {
    if (!commentText.trim()) return;

    try {
      // Your existing comment logic
      const comment = await addComment(postId, {
        userId: auth.currentUser?.uid,
        text: commentText,
        createdAt: new Date()
      });

      if (comment?.id) {
        // Award points for community interaction
        await awardPoints(auth.currentUser.uid, 'community_interaction', {
          postId,
          actionType: 'comment',
          commentId: comment.id
        });

        alert('Comment added! +10 points earned! 🎉');
      }
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  return (
    <div>
      <button onClick={handleLike} disabled={userHasLiked}>
        {userHasLiked ? '❤️ Liked' : '🤍 Like'} ({likes})
      </button>
      <button onClick={() => handleComment('Great post!')}>Comment</button>
    </div>
  );
}

// ============================================================================
// PATTERN 6: Award Points with Loading State & Error Handling
// Use for: Important features where you want feedback
// ============================================================================

import React, { useState } from 'react';
import { auth } from './Firebase';
import { awardPoints, showNotification } from '../utils/pointsHelper';

export default function SafePointsAwardExample() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    setIsProcessing(true);

    try {
      // Your action logic
      const result = await performAction();

      if (result?.success) {
        // Award points with error handling
        const pointsResult = await awardPoints(
          auth.currentUser.uid,
          'space_analysis',
          {
            resultId: result.id,
            success: true
          }
        );

        // Show feedback
        if (pointsResult?.levelUpMessage) {
          showNotification(pointsResult.levelUpMessage, 'success');
        } else {
          showNotification(`+${pointsResult?.pointsAwarded} points earned!`, 'success');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Action failed', 'error');
      // Don't break UX even if points fail
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button onClick={handleAction} disabled={isProcessing}>
      {isProcessing ? 'Processing...' : 'Perform Action'}
    </button>
  );
}

// ============================================================================
// PATTERN 7: Award Points with Debounce (Prevent Duplicates)
// Use for: Frequently triggered actions to prevent spam
// ============================================================================

import React, { useState, useCallback } from 'react';
import { auth } from './Firebase';
import { awardPoints, debounce } from '../utils/pointsHelper';

export default function DebouncedPointsExample() {
  const [viewCount, setViewCount] = useState(0);

  // Create debounced function that only awards once within 5 seconds
  const debouncedAwardPoints = useCallback(
    debounce(async () => {
      if (auth.currentUser?.uid) {
        await awardPoints(auth.currentUser.uid, 'plant_view', {
          viewCount
        });
      }
    }, 5000), // 5 second delay
    [viewCount]
  );

  const handleScroll = () => {
    setViewCount(viewCount + 1);
    debouncedAwardPoints(); // Only awards after 5 secs of inactivity
  };

  return (
    <div onScroll={handleScroll}>
      {/* Component content */}
    </div>
  );
}

// ============================================================================
// PATTERN 8: Conditional Points Award Based on User Level
// Use for: Advanced/Intermediate exclusive features
// ============================================================================

import React, { useState, useEffect } from 'react';
import { auth } from './Firebase';
import { awardPoints, fetchUserProfile } from '../utils/pointsHelper';

export default function ConditionalPointsExample() {
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (auth.currentUser?.uid) {
      fetchUserProfile(auth.currentUser.uid).then(setUserProfile);
    }
  }, []);

  const handlePremiumFeature = async () => {
    // Only award points to intermediate users
    if (userProfile?.isIntermediate) {
      await awardPoints(auth.currentUser.uid, 'post_created', {
        premiumFeature: true
      });
      alert('Premium feature + bonus points!');
    } else {
      alert('Reach Intermediate level to unlock this!');
    }
  };

  return (
    <button onClick={handlePremiumFeature}>
      {userProfile?.isIntermediate ? '✨ Premium Feature' : '🔒 Unlock at Intermediate'}
    </button>
  );
}

// ============================================================================
// QUICK REFERENCE
// ============================================================================

/*
IMPORT STATEMENT (add to every file using points):
import { awardPoints } from '../utils/pointsHelper';
import { auth } from './Firebase';

BASIC USAGE:
if (auth.currentUser?.uid) {
  await awardPoints(auth.currentUser.uid, 'activity_type', {
    metadata: value
  });
}

ACTIVITY TYPES:
- plant_view (5 pts)
- search (10 pts)
- plant_select (15 pts)
- care_guide_read (8 pts)
- growth_guide_read (8 pts)
- space_analysis (12 pts)
- post_created (20 pts)
- listing_created (25 pts)
- product_purchase (30 pts)
- community_interaction (10 pts)

BEST PRACTICES:
✅ Check auth before awarding
✅ Use useEffect for component loads
✅ Use event handlers for user actions
✅ Include metadata for context
✅ Handle errors gracefully
✅ Provide user feedback
✅ Debounce repeated actions

❌ Don't call in render
❌ Don't award without userId
❌ Don't hardcode values
❌ Don't break UX if points fail
*/
