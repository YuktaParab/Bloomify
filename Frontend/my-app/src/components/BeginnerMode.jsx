// components/BeginnerMode.jsx
import React, { useState, useEffect } from "react";
import SpacePhotoAnalysis from "./SpacePhotoAnalysis";
import CareReminders from "./CareReminders";
import StarterPlantKits from "./StarterPlantKits";
import WeatherSunlightTips from "./WeatherSunlightTips";
import "./Styles.css";

const BeginnerMode = ({ onBack, defaultFeature }) => {
  const [activeFeature, setActiveFeature] = useState(defaultFeature || null);

  // Automatically open a feature if passed from Home
  useEffect(() => {
    if (defaultFeature) {
      setActiveFeature(defaultFeature);
    }
  }, [defaultFeature]);

  return (
    <div className="beginner-container">
      <h2 className="beginner-title">🌼 Beginner Mode</h2>
      <p className="beginner-desc">
        Perfect for balcony gardening beginners! Choose a feature to explore personalized guidance.
      </p>

      <div className="beginner-buttons">
        <button
          onClick={() => setActiveFeature("photo")}
          className={`green-btn ${activeFeature === "photo" ? "active" : ""}`}
        >
          📸 Upload Space Photo
        </button>
        <button
          onClick={() => setActiveFeature("reminders")}
          className={`gray-btn ${activeFeature === "reminders" ? "active" : ""}`}
        >
          ⏰ Set Care Reminders
        </button>
        <button
          onClick={() => setActiveFeature("kits")}
          className={`gray-btn ${activeFeature === "kits" ? "active" : ""}`}
        >
          🌱 Browse Starter Kits
        </button>
        <button
          onClick={() => setActiveFeature("weather")}
          className={`gray-btn ${activeFeature === "weather" ? "active" : ""}`}
        >
          ☀ Weather & Sunlight Tips
        </button>
      </div>

      <div className="beginner-feature">
        {activeFeature === "photo" && <SpacePhotoAnalysis />}
        {activeFeature === "reminders" && <CareReminders />}
        {activeFeature === "kits" && <StarterPlantKits />}
        {activeFeature === "weather" && <WeatherSunlightTips />}
        {!activeFeature && (
          <p className="select-message">✨ Select a feature to begin!</p>
        )}
      </div>

      <button onClick={onBack} className="back-btn">
        ← Back
      </button>
    </div>
  );
};

export default BeginnerMode;
