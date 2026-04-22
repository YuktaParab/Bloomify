# 🏗️ Plant Recommendation System - Architecture & Data Model

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BLOOMIFY RECOMMENDATION ENGINE            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  FRONTEND (React)                BACKEND (Node.js/Express)   │
│  ┌──────────────────┐            ┌────────────────────────┐  │
│  │ SpacePhotoAnalysis           │ Server (server.js)      │  │
│  │ - Image Upload   │──────────→ │ - Route Handler        │  │
│  │ - Space Analysis │            │ - Request Validation   │  │
│  └────────┬─────────┘            └────────┬───────────────┘  │
│           │                               │                   │
│  ┌────────▼──────────────────┐  ┌────────▼───────────────┐  │
│  │ PlantRecommendationFlow   │  │ routes/recommend.js    │  │
│  │ - Geolocation Request     │  │ - POST /recommend-   │  │
│  │ - Soil Type Selection     │  │   plants              │  │
│  │ - API Request Sending     │  │ - POST /seed-plants   │  │
│  │ - Results Display         │  │ - GET /history        │  │
│  └──────────┬────────────────┘  └────────┬───────────────┘  │
│             │                            │                   │
│             │                   ┌────────▼─────────────────┐ │
│             │                   │ services/weather        │ │
│             │                   │ Service.js             │ │
│             │                   │ - OpenWeatherMap API   │ │
│             │                   │ - Temp Range Check     │ │
│             │                   │ - Climate Regions      │ │
│             │                   └────────┬────────────────┘ │
│             │                            │                  │
│             │                   ┌────────▼──────────────┐  │
│             │                   │ services/             │  │
│             │                   │ recommendation        │  │
│             │                   │ Service.js            │  │
│             │                   │ - Scoring Algorithm   │  │
│             │                   │ - Plant Filtering     │  │
│             │                   │ - Ranking             │  │
│             │                   └────────┬──────────────┘  │
│             │                            │                 │
│             │                   ┌────────▼──────────────┐  │
│             │                   │ MongoDB Collection:   │  │
│             │                   │ - plants (schema)     │  │
│             │                   │ - recommendation_     │  │
│             │                   │   history             │  │
│             │                   └──────────────────────┘  │
│             │                                              │
│             └──────────────────────────────────────────────┘
│                        JSON Response
│
└─────────────────────────────────────────────────────────────┘
```

---

## Data Models

### Plant Schema (MongoDB)

```javascript
{
  _id: ObjectId,
  
  // Basic Information
  name: String,                    // e.g., "Monstera Deliciosa"
  scientificName: String,          // e.g., "Monstera deliciosa"
  description: String,             // Plant description
  
  // Environmental Requirements
  temperature_range: {
    min: Number,                   // Minimum temp in °C
    max: Number                    // Maximum temp in °C
  },
  
  humidity: {
    min: Number,                   // Minimum humidity %
    max: Number,                   // Maximum humidity %
    preference: String             // "dry" | "moderate" | "high"
  },
  
  // Sunlight Requirements
  sunlight: String,                // "low" | "medium" | "high"
  
  // Space Compatibility
  space: [String],                 // ["indoor", "balcony", "terrace", "garden"]
  spaceSize: String,               // "small" | "medium" | "large"
  
  // Soil Requirements
  soil: [String],                  // ["well-draining", "loamy", "sandy", "clay"]
  
  // Care Requirements
  water_need: String,              // "low" | "moderate" | "high"
  watering_frequency: String,      // e.g., "every 1-2 weeks"
  maintenance: String,             // "low" | "medium" | "high"
  
  // Geographic Distribution
  region: [String],                // ["tropical", "subtropical", "temperate", "arid"]
  
  // Additional Metadata
  hardiness_zone: String,          // USDA zone
  growth_rate: String,             // "slow" | "medium" | "fast"
  max_height: String,              // e.g., "30 cm", "1.5 m"
  toxicity: String,                // "toxic" | "mildly toxic" | "safe"
  petFriendly: Boolean             // Is it safe for pets
}
```

### Recommendation History Schema

```javascript
{
  _id: ObjectId,
  email: String,                   // User's email
  timestamp: Date,                 // When recommendation was made
  
  location: {
    latitude: Number,
    longitude: Number
  },
  
  weatherData: {
    temperature: Number,           // Current temp (°C)
    humidity: Number,              // Current humidity (%)
    weather: String,               // e.g., "Partly Cloudy"
    city: String,
    country: String
  },
  
  inputCriteria: {
    temperature: Number,
    sunlight: String,
    space: String,
    climateRegions: [String],
    soilTypes: [String],
    spaceSize: String
  },
  
  recommendations: [
    {
      name: String,
      score: Number                // 0-9 points
    }
  ]
}
```

---

## Scoring Algorithm Deep Dive

### Step 1: Plant Filtering

Only plants that meet ALL three hard constraints are considered:

```
HARD CONSTRAINTS (Must all pass):
  ✓ Temperature Range: Current temp >= min && Current temp <= max
  ✓ Sunlight Level: Plant sunlight matches user's available light
  ✓ Space Type: Plant can grow in user's space type
