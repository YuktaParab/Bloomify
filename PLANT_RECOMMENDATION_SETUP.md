# 🌿 Plant Recommendation System - Setup & Deployment Guide

## Overview

This guide explains how to set up and deploy the **Image-Based Space Analysis + Location-Aware Plant Recommendation** feature for Bloomify.

The system works in these steps:
1. User analyzes their space using image or manual input
2. System detects: space type, sunlight level, space size
3. User's location is captured (with fallback to manual city entry)
4. Weather data is fetched for the location
5. Plants are filtered and scored based on all criteria
6. Top 5 recommendations are displayed with detailed explanations

---

## 📋 Backend Setup

### Step 1: Install Dependencies

```bash
cd Backend
npm install axios
npm install
```

**What's included:**
- `axios` - For making HTTP requests to OpenWeatherMap API
- All other dependencies from existing `package.json`

### Step 2: Get OpenWeatherMap API Key

1. Go to https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. Go to your API keys section
4. Copy your **API Key** (free tier key)
5. Add it to `.env`:

```env
OPENWEATHER_API_KEY=your_api_key_here
```

**Free Tier Benefits:**
- 1,000 API calls per day (more than enough for testing)
- Unlimited account limit
- Current weather data available

### Step 3: Verify MongoDB Connection

Ensure MongoDB is running:

```bash
# Windows
mongod

# Or check connection in your env
echo %MONGODB_URL%
```

Default connection: `mongodb://0.0.0.0:27017`

### Step 4: Seed Plant Database

The plant data needs to be added to MongoDB **only once**:

```bash
# Start the backend server first
npm start

# In another terminal, seed the database
curl -X POST http://localhost:3001/api/seed-recommendation-plants

# Response should be:
# { "success": true, "message": "Plants seeded successfully", "count": 20 }
```

**What gets seeded:**
- 20 diverse plant species
- Each with complete environmental requirements
- Covering indoor, balcony, terrace, and garden spaces
- Mix of low, medium, and high sunlight requirements

### Step 5: Update Backend Files

The following files have been created/updated:

```
Backend/
├── routes/
│   └── recommend.js          (NEW - API endpoints)
├── services/
│   ├── weatherService.js     (NEW - Weather API integration)
│   └── recommendationService.js (NEW - Scoring & filtering)
├── models/
│   └── Plant.js              (NEW - Schema documentation)
├── seeds/
│   └── plantsData.js         (NEW - 20 plant samples)
├── server.js                 (UPDATED - Added route registration)
├── package.json              (UPDATED - Added axios)
└── .env                      (UPDATED - Added OPENWEATHER_API_KEY)
```

### Step 6: Backend API Endpoints

Once set up, three new endpoints are available:

#### 1. **POST /api/recommend-plants** (Main Endpoint)

**Request:**
```json
{
  "email": "user@example.com",
  "spaceType": "indoor|balcony|terrace|garden",
  "sunlightLevel": "low|medium|high",
  "spaceSize": "small|medium|large",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "soilType": ["well-draining", "loamy"]
}
```

**Response:**
```json
{
  "success": true,
  "plants": [
    {
      "_id": "...",
      "name": "Monstera Deliciosa",
      "score": 9,
      "reason": "Suitable because it thrives in 24°C temperatures, perfect for medium sunlight environments, ideal for indoor spaces, suited for tropical climates in your region, low maintenance.",
      "water_need": "moderate",
      "maintenance": "low",
      "temperature_range": { "min": 16, "max": 27 },
      "humidity": { "min": 50, "max": 80, "preference": "moderate" },
      ...
    },
    ...
  ],
  "weatherData": {
    "temperature": 24,
    "humidity": 65,
    "weather": "Partly Cloudy",
    "city": "Mumbai",
    "country": "IN"
  },
  "criteria": {
    "spaceType": "indoor",
    "sunlightLevel": "medium",
    "climate": ["tropical"]
  },
  "timestamp": "2024-04-18T..."
}
```

#### 2. **POST /api/seed-recommendation-plants** (Seeding)

Seeds database with 20 plant species. Run once.

```bash
curl -X POST http://localhost:3001/api/seed-recommendation-plants
```

#### 3. **GET /api/recommendation-history?email=user@example.com**

