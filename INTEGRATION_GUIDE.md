# Integration Guide for PlantSelectionWizard & PlantRecommendationCard

## Overview
This guide shows how to integrate the new wizard and recommendation card components into your Space Analysis feature.

---

## 🧙 PlantSelectionWizard Integration

### Import the Component
```javascript
import PlantSelectionWizard from './PlantSelectionWizard';
```

### Add State Management
```javascript
const [showWizard, setShowWizard] = useState(true);
const [userPreferences, setUserPreferences] = useState(null);
```

### Handle Wizard Completion
```javascript
const handleWizardComplete = (preferences) => {
  console.log("User selected:", preferences);
  // Expected format:
  // {
  //   plantType: "vegetables",
  //   space: "balcony",
  //   sunlight: "high",
  //   water: "moderate"
  // }
  
  setUserPreferences(preferences);
  setShowWizard(false);
  
  // Auto-recommend plants based on preferences
  recommentPlantsByPreferences(preferences);
};

const handleSkipWizard = () => {
  setShowWizard(false);
  // Continue with existing flow
};
```

### Render in JSX
```jsx
{showWizard && (
  <PlantSelectionWizard 
    onComplete={handleWizardComplete}
    onSkip={handleSkipWizard}
  />
)}

{!showWizard && (
  // Show your plant analysis/recommendations
  <div>
    {/* Your space analysis content */}
  </div>
)}
```

---

## 🌻 PlantRecommendationCard Integration

### Import the Component
```javascript
import PlantRecommendationCard from './PlantRecommendationCard';
```

### Prepare Plant Data
```javascript
const plant = {
  name: "Tomato",
  category: "vegetables",
  difficulty: "Easy",
  emoji: "🍅",
  description: "A popular garden vegetable rich in vitamins",
  sunlight: "High (6+ hrs)",
  watering: "Regular (every 2-3 days)",
  temperature: "20-30",
  daysToMaturity: "60-65",
  plantingDepth: "0.5 cm",
  spacing: "30-45",
  wateringFrequency: "2-3",
  lightHours: "6",
  wateringGuide: "Water regularly when soil feels dry. Avoid overwatering.",
  harvestingGuide: "Harvest when fully ripe and red. Pick in the morning.",
  benefits: "Rich in Vitamin C, Lycopene. Great for health.",
  warnings: "Prone to blossom end rot if underwatered.",
};
```

### Handle Add to Plants
```javascript
const handleAddToPlants = (plant) => {
  console.log("Adding plant to collection:", plant.name);
  
  // Track activity
  trackActivity("select", {
    plantName: plant.name,
    category: plant.category,
  });
  
  // Save preferences
  addFavoritePlant(plant.name, plant.category);
  
  // Add to user's plant collection
  addToMyPlants(plant);
  
  showToast(`${plant.name} added to your collection!`);
};
```

### Render in JSX
```jsx
<div className="grid md:grid-cols-2 gap-6">
  {recommendedPlants.map((plant) => (
    <PlantRecommendationCard
      key={plant.name}
      plant={plant}
      onAddToPlants={handleAddToPlants}
    />
  ))}
</div>
```

---

## 📋 Complete SpacePhotoAnalysis Integration Example

