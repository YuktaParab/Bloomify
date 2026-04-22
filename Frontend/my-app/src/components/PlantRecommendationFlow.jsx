import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Loader, AlertCircle, CheckCircle2, Droplets,
  Zap, Leaf, Thermometer, Wind, Sun
} from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

/**
 * PlantRecommendationFlow Component
 * 
 * Orchestrates the plant recommendation workflow:
 * 1. Gets user's geolocation
 * 2. Prompts for optional soil type
 * 3. Sends recommendation request to backend
 * 4. Displays results or error handling
 */
const PlantRecommendationFlow = ({
  spaceAnalysisData,
  userEmail,
  onRecommendationsReceived,
  onError
}) => {
  // State Management
  const [step, setStep] = useState("location"); // location | soil | loading | results | error
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [soilType, setSoilType] = useState([]);
  const [showSoilDialog, setShowSoilDialog] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allowManualCity, setAllowManualCity] = useState(false);
  const [manualCity, setManualCity] = useState("");

  // Soil type options
  const soilOptions = [
    "well-draining",
    "loamy",
    "sandy",
    "clay",
    "peat-based"
  ];

  /**
   * Request user's geolocation using Geolocation API
   */
  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setAllowManualCity(true);
      return;
    }

    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
        setStep("soil");
        console.log(`✓ Location obtained: ${latitude}, ${longitude}`);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        setLocationError(
          error.code === 1
            ? "Permission denied. Please enable location access."
            : "Unable to determine location. You can enter a city manually."
        );
        setAllowManualCity(true);
        setLoading(false);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    );
  }, []);

  /**
   * Get coordinates from city name using reverse geocoding
   * Using Open-Meteo's free geocoding API
   */
  const getCoordsFromCity = useCallback(async (city) => {
    try {
      setLoading(true);
      const response = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
        params: {
          name: city,
          count: 1,
          language: "en",
          format: "json"
        },
        timeout: 5000
      });

      if (response.data.results && response.data.results.length > 0) {
        const { latitude, longitude, name, country } = response.data.results[0];
        setLocation({ latitude, longitude, city: `${name}, ${country}` });
        setLoading(false);
        setStep("soil");
        return true;
      } else {
        setLocationError("City not found. Please try another name.");
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Geocoding error:", error.message);
      setLocationError("Error finding city coordinates. Please try again.");
      setLoading(false);
      return false;
    }
  }, []);

  /**
   * Handle soil type selection
   */
  const handleSoilSelect = (soil) => {
    if (soilType.includes(soil)) {
      setSoilType(soilType.filter(s => s !== soil));
    } else {
      setSoilType([...soilType, soil]);
    }
  };

  /**
   * Send recommendation request to backend
   */
  const sendRecommendationRequest = useCallback(async () => {
    if (!location) {
      setError("Location is required");
      setStep("error");
      return;
    }

    if (!spaceAnalysisData) {
      setError("Space analysis data is missing");
      setStep("error");
      return;
    }

    setStep("loading");
    setLoading(true);
    setError(null);

    try {
      const requestPayload = {
        email: userEmail,
        spaceType: spaceAnalysisData.spaceType,
        sunlightLevel: spaceAnalysisData.sunlightLevel,
        spaceSize: spaceAnalysisData.spaceSize || "medium",
        latitude: location.latitude,
        longitude: location.longitude,
        soilType: soilType.length > 0 ? soilType : null
      };

      console.log("🌿 Sending recommendation request:", requestPayload);

      const response = await axios.post(
        "http://localhost:3001/api/recommend-plants",
        requestPayload,
        { timeout: 15000 }
      );

      if (response.data.success) {
        console.log(`✓ Received ${response.data.plants.length} recommendations`);
        setRecommendations(response.data.plants);
        setWeatherData(response.data.weatherData);
        setStep("results");
        if (onRecommendationsReceived) {
          onRecommendationsReceived(response.data);
        }
      } else {
        throw new Error(response.data.error || "Failed to get recommendations");
      }
    } catch (error) {
      console.error("❌ Recommendation error:", error.message);
      setError(
        error.response?.data?.error || 
        error.message || 
        "Failed to get recommendations. Please try again."
      );
      setStep("error");
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [location, spaceAnalysisData, userEmail, soilType, onRecommendationsReceived, onError]);

  /**
   * Proceed from soil selection to sending request
   */
  const handleProceedToRecommendations = () => {
    setShowSoilDialog(false);
    sendRecommendationRequest();
  };

  /**
   * Retry location request
   */
  const handleRetryLocation = () => {
    setLocationError(null);
    setAllowManualCity(false);
    setManualCity("");
    setStep("location");
    requestGeolocation();
  };

  /**
   * Render Location Request Step
   */
  const renderLocationStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mb-6">
        <MapPin className="w-12 h-12 text-(--primary) mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-(--text) mb-2">
          Enable Location Access
        </h3>
        <p className="text-(--text-secondary)">
          We'll use your location to provide accurate weather data for better recommendations
        </p>
      </div>

      {locationError && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-left">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{locationError}</p>
          </div>
        </div>
      )}

      {allowManualCity && (
        <div className="mb-6 bg-(--bg-secondary) rounded-lg p-4">
          <label className="block text-sm font-medium text-(--text) mb-2">
            Or enter your city name:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              placeholder="e.g., Mumbai, London, Tokyo"
              className="flex-1 px-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)"
            />
            <AnimatedButton
              onClick={() => getCoordsFromCity(manualCity)}
              disabled={!manualCity.trim() || loading}
              className="px-4 py-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Find"}
            </AnimatedButton>
          </div>
        </div>
      )}

      <AnimatedButton
        onClick={requestGeolocation}
        disabled={loading}
        className="w-full md:w-auto"
        variant="primary"
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Detecting Location...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Enable Location
          </>
        )}
      </AnimatedButton>
    </motion.div>
  );

  /**
   * Render Soil Type Selection Step
   */
  const renderSoilStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mb-6">
        <Leaf className="w-12 h-12 text-(--primary) mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-(--text) mb-2">
          Soil Type (Optional)
        </h3>
        <p className="text-(--text-secondary)">
          Select your available soil types for more accurate recommendations
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {soilOptions.map((soil) => (
          <motion.button
            key={soil}
            onClick={() => handleSoilSelect(soil)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg font-medium transition-all ${
              soilType.includes(soil)
                ? "bg-(--primary) text-white shadow-lg"
                : "bg-(--bg-secondary) text-(--text) hover:bg-(--primary)/10"
            }`}
          >
            {soil}
          </motion.button>
        ))}
      </div>

      <div className="text-sm text-(--text-secondary) mb-6">
        {soilType.length > 0 && (
          <p>Selected: {soilType.join(", ")}</p>
        )}
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <AnimatedButton
          onClick={() => setStep("location")}
          variant="secondary"
        >
          Back
        </AnimatedButton>
        <AnimatedButton
          onClick={handleProceedToRecommendations}
          variant="primary"
        >
          Get Recommendations
        </AnimatedButton>
      </div>
    </motion.div>
  );

  /**
   * Render Loading Step
   */
  const renderLoadingStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="mb-6">
        <Loader className="w-12 h-12 text-(--primary) mx-auto animate-spin" />
      </div>
      <h3 className="text-xl font-bold text-(--text) mb-2">
        Analyzing Your Space...
      </h3>
      <p className="text-(--text-secondary)">
        We're combining weather data with your space conditions to find the best plants for you.
      </p>
    </motion.div>
  );

  /**
   * Render Error Step
   */
  const renderErrorStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mb-6">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-(--text) mb-2">
          Something Went Wrong
        </h3>
        <p className="text-(--text-secondary)">
          {error}
        </p>
      </div>

      <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6 text-left">
        <p className="text-red-700 text-sm">
          💡 Try disabling ad blockers or using a different location service. If the problem persists, please try again later.
        </p>
      </div>

      <div className="flex gap-4 justify-center flex-wrap">
        <AnimatedButton
          onClick={handleRetryLocation}
          variant="secondary"
        >
          Retry
        </AnimatedButton>
      </div>
    </motion.div>
  );

  /**
   * Render Results Step - Plant Recommendation Cards
   */
  const renderResultsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Weather Summary */}
      {weatherData && (
        <div className="mb-8 glass-panel rounded-xl p-6 border border-(--primary)/20">
          <div className="flex items-center gap-4 mb-4">
            <Thermometer className="w-6 h-6 text-(--primary)" />
            <div>
              <h4 className="font-semibold text-(--text)">
                {weatherData.city}, {weatherData.country}
              </h4>
              <p className="text-(--text-secondary) text-sm">
                {weatherData.weather} · {weatherData.temperature}°C · {weatherData.humidity}% humidity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-bold text-(--text) mb-6">
          ✨ Top Recommendations for Your Space
        </h3>

        {recommendations.length > 0 ? (
          recommendations.map((plant, index) => (
            <PlantRecommendationCard
              key={plant._id || index}
              plant={plant}
              index={index}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-(--text-secondary) mx-auto mb-2" />
            <p className="text-(--text-secondary)">
              No recommendations available at this time. Please try again.
            </p>
          </div>
        )}
      </div>

      <div className="text-center">
        <AnimatedButton
          onClick={() => setStep("location")}
          variant="secondary"
        >
          Get New Recommendations
        </AnimatedButton>
      </div>
    </motion.div>
  );

  // Render based on current step
  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "location" && renderLocationStep()}
        {step === "soil" && renderSoilStep()}
        {step === "loading" && renderLoadingStep()}
        {step === "error" && renderErrorStep()}
        {step === "results" && renderResultsStep()}
      </AnimatePresence>
    </div>
  );
};

/**
 * PlantRecommendationCard Component
 * Displays individual plant recommendation with scoring explanation
 */
export const PlantRecommendationCard = ({ plant, index }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  // Score color mapping
  const getScoreColor = (score) => {
    if (score >= 8) return "bg-emerald-100 text-emerald-700";
    if (score >= 6) return "bg-blue-100 text-blue-700";
    if (score >= 4) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-700";
  };

  // Score label
  const getScoreLabel = (score) => {
    if (score >= 8) return "Perfect Match";
    if (score >= 6) return "Great Match";
    if (score >= 4) return "Good Match";
    return "Suitable";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-panel rounded-xl p-6 border border-(--primary)/20 hover:border-(--primary)/40 transition-all cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-xl font-bold text-(--text)">
            {index + 1}. {plant.name}
          </h4>
          <p className="text-(--text-secondary) text-sm italic">
            {plant.scientificName}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${getScoreColor(plant.score)}`}>
          {getScoreLabel(plant.score)}
          <br />
          <span className="text-xs">{plant.score}/9</span>
        </div>
      </div>

      {/* Match Reason */}
      <p className="text-(--text-secondary) text-sm mb-4">
        💡 {plant.reason}
      </p>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-xs text-(--text-secondary)">{plant.water_need}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-(--text-secondary)">{plant.sunlight}</span>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-red-500" />
          <span className="text-xs text-(--text-secondary)">
            {plant.temperature_range.min}-{plant.temperature_range.max}°C
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-500" />
          <span className="text-xs text-(--text-secondary)">{plant.maintenance}</span>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-(--border)"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-(--text) mb-1">Watering</p>
                <p className="text-(--text-secondary)">{plant.watering_frequency}</p>
              </div>
              <div>
                <p className="font-semibold text-(--text) mb-1">Growth Rate</p>
                <p className="text-(--text-secondary)">{plant.growth_rate}</p>
              </div>
              <div>
                <p className="font-semibold text-(--text) mb-1">Max Height</p>
                <p className="text-(--text-secondary)">{plant.max_height}</p>
              </div>
              <div>
                <p className="font-semibold text-(--text) mb-1">Toxicity</p>
                <p className="text-(--text-secondary)">{plant.toxicity}</p>
              </div>
              <div className="col-span-2">
                <p className="font-semibold text-(--text) mb-1">Spaces</p>
                <div className="flex flex-wrap gap-2">
                  {plant.space.map((space) => (
                    <span key={space} className="px-2 py-1 bg-(--primary)/10 text-(--primary) rounded text-xs">
                      {space}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-(--text-secondary) text-xs mt-3">
              Click to collapse details
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PlantRecommendationFlow;
