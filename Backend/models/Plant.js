/**
 * Plant Schema for MongoDB
 * 
 * Stores comprehensive plant information including:
 * - Environmental requirements (temperature, humidity, sunlight)
 * - Space compatibility
 * - Care requirements
 * - Geographic suitability
 */

const PlantSchema = {
  _id: "MongoDB ObjectId (auto-generated)",
  
  // Basic Information
  name: "String - Plant common name (required)",
  scientificName: "String - Plant scientific name",
  description: "String - Plant description and characteristics",
  
  // Environmental Requirements
  temperature_range: {
    min: "Number - Minimum temperature in Celsius",
    max: "Number - Maximum temperature in Celsius"
  },
  humidity: {
    min: "Number - Minimum humidity percentage",
    max: "Number - Maximum humidity percentage",
    preference: "String - 'dry' | 'moderate' | 'high'"
  },
  
  // Sunlight Requirements
  sunlight: "String - 'low' | 'medium' | 'high' (required)",
  
  // Space Compatibility
  space: ["String - Array of compatible spaces: 'indoor', 'balcony', 'terrace', 'garden' (required)"],
  spaceSize: "String - 'small' | 'medium' | 'large'",
  
  // Soil Requirements
  soil: ["String - Array of compatible soil types: 'well-draining', 'loamy', 'sandy', 'clay' (required)"],
  
  // Care Requirements
  water_need: "String - 'low' | 'moderate' | 'high'",
  watering_frequency: "String - e.g. 'every 3 days' or 'weekly'",
  maintenance: "String - 'low' | 'medium' | 'high'",
  
  // Geographic Distribution
  region: ["String - Array of suitable geographic regions: 'tropical', 'subtropical', 'temperate', 'arid'"],
  
  // Additional Metadata
  hardiness_zone: "String - USDA hardiness zone",
  growth_rate: "String - 'slow' | 'medium' | 'fast'",
  max_height: "String - e.g. '30 cm' or '1.5 m'",
  toxicity: "String - 'toxic' | 'safe' | 'unknown'",
  petFriendly: "Boolean - Safe for pets",
  
  // Performance Scoring Factors
  scoreWeights: {
    temperature: "Number - Default: 2",
    humidity: "Number - Default: 1",
    sunlight: "Number - Default: 2",
    soil: "Number - Default: 2",
    space: "Number - Default: 2",
    region: "Number - Default: 1"
  }
};

// Example Document Structure
const examplePlant = {
  _id: "ObjectId",
  name: "Monstera Deliciosa",
  scientificName: "Monstera deliciosa",
  description: "A popular indoor plant known for its large, split leaves.",
  temperature_range: { min: 16, max: 27 },
  humidity: { min: 50, max: 80, preference: "moderate" },
  sunlight: "medium",
  space: ["indoor", "balcony"],
  spaceSize: "medium",
  soil: ["well-draining", "loamy"],
  water_need: "moderate",
  watering_frequency: "every 1-2 weeks",
  maintenance: "low",
  region: ["tropical", "subtropical"],
  hardiness_zone: "10-12",
  growth_rate: "fast",
  max_height: "3-4 m",
  toxicity: "toxic",
  petFriendly: false
};

module.exports = { PlantSchema, examplePlant };
