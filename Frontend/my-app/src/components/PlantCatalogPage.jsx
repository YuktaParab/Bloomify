import React, { useState, useEffect } from "react";
import { loadPlantData } from "../utils/loadPlantData";
import { Search, Leaf, Award, BookOpen, Volume2, Square } from "lucide-react";
import "./PlantCatalogPage.css";

const PlantCatalogPage = () => {
  const [search, setSearch] = useState("");
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlant, setExpandedPlant] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [speakingStep, setSpeakingStep] = useState(null);

  const languages = [
    { code: "en-US", name: "English" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "it-IT", name: "Italian" },
    { code: "pt-BR", name: "Portuguese" },
    { code: "ja-JP", name: "Japanese" },
    { code: "zh-CN", name: "Chinese" },
    { code: "hi-IN", name: "Hindi" },
  ];

  // Generate growth steps based on plant characteristics
  const generateGrowthSteps = (plant) => {
    const steps = [];
    const difficulty = plant.difficulty?.toLowerCase() || "easy";
    const sunlight = plant.sunlight?.toLowerCase() || "medium";
    const watering = plant.watering?.toLowerCase() || "weekly";

    steps.push(`Start with high-quality seeds or healthy cuttings of ${plant.plant_name}.`);

    if (difficulty === "easy") {
      steps.push("Fill a pot with well-draining potting soil mixed with compost.");
    } else {
      steps.push("Prepare specialized soil mix based on plant type for optimal growth.");
    }

    steps.push(`Plant seeds at appropriate depth based on size, typically half an inch.`);
    steps.push(`Keep soil consistently moist but not waterlogged for germination.`);
    steps.push(`Place in a location with ${sunlight} sunlight and warm temperature.`);
    steps.push(`Wait for seedlings to emerge, usually within 1-3 weeks.`);
    steps.push(`Once sprouted, thin seedlings to prevent overcrowding.`);
    steps.push(
      `Water ${watering} and maintain ${plant.humidity || "moderate"} humidity levels. Watch for pests and diseases.`
    );
    steps.push(
      `After 4-8 weeks, transfer to larger pots or garden bed. Ensure temperature stays between ${plant.temperature_min_c}°C and ${plant.temperature_max_c}°C.`
    );
    steps.push(
      `Continue regular care with ${plant.light_hours || "6"}+ hours of ${sunlight} light daily.`
    );

    return steps;
  };

  const handleSpeak = (text, stepIndex) => {
    if (speakingStep === `${expandedPlant}-${stepIndex}`) {
      window.speechSynthesis.cancel();
      setSpeakingStep(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setSpeakingStep(`${expandedPlant}-${stepIndex}`);
    utterance.onend = () => setSpeakingStep(null);
    utterance.onerror = () => setSpeakingStep(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    loadPlantData().then((data) => {
      setPlants(data || []);
      setLoading(false);
    });
  }, []);

  const filteredPlants = plants.filter((plant) =>
    plant.plant_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="plant-catalog-page">
      <div className="catalog-header">
        <div className="header-content">
          <h1>
            <Leaf size={32} /> Plant Growing Guide
          </h1>
          <p>Complete step-by-step guides with voice instructions</p>
        </div>

        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search plants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="plants-grid">
        {filteredPlants.map((plant, idx) => {
          const growthSteps = generateGrowthSteps(plant);
          const isExpanded = expandedPlant === idx;

          return (
            <div key={idx} className="plant-card">
              <div className="card-header">
                <h2>{plant.plant_name}</h2>
                <div className="badges">
                  <span className={`badge difficulty ${plant.difficulty?.toLowerCase()}`}>
                    {plant.difficulty}
                  </span>
                  <span className="badge category">{plant.indoor_outdoor}</span>
                </div>
              </div>

              <p className="description">{plant.description?.substring(0, 100)}...</p>

              <div className="quick-info">
                <div className="info-item">
                  <span className="label">☀️ Sunlight:</span>
                  <span className="value">{plant.sunlight}</span>
                </div>
                <div className="info-item">
                  <span className="label">💧 Watering:</span>
                  <span className="value">{plant.watering}</span>
                </div>
                <div className="info-item">
                  <span className="label">🌡️ Temp:</span>
                  <span className="value">
                    {plant.temperature_min_c}°C - {plant.temperature_max_c}°C
                  </span>
                </div>
              </div>

              {/* Expandable Growth Guide */}
              <button
                onClick={() => setExpandedPlant(isExpanded ? null : idx)}
                className="view-guide-btn"
              >
                <BookOpen size={18} />
                {isExpanded ? "Hide Guide" : "View Growing Guide"}
              </button>

              {isExpanded && (
                <div className="growth-guide-expanded">
                  <div className="language-selector-header">
                    <label>Audio Language:</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="language-select"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="growth-steps">
                    {growthSteps.map((step, stepIdx) => (
                      <div key={stepIdx} className="step-item">
                        <div className="step-content">
                          <div className="step-number">{stepIdx + 1}</div>
                          <p className="step-text">{step}</p>
                        </div>
                        <button
                          onClick={() => handleSpeak(step, stepIdx)}
                          className={`speak-btn ${
                            speakingStep === `${idx}-${stepIdx}` ? "speaking" : ""
                          }`}
                          title={
                            speakingStep === `${idx}-${stepIdx}`
                              ? "Stop"
                              : "Listen"
                          }
                        >
                          {speakingStep === `${idx}-${stepIdx}` ? (
                            <Square size={16} />
                          ) : (
                            <Volume2 size={16} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading {plants.length} plants...</p>
        </div>
      ) : filteredPlants.length === 0 ? (
        <div className="no-results">
          <Award size={48} />
          <p>No plants found matching "{search}"</p>
        </div>
      ) : (
        <div className="results-info">
          Showing {filteredPlants.length} of {plants.length} plants
        </div>
      )}
    </div>
  );
};

export default PlantCatalogPage;