```

**Filtering Logic:**
```javascript
function filterPlants(plants, criteria) {
  return plants.filter(plant => {
    const tempMatch = checkTemperatureMatch(plant, criteria.temperature);
    const sunMatch = checkSunlightMatch(plant.sunlight, criteria.sunlight);
    const spaceMatch = checkSpaceMatch(plant.space, criteria.space);
    
    return tempMatch && sunMatch && spaceMatch;
  });
}
```

### Step 2: Soft Constraint Scoring

For each filtered plant, calculate score:

```
SCORING RULES:
  Temperature Match ............ +2 points
  Sunlight Match ............... +2 points
  Space Type Match ............. +2 points
  Soil Match ................... +2 points
  Region/Climate Match ......... +1 point
  ─────────────────────────────────────
  MAXIMUM SCORE ................ 9 points
```

**Example Scoring:**
```
Plant: Monstera Deliciosa
Location: Mumbai (24°C, 65% humidity)
User Input: Indoor, Medium sunlight, Medium space

Scoring:
  ✓ Temperature 24°C in range (16-27°C) ........... +2 pts
  ✓ Medium sunlight matches requirement .......... +2 pts
  ✓ Indoor space available ........................ +2 pts
  ✓ Loamy soil available ......................... +2 pts
  ✓ Tropical region matches climate ............. +1 pt
  ─────────────────────────────────────────────────────
  TOTAL SCORE: 9/9 (Perfect Match!)
```

### Step 3: Ranking & Selection

```
Ranked Results:
  1. Score 9 - Monstera Deliciosa
  2. Score 8 - Rubber Plant
  3. Score 8 - Philodendron
  4. Score 7 - Spider Plant
  5. Score 7 - Pilea Peperomioides
  
Return: Top 5 plants
```

### Step 4: Fallback Strategy

If fewer than 3 plants pass hard filters:

```
FALLBACK (Soft Filtering):
  Remove one soft constraint (usually maintenance)
  Re-score all plants
  Return top 5 by score
  
  Mark as "Alternative Match" in UI
```

---

## Request-Response Flow

### 1. Frontend Sends Request

```javascript
const payload = {
  email: "user@example.com",
  spaceType: "indoor",              // From image analysis
  sunlightLevel: "medium",          // From image analysis
  spaceSize: "medium",              // From image analysis
  latitude: 19.0760,                // From geolocation
  longitude: 72.8777,               // From geolocation
  soilType: ["well-draining"]       // User selection (optional)
};
```

### 2. Backend Processing

```javascript
// Step 1: Validation
✓ Check all required fields present
✓ Validate latitude/longitude ranges

// Step 2: Weather Fetch
→ Call OpenWeatherMap API
← Get: temp, humidity, weather, city

// Step 3: Database Query
→ Get all plants from MongoDB
← All 20 plants retrieved

// Step 4: Build Criteria
criteria = {
  temperature: 24,
  sunlight: "medium",
  space: "indoor",
  soilTypes: ["well-draining"],
  climateRegions: ["tropical"],
  spaceSize: "medium"
}

// Step 5: Filter & Score
filtered = plants.filter(...) // 15 plants pass hard filters
scored = filtered.map(plant => ({
  ...plant,
  score: calculateScore(plant, criteria)
}))

// Step 6: Sort & Select
ranked = scored.sort((a, b) => b.score - a.score)
top5 = ranked.slice(0, 5)

// Step 7: Save History
Save to recommendation_history collection

// Step 8: Return Response
{
  success: true,
  plants: top5,
  weatherData: {...},
  timestamp: ...
}
```

### 3. Frontend Displays Results

Each plant shown with:
- **Name & Scientific Name**
- **Match Score (0-9)**
- **Scoring Explanation** (why recommended)
- **Quick Stats** (water, sunlight, temp, maintenance)
- **Expandable Details** (more care info)
- **Location & Weather** (context for recommendation)

---

## Sunlight Level Matching

Plants have different sunlight tolerances:

```
Plant Requirement → User Can Provide
─────────────────────────────────────
LOW light plant     → LOW, MEDIUM, HIGH (works in all)
MEDIUM light plant  → LOW, MEDIUM, HIGH (adaptable)
HIGH light plant    → MEDIUM, HIGH (needs bright light)

Matching Logic:
  plant.sunlight = "low"    ✓ matches ["low", "medium"]
  plant.sunlight = "medium" ✓ matches ["low", "medium", "high"]
  plant.sunlight = "high"   ✓ matches ["medium", "high"]