Retrieves user's recommendation history (last 10).

```bash
curl "http://localhost:3001/api/recommendation-history?email=user@example.com"
```

---

## 🎨 Frontend Setup

### Step 1: Component Files Added

```
Frontend/my-app/src/components/
├── PlantRecommendationFlow.jsx  (NEW - Main recommendation flow)
└── SpacePhotoAnalysis.jsx        (UPDATED - Integrated recommendation flow)
```

### Step 2: How the Frontend Works

**Location Detection Flow:**

```
1. Space Analysis Complete
   ↓
2. Request Geolocation
   ├── Success → Captured coordinates
   ├── Denied → Show fallback (manual city entry)
   └── Error → Allow manual city input
   ↓
3. Optional: Select Soil Type
   ↓
4. Send Recommendation Request
   └── Backend processes + returns top 5 plants
   ↓
5. Display Results with Scoring
```

### Step 3: Component Features

**PlantRecommendationFlow.jsx includes:**
- Geolocation request with permission handling
- Fallback geocoding using Open-Meteo API (free, no key needed)
- Soil type multi-select
- Loading states and error handling
- Plant recommendation cards with scoring
- Expandable details for each plant
- Weather summary display

**Integration Points:**
- After image analysis completes in SpacePhotoAnalysis.jsx
- Auto-triggers recommendation flow
- Displays location and soil selection
- Shows final recommendations in styled cards

### Step 4: No Additional Dependencies Needed

The frontend uses existing dependencies:
- `axios` - Already installed
- `framer-motion` - Already installed for animations
- `lucide-react` - Already installed for icons

---

## ⚙️ Scoring Algorithm Explained

Each plant is scored out of **9 points**:

| Criterion | Points | Description |
|-----------|--------|-------------|
| Temperature Match | +2 | If plant temp range includes user's location temp |
| Sunlight Match | +2 | If plant sunlight requirements match user's space |
| Space Type Match | +2 | If plant grows in user's space type |
| Soil Match | +2 | If user's soil type matches plant requirements |
| Region/Climate Match | +1 | If plant's native climate matches location |
| **Total** | **9** | Perfect match score |

**Filtering (Hard Constraints):**
- Plant must pass temperature check
- Plant must pass sunlight check
- Plant must pass space type check
- If fewer than 3 plants pass, alternatives are shown with relaxed scoring

**Ranking:**
- All filtered plants are scored
- Sorted by score (descending)
- Top 5 returned

---

## 🧪 Testing the Feature

### Quick Test Flow

#### 1. Backend Test

```bash
# Start backend
cd Backend
npm start

# Test the endpoint
curl -X POST http://localhost:3001/api/recommend-plants \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "spaceType": "indoor",
    "sunlightLevel": "medium",
    "spaceSize": "medium",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "soilType": ["well-draining"]
  }'
```

**Expected Response:**
- `success: true`
- Array of 5 plants with scores
- Weather data for Mumbai
- Each plant has: name, score, reason, care info

#### 2. Frontend Test

1. Go to Space Analysis page
2. Capture or upload an image of a room
3. Click "Confirm & Analyze"
4. After analysis completes, recommendation flow appears
5. Click "Enable Location" (or enter city manually)
6. Select optional soil types
7. Click "Get Recommendations"
8. View results with location and weather data

#### 3. Test Cases

**Test Case 1: Indoor Low Light**
```json
{
  "email": "test@user.com",
  "spaceType": "indoor",
  "sunlightLevel": "low",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
Expected: Snake Plant, Pothos, Peace Lily, ZZ Plant

**Test Case 2: Balcony High Sunlight**
```json
{
  "email": "test@user.com",
  "spaceType": "balcony",
  "sunlightLevel": "high",
  "latitude": 34.0522,
  "longitude": -118.2437
}
```
Expected: Succulents, Aloe Vera, Jade Plant, String of Pearls

**Test Case 3: Garden with Moderate Light**
```json
{
  "email": "test@user.com",
  "spaceType": "garden",
  "sunlightLevel": "medium",
  "latitude": 51.5074,
  "longitude": -0.1278
}
```
Expected: Mixed plants suitable for garden

---

## 🐛 Troubleshooting

### Issue: Weather API Returns Error

**Solution:**
```bash
# Check API key
echo %OPENWEATHER_API_KEY%

