import React, { useState, useRef, useEffect } from "react";
import { loadPlantData, getPlantsBySunlight } from "../utils/loadPlantData";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, PenTool, Leaf, AlertTriangle, CheckCircle2, RotateCcw, X, Sprout, Sun, Droplets, BarChart3 } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";
const SpacePhotoAnalysis = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [inputMode, setInputMode] = useState("capture"); // "capture", "upload", or "manual"
  const [manualInputs, setManualInputs] = useState({
    spaceSize: "",
    sunlight: "",
    location: "",
    ventilation: ""
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [plantData, setPlantData] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    loadPlantData().then(setPlantData).catch(console.error);
  }, []);

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image);
      stopCamera();
    };
  }, [image]);

  const startCamera = async () => {
    try {
      console.log("🎥 Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log("✅ Camera stream obtained:", stream);
      streamRef.current = stream;
      setCameraActive(true);
      
      // Wait for next render cycle to ensure video element exists
      setTimeout(() => {
        if (videoRef.current) {
          console.log("📹 Setting video source...");
          videoRef.current.srcObject = stream;
          
          // Ensure video plays
          videoRef.current.onloadedmetadata = () => {
            console.log("🎬 Video metadata loaded, starting playback...");
            videoRef.current.play()
              .then(() => console.log("▶️ Video playing successfully"))
              .catch(err => console.error("❌ Video play error:", err));
          };
        } else {
          console.error("❌ Video element not found after state update");
        }
      }, 100);
      
    } catch (err) {
      console.error("❌ Camera access denied:", err);
      alert("Unable to access camera. Please check permissions or use Upload Image instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    console.log("📸 Capture button clicked!");
    
    if (!videoRef.current) {
      console.error("Video reference not found");
      alert("Video not ready. Please try again.");
      return;
    }
    
    const video = videoRef.current;
    console.log("Video dimensions:", video.videoWidth, "x", video.videoHeight);
    console.log("Video ready state:", video.readyState);
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("Camera is loading. Please wait a moment and try again.");
      return;
    }
    
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL("image/png");
      setCapturedPhoto(imageData);
      
      // Convert to File object
      canvas.toBlob((blob) => {
        const file = new File([blob], "captured-space.png", { type: "image/png" });
        setImageFile(file);
        setImage(imageData);
        console.log("✅ Image captured successfully");
      });
      
      stopCamera();
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to capture image. Please try again.");
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setImage(null);
    setImageFile(null);
    setRecommendations([]);
    startCamera();
  };

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
    if (inputMode === "manual") {
      // Manual input mode - validate form
      if (!manualInputs.spaceSize || !manualInputs.sunlight || !manualInputs.location) {
        alert("Please fill in all required fields.");
        return;
      }
      analyzeManualInputs();
      return;
    }

    // Photo mode (capture or upload)
    if (!imageFile) {
      alert("Please capture or upload a photo first, or switch to manual input.");
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Send image to backend for analysis
      const formData = new FormData();
      formData.append("image", imageFile);
      
      console.log("📤 Sending request to backend:", "http://localhost:3000/analyze-space");
      
      const response = await fetch("http://localhost:3000/analyze-space", {
        method: "POST",
        body: formData,
      });
      
      console.log("📥 Response status:", response.status, response.statusText);
      
      const result = await response.json();
      console.log("📊 Response data:", result);
      
      if (!response.ok) {
        // Handle person detection or other errors
        if (result.error === "person_detected") {
          setTimeout(() => {
            setRecommendations([
              { 
                name: "Invalid Image - Person Detected", 
                desc: result.message || "⚠️ Person/body detected in image. Please upload a photo of the space only.",
                error: true
              }
            ]);
            setAnalyzing(false);
          }, 700);
          return;
        }

        // Handle invalid scene (not a space image - car, landscape, etc.)
        if (result.error === "invalid_scene") {
          setTimeout(() => {
            setRecommendations([
              { 
                name: "Invalid Image - Not a Space Photo", 
                desc: result.message || "❌ This doesn't appear to be a space photo. Please upload an indoor/outdoor living space.",
                error: true
              }
            ]);
            setAnalyzing(false);
          }, 700);
          return;
        }
        
        throw new Error(result.error || "Analysis failed");
      }
      
      // Process successful result
      if (result.success) {
        const plants = result.recommended_plants.map(plant => ({
          name: plant.name,
          desc: plant.desc,
          difficulty: plant.difficulty,
          watering: plant.watering,
          lightNeed: plant.light_tolerance,
          spaceScore: result.space_score,
          lighting: result.lighting.description
        }));
        
        setTimeout(() => {
          setRecommendations(plants);
          setAnalyzing(false);
          
          // Show space score and summary
          if (result.space_score) {
            console.log(`🌿 Space Green Score: ${result.space_score}/100`);
            console.log(`📊 ${result.analysis_summary}`);
          }
        }, 700);
        return; // Exit successfully
      }
      
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalyzing(false);
      
      // Show error instead of silently falling back to client-side analysis
      // Client-side analysis cannot validate image type and would recommend plants for any image
      setRecommendations([
        {
          name: "Analysis Failed",
          desc: "❌ Could not analyze the image. Please make sure the server is running and try again, or use 'Manual Input' to describe your environment instead.",
          error: true
        }
      ]);
    }
  };
  
  const analyzeManualInputs = () => {
    setAnalyzing(true);
    setTimeout(() => {
      generateRecommendations(manualInputs.sunlight);
    }, 700);
  };

  const generateRecommendations = (sunlight) => {
    const selectedPlants = getPlantsBySunlight(plantData, sunlight);

    setTimeout(() => {
      setRecommendations(selectedPlants.length > 0 ? selectedPlants : [
        { name: "No plants found", desc: "Could not find matching plants. Try a different sunlight level.", error: true }
      ]);
      setAnalyzing(false);
    }, 700);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 text-(--primary) text-sm font-medium mb-4">
            <Camera className="w-4 h-4" /> Space Analysis
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-(--text) mb-3">
            Analyze Your Space
          </h1>
          <p className="text-(--text-muted)">Capture a photo, upload an image, or describe your space manually</p>
        </motion.div>

        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {[
            { key: "capture", icon: <Camera className="w-4 h-4" />, label: "Capture Photo" },
            { key: "upload", icon: <Upload className="w-4 h-4" />, label: "Upload Image" },
            { key: "manual", icon: <PenTool className="w-4 h-4" />, label: "Manual Input" },
          ].map((mode) => (
            <button
              key={mode.key}
              onClick={() => { setInputMode(mode.key); setRecommendations([]); stopCamera(); }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                inputMode === mode.key
                  ? "bg-(--primary) text-white shadow-lg shadow-(--primary)/25"
                  : "bg-(--card) border border-(--border) text-(--text-secondary) hover:border-(--primary)/50"
              }`}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </motion.div>

        {/* Camera Capture Mode */}
        <AnimatePresence mode="wait">
          {inputMode === "capture" && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-(--card) border border-(--border) rounded-2xl p-6 mb-6"
            >
              {!cameraActive && !capturedPhoto && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-(--primary)/10 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-(--primary)" />
                  </div>
                  <p className="text-(--text-muted) mb-4">Take a live photo of your space</p>
                  <AnimatedButton onClick={startCamera}>Open Camera</AnimatedButton>
                </div>
              )}

              {cameraActive && (
                <div className="relative">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" />
                  <div className="flex justify-center gap-3 mt-4">
                    <AnimatedButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); captureImage(); }}>
                      <Camera className="w-4 h-4" /> Capture
                    </AnimatedButton>
                    <AnimatedButton variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); stopCamera(); }}>
                      Cancel
                    </AnimatedButton>
                  </div>
                </div>
              )}

              {capturedPhoto && (
                <div>
                  <img src={capturedPhoto} alt="Captured Space" className="w-full rounded-xl" />
                  <div className="flex justify-center gap-3 mt-4">
                    <AnimatedButton variant="outline" onClick={retakePhoto}>
                      <RotateCcw className="w-4 h-4" /> Retake
                    </AnimatedButton>
                    <AnimatedButton onClick={() => {}}>
                      <CheckCircle2 className="w-4 h-4" /> Use This Photo
                    </AnimatedButton>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Upload Mode */}
          {inputMode === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div
                ref={dropRef}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("space-file-input").click()}
                role="button"
                className={`bg-(--card) border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragOver ? "border-(--primary) bg-(--primary)/5" : "border-(--border) hover:border-(--primary)/50"
                }`}
              >
                {!image ? (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-(--primary)/10 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-(--primary)" />
                    </div>
                    <p className="text-(--text) font-medium mb-1">Click or drag & drop a photo here</p>
                    <p className="text-xs text-(--text-muted)">Good photos: clear view of space, natural lighting, avoid documents.</p>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={image} alt="Uploaded Space" className="max-h-80 mx-auto rounded-xl" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImage(null); setImageFile(null); setRecommendations([]); }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input id="space-file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </motion.div>
          )}

          {/* Manual Input Mode */}
          {inputMode === "manual" && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-(--card) border border-(--border) rounded-2xl p-6 mb-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Space Size *", key: "spaceSize", options: [{ v: "", l: "Select space size" }, { v: "small", l: "Small (Desk/Window sill)" }, { v: "medium", l: "Medium (Balcony/Corner)" }, { v: "large", l: "Large (Garden/Room)" }] },
                  { label: "Sunlight Level *", key: "sunlight", options: [{ v: "", l: "Select sunlight level" }, { v: "high", l: "High (6+ hours direct sun)" }, { v: "medium", l: "Medium (Bright indirect)" }, { v: "low", l: "Low (Shade/Minimal)" }] },
                  { label: "Location *", key: "location", options: [{ v: "", l: "Select location" }, { v: "indoor", l: "Indoor" }, { v: "outdoor", l: "Outdoor" }, { v: "balcony", l: "Balcony/Semi-outdoor" }] },
                  { label: "Ventilation", key: "ventilation", options: [{ v: "", l: "Select ventilation (optional)" }, { v: "good", l: "Good" }, { v: "moderate", l: "Moderate" }, { v: "poor", l: "Poor" }] },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">{field.label}</label>
                    <select
                      value={manualInputs[field.key]}
                      onChange={(e) => setManualInputs({ ...manualInputs, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
                    >
                      {field.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <AnimatedButton size="lg" onClick={analyzeImage} disabled={analyzing}>
            {analyzing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Sprout className="w-4 h-4" /> Analyze Space</span>
            )}
          </AnimatedButton>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <h3 className="text-xl font-bold text-(--text) mb-4 flex items-center gap-2">
                {recommendations[0]?.error ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {recommendations[0]?.error ? "Analysis Result" : "Recommended Plants"}
              </h3>

              {/* Space Score */}
              {!recommendations[0]?.error && recommendations[0]?.spaceScore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-linear-to-r from-(--primary)/10 to-(--accent)/10 border border-(--primary)/20 rounded-2xl p-6 mb-6 flex items-center gap-6"
                >
                  <div className="relative w-20 h-20 shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${(recommendations[0].spaceScore / 100) * 100.5} 100.5`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-black text-(--primary)">{recommendations[0].spaceScore}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-(--text) flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-(--primary)" /> Space Green Score
                    </h4>
                    <p className="text-sm text-(--text-muted) mt-1">{recommendations[0].lighting || "Your space has been analyzed"}</p>
                  </div>
                </motion.div>
              )}

              {/* Plant Cards */}
              <div className="grid gap-4">
                {recommendations.map((p, idx) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                      p.error
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-(--card) border-(--border) hover:shadow-lg hover:shadow-(--primary)/5"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.error ? "bg-red-500/10" : "bg-(--primary)/10"}`}>
                      {p.error ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Leaf className="w-5 h-5 text-(--primary)" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-(--text)">{p.name}</h4>
                      <p className="text-xs text-(--text-muted) mt-1">{p.desc}</p>
                      {!p.error && (
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                            <BarChart3 className="w-3 h-3" /> {p.difficulty}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
                            <Droplets className="w-3 h-3" /> {p.watering}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                            <Sun className="w-3 h-3" /> {p.lightNeed}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
};

export default SpacePhotoAnalysis;