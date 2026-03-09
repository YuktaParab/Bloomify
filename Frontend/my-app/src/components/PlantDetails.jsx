import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadPlantData } from "../utils/loadPlantData";
import { auth } from "./Firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sun, Moon, Cloud, Filter, Plus, X, Droplets, Thermometer, BarChart3, Home, Sprout, Leaf } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";

const PlantDetails = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [search, setSearch] = useState("");
  const [sunFilter, setSunFilter] = useState("");
  const [diffFilter, setDiffFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadPlantData().then((data) => {
      setPlants(data);
      setFilteredPlants(data);
    });
  }, []);

  useEffect(() => {
    let result = plants;
    if (search) {
      result = result.filter((p) =>
        p.plant_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sunFilter) result = result.filter((p) => p.sunlight === sunFilter);
    if (diffFilter) result = result.filter((p) => p.difficulty === diffFilter);
    if (typeFilter) result = result.filter((p) => p.indoor_outdoor === typeFilter);
    setFilteredPlants(result);
  }, [search, sunFilter, diffFilter, typeFilter, plants]);

  const addToMyPlants = async (plant) => {
    const user = auth.currentUser;
    if (!user) {
      setToast("Please login to add plants to your collection");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/my-plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          plant_name: plant.plant_name,
          sunlight: plant.sunlight,
          watering: plant.watering,
          difficulty: plant.difficulty,
          temperature_min_c: plant.temperature_min_c,
          temperature_max_c: plant.temperature_max_c,
          description: plant.description,
        }),
      });

      if (res.status === 409) {
        setToast("Already in your collection!");
      } else if (res.ok) {
        setToast(`${plant.plant_name} added to My Plants!`);
      } else {
        setToast("Failed to add plant");
      }
    } catch {
      setToast("Server error — is the backend running?");
    }
    setTimeout(() => setToast(""), 3000);
  };

  const getSunlightIcon = (level) => {
    if (level === "high") return <Sun className="w-4 h-4 text-amber-500" />;
    if (level === "medium") return <Cloud className="w-4 h-4 text-yellow-400" />;
    return <Moon className="w-4 h-4 text-indigo-400" />;
  };

  const getDifficultyColor = (d) => {
    if (d === "Easy") return "bg-emerald-500";
    if (d === "Medium") return "bg-amber-500";
    return "bg-red-500";
  };

  const selectStyle = "px-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all cursor-pointer";

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 text-(--primary) text-sm font-medium mb-4">
            <Sprout className="w-4 h-4" /> Plant Catalog
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-(--text) mb-3">
            Discover Your Perfect Plant
          </h1>
          <p className="text-(--text-muted) text-lg">
            Explore <span className="text-(--primary) font-semibold">{plants.length}</span> plants with detailed care information
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-(--card) border border-(--border) rounded-2xl p-5 mb-8 shadow-sm"
        >
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
              <input
                type="text"
                placeholder="Search plants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
              />
            </div>
            <select value={sunFilter} onChange={(e) => setSunFilter(e.target.value)} className={selectStyle}>
              <option value="">All Sunlight</option>
              <option value="low">Low Light</option>
              <option value="medium">Medium Light</option>
              <option value="high">High Light</option>
            </select>
            <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className={selectStyle}>
              <option value="">All Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectStyle}>
              <option value="">Indoor/Outdoor</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <p className="text-xs text-(--text-muted) mt-3">Showing {filteredPlants.length} of {plants.length} plants</p>
        </motion.div>

        {/* Plant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPlants.map((plant, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.5) }}
              whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(76,175,80,0.15)" }}
              onClick={() => setSelectedPlant(plant)}
              className="bg-(--card) border border-(--border) rounded-2xl p-5 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-(--primary)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  {getSunlightIcon(plant.sunlight)}
                  <span className={`text-xs font-semibold text-white px-2.5 py-1 rounded-full ${getDifficultyColor(plant.difficulty)}`}>
                    {plant.difficulty}
                  </span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-(--primary)/10 flex items-center justify-center mb-3">
                  <Leaf className="w-7 h-7 text-(--primary)" />
                </div>
                <h3 className="text-base font-bold text-(--text) mb-1 group-hover:text-(--primary) transition-colors">{plant.plant_name}</h3>
                <p className="text-xs text-(--text-muted) mb-3 line-clamp-2">{plant.description?.substring(0, 80)}...</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">
                    <Droplets className="w-3 h-3" /> {plant.watering}
                  </span>
                  <span className="text-xs bg-(--bg-alt) text-(--text-secondary) px-2 py-1 rounded-full">
                    {plant.indoor_outdoor}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPlants.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Search className="w-12 h-12 text-(--text-muted) mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-(--text) mb-2">No plants found</h3>
            <p className="text-(--text-muted)">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>

      {/* Plant Detail Modal */}
      <AnimatePresence>
        {selectedPlant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPlant(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--card) border border-(--border) rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-(--text)">{selectedPlant.plant_name}</h2>
                    <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded-full ${getDifficultyColor(selectedPlant.difficulty)}`}>
                      {selectedPlant.difficulty}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedPlant(null)} className="p-2 rounded-xl hover:bg-(--bg-alt) transition-colors">
                  <X className="w-5 h-5 text-(--text-muted)" />
                </button>
              </div>

              <p className="text-sm text-(--text-secondary) mb-6 leading-relaxed">{selectedPlant.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: <Droplets className="w-4 h-4 text-blue-500" />, label: "Watering", value: selectedPlant.watering },
                  { icon: getSunlightIcon(selectedPlant.sunlight), label: "Sunlight", value: `${selectedPlant.sunlight} (${selectedPlant.light_hours}+ hrs)` },
                  { icon: <Thermometer className="w-4 h-4 text-orange-500" />, label: "Temperature", value: `${selectedPlant.temperature_min_c}°C – ${selectedPlant.temperature_max_c}°C` },
                  { icon: <BarChart3 className="w-4 h-4 text-purple-500" />, label: "Difficulty", value: selectedPlant.difficulty },
                  { icon: <Droplets className="w-4 h-4 text-cyan-500" />, label: "Humidity", value: selectedPlant.humidity },
                  { icon: <Home className="w-4 h-4 text-emerald-500" />, label: "Type", value: selectedPlant.indoor_outdoor },
                ].map((info, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-(--bg-alt) border border-(--border)">
                    <div className="w-8 h-8 rounded-lg bg-(--card) flex items-center justify-center shrink-0">{info.icon}</div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">{info.label}</p>
                      <p className="text-xs font-medium text-(--text)">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <AnimatedButton size="md" className="flex-1" onClick={() => addToMyPlants(selectedPlant)}>
                  <Plus className="w-4 h-4" /> Add to My Plants
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="md" onClick={() => setSelectedPlant(null)}>
                  Close
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-(--card) border border-(--border) text-(--text) px-6 py-3 rounded-2xl shadow-xl text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default PlantDetails;