# Get new key from https://openweathermap.org/api
# Update .env file
```

**Fallback:** If weather API fails, system uses default weather (20°C, 60% humidity) and shows warning

### Issue: No Plants in Database

**Solution:**
```bash
# Seed the database
curl -X POST http://localhost:3001/api/seed-recommendation-plants

# Verify
curl http://localhost:3001/api/plants
```

### Issue: Geolocation Permission Denied

**Expected Behavior:**
- Show fallback city input
- User can manually enter city name
- Uses Open-Meteo geocoding API (free)

### Issue: CORS Error from Frontend

**Solution:**
```bash
# Ensure backend CORS is enabled (already set in server.js)
# Check backend is running on port 3001
# Check frontend is using correct URL: http://localhost:3001
```

---

## 📊 Recommendation History

The system automatically saves recommendation history:

```bash
# Get user's recommendations
curl "http://localhost:3001/api/recommendation-history?email=user@example.com"
```

**Stored Info:**
- User email
- Timestamp
- Location coordinates
- Weather data at time of recommendation
- Selected plants and scores
- Input criteria

---

## 🚀 Production Deployment

### Before Going Live:

1. **Secure API Keys:**
   ```bash
   # Use environment variables from hosting platform
   # DO NOT commit .env to git
   ```

2. **Database Backup:**
   ```bash
   # Back up MongoDB before deploying
   mongodump --out ./backup
   ```

3. **Update API URLs:**
   ```javascript
   // Change from localhost:3001 to your production URL
   // In PlantRecommendationFlow.jsx and SpacePhotoAnalysis.jsx
   const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
   ```

4. **Rate Limiting:**
   - OpenWeatherMap free tier: 1,000 calls/day
   - Consider caching responses for same coordinates

5. **Error Monitoring:**
   - Log API failures
   - Set up alerts for weather API down time

---

## 📝 Environment Variables Checklist

```env
# MongoDB
MONGODB_URL=mongodb://0.0.0.0:27017
MONGODB_DB_NAME=tinder

# Cloudinary (existing)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# OpenAI (existing)
OPENAI_API_KEY=...
USE_OPENAI_VISION=true

# OpenWeatherMap (NEW - REQUIRED)
OPENWEATHER_API_KEY=your_api_key_from_openweathermap
```

---

## 📚 API Documentation

### Request Format

**Endpoint:** `POST /api/recommend-plants`

**Required Fields:**
- `email` (string) - User's email
- `spaceType` (string) - One of: "indoor", "balcony", "terrace", "garden"
- `sunlightLevel` (string) - One of: "low", "medium", "high"
- `latitude` (number) - Latitude (-90 to 90)
- `longitude` (number) - Longitude (-180 to 180)

**Optional Fields:**
- `spaceSize` (string) - One of: "small", "medium", "large" (default: "medium")
- `soilType` (array) - Array of soil types: "well-draining", "loamy", "sandy", "clay", "peat-based"

### Response Format

**Success (HTTP 200):**
```json
{
  "success": true,
  "plants": [...],
  "weatherData": {...},
  "criteria": {...},
  "timestamp": "ISO timestamp"
}
```

**Error (HTTP 400/500):**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

---

## 🎯 Feature Highlights

✅ **Intelligent Scoring** - 9-point weighted scoring system
✅ **Weather Integration** - Real-time weather data from OpenWeatherMap
✅ **Location Flexibility** - Geolocation OR manual city search
✅ **Error Handling** - Graceful fallbacks for API failures
✅ **History Tracking** - Saves recommendation history for each user
✅ **Production Ready** - Comprehensive error handling and logging
✅ **20 Plant Species** - Diverse selection covering all space types
✅ **Expandable Design** - Easy to add more plants or criteria

---

## 🔗 Useful Links

- [OpenWeatherMap API](https://openweathermap.org/api)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Hooks](https://react.dev/reference/react)
- [Axios Documentation](https://axios-http.com/)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure backend is running on port 3001
4. Check browser console for frontend errors
5. Check terminal for backend errors

---

Generated: April 18, 2026
Version: 1.0.0
