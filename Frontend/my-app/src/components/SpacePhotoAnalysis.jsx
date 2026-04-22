import React, { useState, useRef, useEffect, useCallback } from "react";
import { loadPlantData, getPlantsBySunlight } from "../utils/loadPlantData";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, Upload, PenTool, Leaf, AlertTriangle, CheckCircle2, RotateCcw, 
  X, Sprout, Sun, Droplets, BarChart3, Lock, Sparkles, Wand2, ArrowRight, ChevronRight
} from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";
import UpgradeModal from "./UpgradeModal";
import PlantRecommendationFlow from "./PlantRecommendationFlow";
import { auth } from "./Firebase";
import { useNavigate } from "react-router-dom";

const SpacePhotoAnalysis = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [inputMode, setInputMode] = useState("capture"); 
  const [manualInputs, setManualInputs] = useState({
    spaceSize: "",
    sunlight: "",
    location: "",
    ventilation: ""
  });
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [plantData, setPlantData] = useState([]);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  
  // NEW STATE: Space analysis data for recommendation flow
  const [spaceAnalysisData, setSpaceAnalysisData] = useState(null);
  const [showRecommendationFlow, setShowRecommendationFlow] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      if (!user?.email) return;
      const url = `http://localhost:3001/subscription/${user.email}`;
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok) {
        setSubscription(data);
      }
      setSubscriptionLoading(false);
    } catch (error) {
      setSubscription({
        email: user?.email,
        tier: "Beginner",
        subscriptionStatus: "trial",
        trialUsesRemaining: 10,
        canAccessSpaceAnalysis: true
      });
      setSubscriptionLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) fetchSubscriptionStatus();
  }, [user, fetchSubscriptionStatus]);

  useEffect(() => {
    loadPlantData().then(setPlantData).catch(console.error);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      alert("Unable to access camera. Please check permissions or use Upload instead.");
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
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    setCapturedPhoto(imageData);
    canvas.toBlob((blob) => {
      setImageFile(new File([blob], "captured-space.png", { type: "image/png" }));
      setImage(imageData);
    });
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImage(URL.createObjectURL(file));
  };

  const analyzeImage = async () => {
    if (!subscription || !user) return;
    if (inputMode !== "manual" && !subscription?.canAccessSpaceAnalysis) {
      setShowUpgradeModal(true);
      return;
    }
    if (inputMode === "manual") {
      if (!manualInputs.spaceSize || !manualInputs.sunlight || !manualInputs.location) return;
      setAnalyzing(true);
      setTimeout(() => {
        const selected = getPlantsBySunlight(plantData, manualInputs.sunlight);
        setRecommendations(selected);
        
        // Capture space analysis data for recommendation flow
        setSpaceAnalysisData({
          spaceType: manualInputs.location || "indoor",
          sunlightLevel: manualInputs.sunlight,
          spaceSize: manualInputs.spaceSize
        });
        setShowRecommendationFlow(true);
        
        setAnalyzing(false);
      }, 1000);
      return;
    }
    if (!imageFile) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("email", user.email);
      const response = await fetch("http://localhost:3001/analyze-space", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // Extract space analysis data from result
        const analysisData = {
          spaceType: result.spaceType || "indoor",
          sunlightLevel: result.sunlightLevel || "medium",
          spaceSize: result.spaceSize || "medium"
        };
        
        setSpaceAnalysisData(analysisData);
        setShowRecommendationFlow(true);
        
        // Also display the initial recommendations
        setRecommendations(result.recommended_plants.map(p => ({
          ...p,
          spaceScore: result.space_score,
          lighting: result.lighting.description
        })));
        fetchSubscriptionStatus();
      } else {
        setRecommendations([{ name: "Analysis Failed", desc: result.message || "Failed to analyze image", error: true }]);
      }
    } catch (e) {
      setRecommendations([{ name: "Server Error", desc: "Backend not available", error: true }]);
    }
    setAnalyzing(false);
  };

  return (
    <PageContainer>
      <section className="section-container pt-32 pb-24 min-h-screen">
        
        <div className="max-w-3xl mx-auto text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-black uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} /> AI-Powered Vision
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-(--text) mb-6 tracking-tighter"
          >
            Smart Space Analysis
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-(--text-secondary) leading-relaxed"
          >
            Transform your living environment. Our AI analyzes lighting, dimensions, and climate to match you with the perfect botanical companions.
          </motion.p>
        </div>

        {subscription && (
          <div className="max-w-4xl mx-auto mb-10 px-4">
            <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 border border-(--primary)/20">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${subscription.tier === "Advanced" ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}`}>
                  <Lock size={18} />
                </div>
                <div>
                  <div className="text-sm font-black text-(--text)">
                    {subscription.tier === "Advanced" ? "Premium Access Pool" : "Standard Trial Pool"}
                  </div>
                  <div className="text-xs text-(--text-muted) font-bold">
                    {subscription.trialUsesRemaining} of 10 insights remaining
                  </div>
                </div>
              </div>
              {subscription.tier !== "Advanced" && (
                <button onClick={() => navigate("/pricing")} className="px-4 py-2 bg-(--text) text-white text-xs font-black rounded-lg hover:bg-black transition-colors uppercase tracking-widest">
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1400px] mx-auto px-4">
          
          <div className="lg:col-span-12 xl:col-span-7">
            <div className="premium-card p-1 items-stretch">
              <div className="flex p-1.5 bg-(--bg-alt) rounded-[20px] mb-8">
                {["capture", "upload", "manual"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setInputMode(mode); setRecommendations([]); stopCamera(); }}
                    className={`flex-1 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                      inputMode === mode 
                        ? "bg-white text-(--primary) shadow-sm border border-(--primary)/10" 
                        : "text-(--text-muted) hover:text-(--text)"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="px-6 pb-8">
                <AnimatePresence mode="wait">
                  {inputMode === "capture" && (
                    <motion.div key="cap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center min-h-[400px] flex flex-col justify-center">
                      {!cameraActive && !capturedPhoto ? (
                        <div className="py-12">
                          <Camera size={64} className="mx-auto text-(--text-muted) mb-8 opacity-20" />
                          <AnimatedButton size="lg" onClick={startCamera}>Activate AI Lens</AnimatedButton>
                        </div>
                      ) : cameraActive ? (
                        <div className="relative rounded-3xl overflow-hidden bg-black aspect-video max-w-2xl mx-auto shadow-2xl">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                            <button onClick={captureImage} className="w-16 h-16 rounded-full bg-white border-8 border-white/30 flex items-center justify-center hover:scale-110 transition-transform">
                              <div className="w-10 h-10 rounded-full bg-(--primary)" />
                            </button>
                            <button onClick={stopCamera} className="px-6 py-2 bg-black/50 backdrop-blur-md rounded-xl text-white font-bold text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="max-w-2xl mx-auto">
                          <img src={capturedPhoto} className="w-full rounded-3xl shadow-premium border border-(--border-light)" alt="Capture" />
                          <div className="mt-8 flex justify-center gap-4">
                            <AnimatedButton variant="secondary" onClick={() => setCapturedPhoto(null)}>Retake</AnimatedButton>
                            <AnimatedButton onClick={analyzeImage} disabled={analyzing}>
                              {analyzing ? "Analyzing Space..." : "Confirm & Analyze"}
                            </AnimatedButton>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {inputMode === "upload" && (
                    <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center min-h-[400px] flex flex-col justify-center">
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange({ target: { files: e.dataTransfer.files } }); }}
                        onClick={() => document.getElementById("space-file").click()}
                        className={`border-[2.5px] border-dashed rounded-[32px] p-16 transition-all cursor-pointer ${dragOver ? "border-(--primary) bg-(--primary)/5" : "border-(--border) hover:border-(--primary)/40"}`}
                      >
                         {!image ? (
                           <>
                             <Upload size={48} className="mx-auto text-(--primary) mb-6 opacity-40" />
                             <h4 className="text-xl font-bold mb-2">Select Space Image</h4>
                             <p className="text-xs text-(--text-muted) font-bold uppercase tracking-wider">Drag-and-drop or Browse</p>
                           </>
                         ) : (
                           <div className="relative">
                             <img src={image} className="max-h-[400px] mx-auto rounded-2xl" alt="Upload" />
                             <button onClick={(e) => {e.stopPropagation(); setImage(null);}} className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full"><X size={20}/></button>
                           </div>
                         )}
                         <input id="space-file" type="file" className="hidden" onChange={handleFileChange} />
                      </div>
                      {image && (
                         <div className="mt-8">
                           <AnimatedButton size="lg" onClick={analyzeImage} disabled={analyzing}>
                             {analyzing ? "Reading Space Data..." : "Run AI Analysis"}
                           </AnimatedButton>
                         </div>
                      )}
                    </motion.div>
                  )}

                  {inputMode === "manual" && (
                     <motion.div key="man" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[400px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                           {[
                             { label: "Environment Size", key: "spaceSize", options: ["Small", "Medium", "Large"] },
                             { label: "Exposure Level", key: "sunlight", options: ["high", "medium", "low"] },
                             { label: "Specific Location", key: "location", options: ["indoor", "outdoor", "balcony"] }
                           ].map(f => (
                              <div key={f.key}>
                                 <label className="block text-xs font-black uppercase tracking-widest text-(--text-muted) mb-3">{f.label}</label>
                                 <select 
                                   className="w-full p-4 rounded-xl bg-(--bg-alt) border border-(--border-light) font-bold text-sm focus:border-(--primary) outline-none"
                                   onChange={e => setManualInputs({...manualInputs, [f.key]: e.target.value})}
                                 >
                                    <option value="">Choose Option</option>
                                    {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                                 </select>
                              </div>
                           ))}
                        </div>
                        <div className="mt-12 text-center">
                           <AnimatedButton size="lg" onClick={analyzeImage} disabled={analyzing}>
                              {analyzing ? "Processing Inputs..." : "Predict Species"}
                           </AnimatedButton>
                        </div>
                     </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-5">
             <div className="space-y-6 sticky top-24">
                <AnimatePresence mode="wait">
                  
                  {/* Show Recommendation Flow if space analysis was successful */}
                  {showRecommendationFlow && spaceAnalysisData && (
                    <motion.div
                      key="recommendation-flow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="premium-card p-8 rounded-2xl border-2 border-(--primary)/30"
                    >
                      <div className="mb-6 pb-4 border-b border-(--border)">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-(--primary)" />
                          <h3 className="text-lg font-black text-(--text)">
                            Space Analysis Complete ✓
                          </h3>
                        </div>
                        <p className="text-sm text-(--text-secondary)">
                          Now discovering perfect plants for your {spaceAnalysisData.spaceType}...
                        </p>
                      </div>
                      
                      <PlantRecommendationFlow
                        spaceAnalysisData={spaceAnalysisData}
                        userEmail={user?.email}
                        onRecommendationsReceived={(data) => {
                          console.log("✓ Plant recommendations received:", data);
                        }}
                        onError={(error) => {
                          console.error("❌ Recommendation error:", error);
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Original Space Analysis Recommendations */}
                  {!showRecommendationFlow && recommendations.length > 0 ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                       {!recommendations[0].error && recommendations[0].spaceScore && (
                          <div className="premium-card bg-linear-to-br from-(--text) to-black text-white border-0 pt-10">
                              <div className="flex items-center gap-6 mb-8">
                                 <div className="w-24 h-24 rounded-full border-[6px] border-(--primary) flex items-center justify-center text-3xl font-black shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                    {recommendations[0].spaceScore}
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="text-xl font-black mb-1">Growth Score</h4>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Optimized for Green Life</p>
                                 </div>
                              </div>
                              <p className="text-sm text-white/70 leading-relaxed font-medium pb-4">
                                 {recommendations[0].lighting}
                              </p>
                          </div>
                       )}

                       <div className="space-y-4">
                          {recommendations.filter(p => !p.error).map((p, i) => (
                             <motion.div 
                               key={i} 
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: i * 0.1 }}
                               className="glass-panel p-5 rounded-2xl flex items-center gap-5 group hover:border-(--primary)/50 transition-colors"
                             >
                                <div className="w-12 h-12 rounded-xl bg-(--primary)/10 flex items-center justify-center text-(--primary) group-hover:bg-(--primary) group-hover:text-white transition-all">
                                   <Leaf size={20} />
                                </div>
                                <div className="flex-1">
                                   <div className="font-black text-(--text)">{p.name || p.common_name}</div>
                                   <div className="text-xs text-(--text-muted) font-bold uppercase tracking-tight">{p.watering || "Moderate"} Water • {p.difficulty || "Beginner"}</div>
                                </div>
                                <button onClick={() => navigate("/products-shop")} className="p-2 rounded-lg bg-(--bg-alt) hover:bg-(--primary)/10 transition-colors">
                                   <ArrowRight size={18} />
                                </button>
                             </motion.div>
                          ))}

                          {recommendations[0].error && (
                             <div className="premium-card border-red-500/20 bg-red-500/5 p-10 text-center">
                                <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                                <h4 className="text-lg font-black text-red-900 mb-2">{recommendations[0].name}</h4>
                                <p className="text-sm text-red-700 font-medium">{recommendations[0].desc}</p>
                             </div>
                          )}
                       </div>
                    </motion.div>
                  ) : !showRecommendationFlow ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-card p-16 text-center border-dashed opacity-50 flex flex-col items-center justify-center min-h-[400px]">
                        <Wand2 size={48} className="text-(--text-muted) mb-6" />
                        <h4 className="text-lg font-black text-(--text-muted)">Waiting for Analysis</h4>
                        <p className="text-sm text-(--text-muted) max-w-[200px] mx-auto mt-2 font-medium">Use the AI Tool to generate space insights</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
             </div>
          </div>
        </div>

      </section>

      <UpgradeModal 
         isOpen={showUpgradeModal} 
         onClose={() => setShowUpgradeModal(false)}
         usesRemaining={subscription?.trialUsesRemaining}
      />
    </PageContainer>
  );
};

export default SpacePhotoAnalysis;