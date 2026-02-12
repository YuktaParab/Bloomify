// ...existing code...
import React, { useState, useRef, useEffect } from "react";
import "./SpacePhotoAnalysis.css";
// ...existing code...
const SpacePhotoAnalysis = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
    };
  }, [image]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setRecommendations([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
      setRecommendations([]);
    }
  };

  const analyzeImage = async () => {
    if (!imageFile) {
      alert("Please add a photo first.");
      return;
    }
    setAnalyzing(true);
    // simple brightness-based heuristic: draw to canvas and sample pixels
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.onload = () => {
      const w = Math.min(300, img.width);
      const h = Math.min(300, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let total = 0;
      // sample every 10th pixel to be fast
      for (let i = 0; i < data.length; i += 40) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // perceived brightness
        total += 0.299 * r + 0.587 * g + 0.114 * b;
      }
      const avg = total / (data.length / 40);
      // threshold chosen experimentally; >130 indicates bright/sunny
      const sunny = avg > 130;
      // Basic recommendations (replace with real model/backend later)
      const sunPlants = [
        { name: "Tomato", desc: "Loves full sun; great for balconies." },
        { name: "Basil", desc: "Fast-growing herb; needs 6+ hrs sun." },
        { name: "Lavender", desc: "Sun-loving, drought tolerant." },
      ];
      const shadePlants = [
        { name: "Peace Lily", desc: "Thrives in low light and indoors." },
        { name: "Pothos", desc: "Excellent for shady corners." },
        { name: "Fern", desc: "Prefers indirect light and humidity." },
      ];
      setTimeout(() => {
        setRecommendations(sunny ? sunPlants : shadePlants);
        setAnalyzing(false);
      }, 700); // faux processing delay for UX
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      setAnalyzing(false);
      alert("Could not analyze the image. Try another photo.");
    };
  };

  return (
    <div className="feature-card space-analysis">
      <h3>📸 Space Photo Analysis</h3>
      <p className="sub">Upload a photo of the balcony or garden where you'd like to grow plants. We'll suggest suitable plants.</p>

      <div
        ref={dropRef}
        className={`upload-drop ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("space-file-input").click()}
        role="button"
      >
        {!image && (
          <div className="placeholder">
            <div className="camera-emoji">🌿</div>
            <div className="hint">Click or drag & drop a photo here</div>
            <small className="tip">Good photos: clear view of space, avoid extreme backlight.</small>
          </div>
        )}

        {image && (
          <div className="preview-wrap">
            <img src={image} alt="Uploaded Space" className="preview-img" />
            <button
              className="change-btn"
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                setImageFile(null);
                setRecommendations([]);
              }}
            >
              Remove
            </button>
          </div>
        )}
        <input id="space-file-input" type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <div className="actions">
        <button className={`analyze-btn ${analyzing ? "loading" : ""}`} onClick={analyzeImage} disabled={analyzing}>
          {analyzing ? "Analyzing…" : "Analyze Space"}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="recommendations">
          <h4>Recommended Plants</h4>
          <div className="cards">
            {recommendations.map((p) => (
              <div key={p.name} className="plant-card">
                <div className="plant-icon">🌱</div>
                <div className="plant-info">
                  <strong>{p.name}</strong>
                  <div className="desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpacePhotoAnalysis;
// ...existing code...