```

---

## Climate Region Detection

Based on current weather:

```
Temperature Analysis:
  < 10°C  → Cold climate
  10-18°C → Cool climate
  18-25°C → Temperate climate
  25-32°C → Warm climate
  > 32°C  → Hot climate

Humidity Analysis:
  < 40%      → Dry/Arid climate
  40-60%     → Temperate climate
  > 60%      → Humid climate

Combined Result:
  24°C + 65% humidity + tropical weather
  → Climate Regions: ["tropical", "subtropical"]

Plant Compatibility:
  Plant region includes "tropical" ✓ +1 point
```

---

## Error Handling Flow

```
REQUEST → VALIDATION ERROR
          ↓
        Return 400 Bad Request
        { error: "Missing required field" }

REQUEST → WEATHER API FAILS
          ↓
        Return fallback weather data
        { temperature: 20, humidity: 60, apiError: true }
        ↓
        Show warning to user
        "Using default weather for recommendations"

REQUEST → NO PLANTS IN DATABASE
          ↓
        Return 404 Not Found
        { error: "No plants available" }
        ↓
        Suggest seeding database

REQUEST → DATABASE CONNECTION ERROR
          ↓
        Return 500 Server Error
        { error: "Database error" }

REQUEST → SUCCESS
          ↓
        Return 200 OK with recommendations
```

---

## API Response Schema

```javascript
{
  // Status
  success: Boolean,
  
  // Main Data
  plants: [
    {
      _id: String,
      name: String,
      score: Number (0-9),
      reason: String,
      water_need: String,
      maintenance: String,
      temperature_range: Object,
      humidity: Object,
      toxicity: String,
      petFriendly: Boolean,
      growth_rate: String,
      max_height: String,
      space: [String],
      soil: [String]
    }
  ],
  
  // Context
  weatherData: {
    temperature: Number,
    humidity: Number,
    weather: String,
    city: String,
    country: String
  },
  
  // User Input (Echo)
  criteria: {
    spaceType: String,
    sunlightLevel: String,
    climate: [String]
  },
  
  // Metadata
  timestamp: ISO String
}
```

---

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| Weather API Response | < 1s | Cached for 30 min |
| Database Query | < 100ms | 20 plants indexed |
| Filtering | < 10ms | JavaScript array operations |
| Scoring | < 20ms | 20 plants × scoring logic |
| Total Request | ~1-2s | Mostly weather API wait |

**Optimization Opportunities:**
- Cache weather data per location
- Pre-filter plants by space type
- Use database indexing for queries
- Implement request rate limiting

---

## Future Enhancements

1. **More Plants** - Expand from 20 to 100+ species
2. **User Preferences** - Save favorite plants and criteria
3. **Plant Growing Tips** - Integration with care schedule
4. **Pest Detection** - AI image analysis for pests
5. **Community Ratings** - User reviews of recommendations
6. **Integration with Shop** - Direct purchase from recommendation
7. **Seasonal Recommendations** - Adjust for season changes
8. **Multi-Language** - Support for Hindi, Marathi, etc.

---

## Database Indexing

For production, add these indexes:

```javascript
// Improve query performance
db.plants.createIndex({ sunlight: 1 });
db.plants.createIndex({ space: 1 });
db.plants.createIndex({ "temperature_range.min": 1, "temperature_range.max": 1 });
db.plants.createIndex({ region: 1 });

// History queries
db.recommendation_history.createIndex({ email: 1, timestamp: -1 });
```

---

## Testing Scenarios

### Scenario 1: Perfect Match
```
Input: Indoor, Medium light, 24°C, Loamy soil
Expected: Monstera gets 9/9
```

### Scenario 2: Low Light Expert
```
Input: Indoor, Low light, 15°C
Expected: Snake Plant, Pothos get high scores
```

### Scenario 3: Outdoor High Light
```
Input: Balcony, High light, 32°C
Expected: Succulents, Aloe get high scores
```

### Scenario 4: Challenging Conditions
```
Input: Balcony, Low light, 5°C
Expected: Fewer matches, alternatives shown
```

---

## Code Structure

### Backend Organization

```
Backend/
├── server.js                  # Main Express app
├── routes/
│   └── recommend.js          # All recommendation endpoints
├── services/
│   ├── weatherService.js     # OpenWeatherMap integration
│   └── recommendationService.js # Scoring logic
├── models/
│   └── Plant.js              # Schema documentation
└── seeds/
    └── plantsData.js         # 20 plant samples
```

### Frontend Organization

```
Frontend/src/components/
├── SpacePhotoAnalysis.jsx           # Main page
└── PlantRecommendationFlow.jsx      # New recommendation flow
  ├── Geolocation detection
  ├── Soil type selection
  ├── API request handling
  ├── PlantRecommendationCard (child)
  └── Error handling & fallbacks
```

---

Version: 1.0.0
Last Updated: April 18, 2026
