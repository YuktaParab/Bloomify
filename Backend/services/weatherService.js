/**
 * Weather Service - OpenWeatherMap Integration
 * Fetches weather data based on latitude and longitude
 * Returns temperature, humidity, and weather conditions
 */

const axios = require("axios");

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Fetch weather data from OpenWeatherMap API
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {Promise<Object>} Weather data including temperature and humidity
 */
async function getWeatherData(latitude, longitude) {
  try {
    // If no API key, return default data immediately
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "your_openweathermap_api_key_here") {
      console.warn("⚠️ OpenWeatherMap API key not configured. Using default weather data.");
      return {
        temperature: 22,
        feelsLike: 22,
        humidity: 65,
        pressure: 1013,
        weather: "Unknown",
        description: "Default weather (API key not configured)",
        windSpeed: 0,
        cloudiness: 50,
        sunrise: new Date(),
        sunset: new Date(),
        country: "UNKNOWN",
        city: "Location",
        apiError: true,
        errorMessage: "API key not configured - using defaults"
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.status === 200 && response.data) {
      const weatherData = {
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        pressure: response.data.main.pressure,
        weather: response.data.weather[0]?.main || "Unknown",
        description: response.data.weather[0]?.description || "Unknown",
        windSpeed: Math.round(response.data.wind.speed * 10) / 10,
        cloudiness: response.data.clouds.all,
        sunrise: new Date(response.data.sys.sunrise * 1000),
        sunset: new Date(response.data.sys.sunset * 1000),
        country: response.data.sys.country,
        city: response.data.name
      };
      
      return weatherData;
    }
  } catch (error) {
    console.error("Weather API Error:", error.message);
    
    // Return default weather data if API fails
    return {
      temperature: 20,
      feelsLike: 20,
      humidity: 60,
      pressure: 1013,
      weather: "Unknown",
      description: "Unable to fetch weather",
      windSpeed: 0,
      cloudiness: 50,
      apiError: true,
      errorMessage: error.message
    };
  }
}

/**
 * Determine temperature region based on temperature
 * @param {number} temperature - Temperature in Celsius
 * @returns {string} Temperature region category
 */
function getTemperatureRegion(temperature) {
  if (temperature < 10) return "cold";
  if (temperature < 18) return "cool";
  if (temperature < 25) return "temperate";
  if (temperature < 32) return "warm";
  return "hot";
}

/**
 * Determine climate region based on weather data
 * @param {Object} weatherData - Weather data object
 * @returns {Array<string>} Array of applicable climate regions
 */
function getClimateRegions(weatherData) {
  const regions = [];
  const { temperature, humidity, description } = weatherData;
  
  // Temperature-based regions
  if (temperature > 25) {
    regions.push("tropical");
  }
  if (temperature > 15 && temperature < 30 && humidity < 70) {
    regions.push("subtropical");
  }
  if (temperature < 20) {
    regions.push("temperate");
  }
  if (humidity < 40 || description.toLowerCase().includes("dry")) {
    regions.push("arid");
  }
  
  return regions.length > 0 ? regions : ["temperate"];
}

module.exports = {
  getWeatherData,
  getTemperatureRegion,
  getClimateRegions
};