```javascript
import React, { useState, useEffect } from "react";
import PlantSelectionWizard from "./PlantSelectionWizard";
import PlantRecommendationCard from "./PlantRecommendationCard";
import { trackActivity } from "../utils/activityTracker";
import { addFavoritePlant } from "../utils/preferencesManager";

export default function EnhancedSpaceAnalysis() {
  const [step, setStep] = useState("wizard"); // "wizard", "analysis", "results"
  const [userPreferences, setUserPreferences] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sample plant database (replace with your actual data)
  const plantDatabase = {
    vegetables: [
      {
        name: "Tomato",
        emoji: "🍅",
        category: "vegetables",
        difficulty: "Easy",
        description: "Popular garden vegetable",
        sunlight: "High (6+ hrs)",
        watering: "Regular",
        temperature: "20-30",
        daysToMaturity: "60-65",
        plantingDepth: "0.5 cm",
        spacing: "30-45",
        wateringFrequency: "2-3",
        benefits: "Rich in Vitamin C",
        warnings: "Prone to blossom end rot if underwatered",
      },
      // Add more vegetables...
    ],
    fruits: [
      // Add fruits...
    ],
    flowers: [
      // Add flowers...
    ],
    herbs: [
      // Add herbs...
    ],
  };

  const handleWizardComplete = (preferences) => {
    console.log("Preferences selected:", preferences);
    setUserPreferences(preferences);
    setStep("analysis");
    
    // Filter plants based on preferences
    filterPlantsByPreferences(preferences);
  };

  const filterPlantsByPreferences = (prefs) => {
    setLoading(true);
    
    let filteredPlants = [];
    const plants = plantDatabase[prefs.plantType] || [];

    // Filter by space
    plants.forEach((plant) => {
      // Add your filtering logic here
      filteredPlants.push(plant);
    });

    // Sort by difficulty if beginner
    if (prefs.sunlight === "low") {
      filteredPlants = filteredPlants.filter(
        (p) => p.difficulty === "Easy"
      );
    }

    setRecommendations(filteredPlants);
    setStep("results");
    setLoading(false);
  };

  const handleAddToPlants = (plant) => {
    // Track activity
    trackActivity("select", {
      plantName: plant.name,
      category: plant.category,
    });

    // Save to preferences
    addFavoritePlant(plant.name, plant.category);

    alert(`${plant.name} added to your collection!`);
  };

  const handleSkipWizard = () => {
    setStep("analysis");
  };

  return (
    <div className="min-h-screen p-6">
      {step === "wizard" && (
        <PlantSelectionWizard
          onComplete={handleWizardComplete}
          onSkip={handleSkipWizard}
        />
      )}

      {step === "analysis" && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Analyzing your preferences...</h2>
          {loading && <p>Finding best plants for you...</p>}
        </div>
      )}

      {step === "results" && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">
            Recommended Plants for You
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.map((plant) => (
              <PlantRecommendationCard
                key={plant.name}
                plant={plant}
                onAddToPlants={handleAddToPlants}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Data Flow

```
User
  ↓
PlantSelectionWizard (Step 1: Plant Type)
  ↓                    (Step 2: Space)
  ↓                    (Step 3: Sunlight)
  ↓                    (Step 4: Water)
  ↓
userPreferences
  ↓
Filter Plants from Database
  ↓
recommendedPlants[]
  ↓
PlantRecommendationCard (for each plant)
  ↓
User adds plant
  ↓
trackActivity() + addFavoritePlant()
  ↓
Plant added to collection
```

---

## 🎨 Styling Notes

Both components use Tailwind CSS with custom variables:
- `bg-(--card)` - Card background
- `text-(--text)` - Primary text color
- `text-(--text-secondary)` - Secondary text
- `border-(--border)` - Border color
- `bg-(--primary)` - Primary button/accent color
- `bg-(--secondary)` - Secondary accent

Make sure your CSS file includes these variables:
```css
:root {
  --primary: #22c55e;
  --secondary: #16a34a;
  --text: #1f2937;
  --text-secondary: #6b7280;
  --card: #ffffff;
  --border: #e5e7eb;
  /* ... more variables */
}
```

---

## 📱 Responsive Considerations

- **Mobile**: Components stack vertically
- **Tablet**: 2-column grid
- **Desktop**: Full layout
- **Touch**: Larger tap targets (48x48 minimum)

---

## ⚙️ Backend Integration

Make sure the following endpoints are available:

```
POST /api/activity                    - Track activity
POST /api/user-preferences/:userId    - Save preferences
GET  /api/user-preferences/:userId    - Get preferences
```

---

## 🚀 Next Steps

1. Import both components into your Space Analysis page
2. Set up state management for wizard flow
3. Create your plant database or fetch from API
4. Implement filtering logic based on user preferences
5. Connect to activity tracking
6. Test with real user data

---

## 💡 Tips

- Cache wizard results in localStorage for quick access
- Show loading state while filtering plants
- Add "Go Back" option to modify preferences
- Display success message when plant is added
- Consider showing "You selected" card with user's choices

---

Happy Integrating! 🌱
