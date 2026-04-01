import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import plantCatalog from "../data/plantCatalog.json";
import VoiceConverter from "./VoiceConverter";
import "./GrowthGuide.css";

const GrowthGuide = () => {
  const { plantName } = useParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedPlant = plantCatalog.find(
      (p) => p.name.toLowerCase() === decodeURIComponent(plantName)?.toLowerCase()
    );
    setPlant(selectedPlant);
    setLoading(false);
  }, [plantName]);

  if (loading) {
    return <div className="growth-guide-loading">Loading...</div>;
  }

  if (!plant) {
    return <div className="growth-guide-error">Plant not found</div>;
  }

  return (
    <div className="growth-guide-container">
      <div className="growth-guide-header">
        <h1>{plant.name}</h1>
        <span className={`difficulty-badge ${plant.difficulty.toLowerCase()}`}>
          {plant.difficulty}
        </span>
        <span className="category-badge">{plant.category}</span>
      </div>

      <div className="plant-details">
        <p className="description">{plant.description}</p>

        <div className="care-info-grid">
          <div className="care-info-item">
            <h3>☀️ Sunlight</h3>
            <p>{plant.sunlight}</p>
          </div>
          <div className="care-info-item">
            <h3>💧 Watering</h3>
            <p>{plant.watering}</p>
          </div>
          <div className="care-info-item">
            <h3>🌱 Soil</h3>
            <p>{plant.soil}</p>
          </div>
          <div className="care-info-item">
            <h3>🌡️ Temperature</h3>
            <p>{plant.temperature}</p>
          </div>
          <div className="care-info-item">
            <h3>⏱️ Growth Time</h3>
            <p>{plant.growthTime}</p>
          </div>
        </div>
      </div>

      <div className="growth-steps-section">
        <h2>How to Grow {plant.name}</h2>
        <div className="growth-steps-list">
          {plant.growthSteps.map((step, index) => (
            <div key={index} className="growth-step-item">
              <div className="step-header">
                <div className="step-number">{index + 1}</div>
                <p className="step-text">{step}</p>
              </div>
              <VoiceConverter text={step} stepNumber={index + 1} />
            </div>
          ))}
        </div>
      </div>

      <div className="growth-tips">
        <h3>💡 Pro Tips</h3>
        <ul>
          <li>Keep a gardening journal to track your plant's progress</li>
          <li>Check soil moisture regularly before watering</li>
          <li>Rotate your plant occasionally for even growth</li>
          <li>Remove dead leaves to encourage new growth</li>
          <li>Be patient - plants grow at their own pace</li>
        </ul>
      </div>
    </div>
  );
};

export default GrowthGuide;
