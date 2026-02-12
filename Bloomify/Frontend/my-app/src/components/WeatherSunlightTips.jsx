import React, { useState, useEffect } from "react";
import "./WeatherSunlightTips.css";

const SAMPLE = {
  temp: 30,
  condition: "Sunny",
  emoji: "☀",
  uv: 7,
  humidity: 40,
  windKph: 12,
};

const plantHints = {
  Sunny: "Perfect for sunlight-loving plants like basil and jasmine.",
  Cloudy: "Good for tolerant plants like pothos and peace lily (avoid long sun exposure).",
  Rain: "Nice for moisture-loving plants; watch drainage.",
  ClearNight: "Cool nights favor herbs and leafy greens.",
};

const WeatherSunlightTips = () => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(SAMPLE);
  const [tip, setTip] = useState(plantHints.Sunny);

  useEffect(() => {
    // simulate fetching current weather (replace with real API later)
    setLoading(true);
    const t = setTimeout(() => {
      setWeather(SAMPLE);
      setTip(plantHints[SAMPLE.condition] || plantHints.Sunny);
      setLoading(false);
    }, 650);
    return () => clearTimeout(t);
  }, []);

  const refresh = () => {
    setLoading(true);
    // simulate slightly different values for nicer UX
    const next = {
      ...SAMPLE,
      temp: SAMPLE.temp + (Math.random() > 0.5 ? 0 : -1),
      uv: SAMPLE.uv + (Math.random() > 0.6 ? 1 : 0),
    };
    setTimeout(() => {
      setWeather(next);
      setTip(plantHints[next.condition] || plantHints.Sunny);
      setLoading(false);
    }, 700);
  };

  const uvLevel = (uv) => {
    if (uv >= 8) return { label: "High", className: "uv high" };
    if (uv >= 5) return { label: "Moderate", className: "uv moderate" };
    return { label: "Low", className: "uv low" };
  };

  const uv = uvLevel(weather.uv);

  return (
    <div className="feature-card weather-card">
      <header className="wc-head">
        <div>
          <h3>☀ Weather & Sunlight Tips</h3>
          <p className="sub">Get guidance based on current weather conditions.</p>
        </div>
        <div className="wc-actions">
          <button className="refresh" onClick={refresh} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <div className="wc-main">
        <div className={`wc-emoji ${loading ? "loading" : ""}`}>{weather.emoji}</div>

        <div className="wc-temp">
          <div className="temp-value">{loading ? "—" : `${weather.temp}°C`}</div>
          <div className="cond">{loading ? "Loading…" : `${weather.condition}`}</div>
        </div>

        <div className="wc-stats">
          <div className="stat">
            <div className={uv.className}>{loading ? "—" : `${uv.label}`}</div>
            <div className="stat-label">UV index • {loading ? "—" : weather.uv}</div>
          </div>
          <div className="stat">
            <div className="stat-value">{loading ? "—" : `${weather.humidity}%`}</div>
            <div className="stat-label">Humidity</div>
          </div>
          <div className="stat">
            <div className="stat-value">{loading ? "—" : `${weather.windKph} kph`}</div>
            <div className="stat-label">Wind</div>
          </div>
        </div>
      </div>

      <div className="wc-tip">
        <strong>Today:</strong> {loading ? "Updating…" : ` ${weather.emoji} ${weather.temp}°C - ${weather.condition}`}
        <div className="plant-tip">{loading ? "" : tip}</div>
      </div>

      <div className="wc-suggestions">
        <h4>Suggested plants for today</h4>
        <div className="suggest-list">
          {weather.condition === "Sunny" ? (
            <>
              <span className="pill">Basil</span>
              <span className="pill">Jasmine</span>
              <span className="pill">Lavender</span>
            </>
          ) : (
            <>
              <span className="pill">Pothos</span>
              <span className="pill">Peace Lily</span>
              <span className="pill">Fern</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherSunlightTips;
