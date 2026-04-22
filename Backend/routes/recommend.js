/**
 * Recommendation Route - POST /api/recommend-plants
 * 
 * Request Body:
 * {
 *   email: string (required),
 *   spaceType: 'indoor' | 'balcony' | 'terrace' | 'garden' (required),
 *   sunlightLevel: 'low' | 'medium' | 'high' (required),
 *   spaceSize: 'small' | 'medium' | 'large' (optional),
 *   latitude: number (required),
 *   longitude: number (required),
 *   soilType: Array<string> (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   plants: [
 *     {
 *       name: string,
 *       score: number,
 *       reason: string,
 *       water_need: string,
 *       maintenance: string,
 *       ...other plant data
 *     }
 *   ],
 *   weatherData: {
 *     temperature: number,
 *     humidity: number,
 *     weather: string,
 *     city: string
 *   },
 *   timestamp: ISO string
 * }
 */

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const weatherService = require("../services/weatherService");
const recommendationService = require("../services/recommendationService");

const router = express.Router();

// MongoDB configuration
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://0.0.0.0:27017";
const DB_NAME = process.env.MONGODB_DB_NAME || "tinder";

/**
 * POST /api/recommend-plants
 * Get plant recommendations based on space analysis and location
 */
router.post("/recommend-plants", async (req, res) => {
  let client = null;
  
  try {
    // Validate required fields
    const { email, spaceType, sunlightLevel, latitude, longitude, soilType, spaceSize } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: "Email is required" 
      });
    }
    
    if (!spaceType || !sunlightLevel) {
      return res.status(400).json({ 
        success: false, 
        error: "spaceType and sunlightLevel are required" 
      });
    }
    
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "latitude and longitude are required" 
      });
    }
    
    // Validate latitude and longitude values
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ 
        success: false, 
        error: "latitude and longitude must be numbers" 
      });
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid latitude or longitude values" 
      });
    }
    
    // Fetch weather data
    console.log(`📍 Fetching weather for coordinates: ${latitude}, ${longitude}`);
    const weatherData = await weatherService.getWeatherData(latitude, longitude);
    console.log(`✓ Weather data received: ${weatherData.temperature}°C, ${weatherData.humidity}% humidity`);
    
    // Get climate regions based on weather
    const climateRegions = weatherService.getClimateRegions(weatherData);
    console.log(`🌍 Detected climate regions: ${climateRegions.join(", ")}`);
    
    // Connect to MongoDB and fetch plants
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const plantsCollection = db.collection("plants");
    
    // Fetch all plants from database
    const allPlants = await plantsCollection.find({}).toArray();
    console.log(`🌱 Found ${allPlants.length} plants in database`);
    
    if (allPlants.length === 0) {
      console.warn("⚠️ No plants found in database");
      return res.status(404).json({ 
        success: false, 
        error: "No plants available in database. Please seed the database first." 
      });
    }
    
    // Build recommendation criteria
    const criteria = {
      temperature: weatherData.temperature,
      sunlight: sunlightLevel,
      space: spaceType,
      soilTypes: soilType || [],
      climateRegions: climateRegions,
      spaceSize: spaceSize || "medium"
    };
    
    console.log(`\n🎯 Recommendation Criteria:`);
    console.log(`   Temperature: ${criteria.temperature}°C`);
    console.log(`   Sunlight: ${criteria.sunlight}`);
    console.log(`   Space: ${criteria.space}`);
    console.log(`   Climate: ${criteria.climateRegions.join(", ")}`);
    
    // Get recommendations
    let recommendations = recommendationService.getTopRecommendations(allPlants, criteria, 5);
    
    // If not enough recommendations, get alternatives
    if (recommendations.length < 3) {
      console.log(`⚠️ Only ${recommendations.length} recommendations found, getting alternatives...`);
      recommendations = recommendationService.getAlternativeRecommendations(allPlants, criteria, 5);
    }
    
    // Enhance recommendation data
    const enhancedRecommendations = recommendations.map(plant => ({
      _id: plant._id,
      name: plant.name,
      scientificName: plant.scientificName,
      description: plant.description,
      score: plant.score,
      reason: plant.reason,
      water_need: plant.water_need,
      watering_frequency: plant.watering_frequency,
      maintenance: plant.maintenance,
      sunlight: plant.sunlight,
      temperature_range: plant.temperature_range,
      humidity: plant.humidity,
      toxicity: plant.toxicity,
      petFriendly: plant.petFriendly,
      growth_rate: plant.growth_rate,
      max_height: plant.max_height,
      space: plant.space,
      soil: plant.soil
    }));
    
    console.log(`✓ Generated ${enhancedRecommendations.length} recommendations`);
    
    // Log recommendations
    enhancedRecommendations.forEach((plant, idx) => {
      console.log(`   ${idx + 1}. ${plant.name} (Score: ${plant.score})`);
    });
    
    // Save recommendation to history (optional)
    const recommendationsCollection = db.collection("recommendation_history");
    await recommendationsCollection.insertOne({
      email,
      timestamp: new Date(),
      location: { latitude, longitude },
      weatherData: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        weather: weatherData.weather,
        city: weatherData.city
      },
      inputCriteria: criteria,
      recommendations: enhancedRecommendations.map(p => ({
        name: p.name,
        score: p.score
      }))
    });
    
    // Success response
    res.status(200).json({
      success: true,
      plants: enhancedRecommendations,
      weatherData: {
        temperature: weatherData.temperature,
        humidity: weatherData.humidity,
        weather: weatherData.weather,
        city: weatherData.city,
        country: weatherData.country
      },
      criteria: {
        spaceType,
        sunlightLevel,
        climate: climateRegions
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Recommendation API Error:", error.message);
    
    // Handle specific error types
    if (error.message.includes("weather")) {
      return res.status(503).json({
        success: false,
        error: "Unable to fetch weather data. Please try again.",
        fallback: true
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Error generating recommendations",
      details: error.message
    });
    
  } finally {
    if (client) {
      await client.close();
    }
  }
});

/**
 * GET /api/seed-recommendation-plants
 * Seed the database with plant data (one-time setup)
 */
router.post("/seed-recommendation-plants", async (req, res) => {
  let client = null;
  
  try {
    const { plantsData } = require("../seeds/plantsData");
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const plantsCollection = db.collection("plants");
    
    // Check if plants already exist
    const count = await plantsCollection.countDocuments();
    if (count > 0) {
      return res.status(200).json({
        success: true,
        message: "Plants already seeded",
        count: count
      });
    }
    
    // Insert plant data
    const result = await plantsCollection.insertMany(plantsData);
    
    console.log(`✓ Seeded ${result.insertedCount} plants into database`);
    
    res.status(201).json({
      success: true,
      message: "Plants seeded successfully",
      count: result.insertedCount
    });
    
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Error seeding plants",
      details: error.message
    });
    
  } finally {
    if (client) {
      await client.close();
    }
  }
});

/**
 * GET /api/recommendation-history
 * Get user's recommendation history
 */
router.get("/recommendation-history", async (req, res) => {
  let client = null;
  
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }
    
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const historyCollection = db.collection("recommendation_history");
    
    const history = await historyCollection
      .find({ email })
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    res.status(200).json({
      success: true,
      count: history.length,
      history: history
    });
    
  } catch (error) {
    console.error("❌ History retrieval error:", error.message);
    res.status(500).json({
      success: false,
      error: "Error fetching recommendation history"
    });
    
  } finally {
    if (client) {
      await client.close();
    }
  }
});

module.exports = router;
