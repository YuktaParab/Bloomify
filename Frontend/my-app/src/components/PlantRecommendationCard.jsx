import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Leaf,
  Droplets,
  Sun,
  Thermometer,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

/**
 * Plant Recommendation Card with Step-by-Step Guide
 */
export default function PlantRecommendationCard({ plant, onAddToPlants }) {
  const [expandedSteps, setExpandedSteps] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Soil Preparation",
      description: "Prepare well-draining soil mixed with compost. Use a pot with drainage holes to prevent waterlogging.",
      tips: ["Use 60% garden soil + 40% compost", "Mix in perlite for better drainage", "pH: 6.0-7.0 for most plants"],
    },
    {
      number: 2,
      title: "Seed Selection",
      description: "Choose high-quality seeds or healthy seedlings from a reputable nursery.",
      tips: [
        "Check expiry dates on seed packets",
        "Prefer organic/heirloom varieties",
        "Ensure seeds are not damaged",
      ],
    },
    {
      number: 3,
      title: "Planting Method",
      description: `Plant at appropriate depth. ${plant.name} seeds should be planted ${plant.plantingDepth || "1-2 cm"} deep.`,
      tips: [
        `Plant seeds ${plant.plantingDepth || "1-2 cm"} below soil surface`,
        "Maintain soil moisture but not waterlogged",
        `Space seedlings ${plant.spacing || "15-30"} cm apart`,
      ],
    },
    {
      number: 4,
      title: "Watering Schedule",
      description: plant.wateringGuide || "Water regularly to keep soil moist but not soggy. Adjust based on weather and season.",
      tips: [
        "Water early morning or evening",
        `Water every ${plant.wateringFrequency || "2-3"} days`,
        "Check soil moisture before watering",
      ],
    },
    {
      number: 5,
      title: "Sunlight Requirements",
      description: `This plant needs ${plant.sunlight} with ${plant.lightHours || "6"} hours of light daily.`,
      tips: [
        `Requires ${plant.lightHours || "6"}+ hours of ${plant.sunlight} light`,
        "Afternoon shade helps in hot climates",
        "Rotate plant weekly for even growth",
      ],
    },
    {
      number: 6,
      title: "Maintenance Tips",
      description: "Regular maintenance ensures healthy plant growth and maximum productivity.",
      tips: [
        "Remove dead leaves and stems",
        "Watch for pests and diseases",
        "Apply organic fertilizer monthly",
      ],
    },
    {
      number: 7,
      title: "Harvesting (if applicable)",
      description: plant.harvestingGuide || "Harvest when the plant reaches maturity. Timing varies by plant type.",
      tips: [
        `Harvest after ${plant.daysToMaturity || "60-90"} days`,
        "Pick in the morning for best freshness",
        "Regular harvesting encourages more growth",
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="bg-linear-to-r from-(--primary)/10 to-(--secondary)/10 border-b border-(--border) p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-(--text) mb-1">
              {plant.name}
            </h3>
            <p className="text-sm text-(--text-secondary) mb-3">
              {plant.category} • {plant.difficulty}
            </p>
            <p className="text-sm line-clamp-2 text-(--text-secondary)">
              {plant.description}
            </p>
          </div>
          <div className="text-4xl ml-4">{plant.emoji}</div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-(--text-muted)">{plant.sunlight}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-(--text-muted)">{plant.watering}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Thermometer className="w-4 h-4 text-orange-500" />
            <span className="text-(--text-muted)">
              {plant.temperature}°C
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Leaf className="w-4 h-4 text-green-500" />
            <span className="text-(--text-muted)">
              {plant.daysToMaturity} days
            </span>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="p-6">
        <button
          onClick={() => setExpandedSteps(!expandedSteps)}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-(--border) bg-(--bg-alt) hover:bg-(--bg) transition-colors mb-4"
        >
          <span className="font-semibold text-(--text)">
            Step-by-Step Growing Guide
          </span>
          <motion.div
            animate={{ rotate: expandedSteps ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-(--text-secondary)" />
          </motion.div>
        </button>

        <AnimatePresence>
          {expandedSteps && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-6"
            >
              {steps.map((step, idx) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-l-4 border-(--primary) pl-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-(--primary) text-white flex items-center justify-center font-bold flex-shrink-0 mt-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.05 + 0.1 }}
                    >
                      {step.number}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-(--text) mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-(--text-secondary) mb-2">
                        {step.description}
                      </p>
                      <ul className="space-y-1">
                        {step.tips.map((tip, tipIdx) => (
                          <li
                            key={tipIdx}
                            className="text-xs text-(--text-muted) flex items-start gap-2"
                          >
                            <span className="text-(--primary) mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits & Warnings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {plant.benefits && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-1">
                    Benefits
                  </p>
                  <p className="text-xs text-green-600/80">{plant.benefits}</p>
                </div>
              </div>
            </motion.div>
          )}

          {plant.warnings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-1">
                    Warnings
                  </p>
                  <p className="text-xs text-amber-600/80">{plant.warnings}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Button */}
        <motion.button
          onClick={() => onAddToPlants(plant)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white font-semibold hover:shadow-lg transition-shadow"
        >
          + Add to My Plants
        </motion.button>
      </div>
    </motion.div>
  );
}
