import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Leaf, Flower, Apple, Leaf as LeafIcon, ArrowRight } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

/**
 * Interactive Plant Type Selection Wizard
 * Helps users choose plant type and preferences before analysis
 */
export default function PlantSelectionWizard({ onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [plantType, setPlantType] = useState(null);
  const [space, setSpace] = useState(null);
  const [sunlight, setSunlight] = useState(null);
  const [water, setWater] = useState(null);

  const plantTypes = [
    {
      id: "vegetables",
      name: "🌽 Vegetables",
      description: "Tomatoes, Peppers, Lettuce",
      icon: "🥬",
      emoji: "🌽",
    },
    {
      id: "fruits",
      name: "🍓 Fruits",
      description: "Strawberries, Blueberries",
      icon: "🍓",
      emoji: "🍓",
    },
    {
      id: "flowers",
      name: "🌸 Flowers",
      description: "Roses, Tulips, Dahlias",
      icon: "🌸",
      emoji: "🌸",
    },
    {
      id: "herbs",
      name: "🌿 Herbs",
      description: "Basil, Mint, Oregano",
      icon: "🌿",
      emoji: "🌿",
    },
  ];

  const spaces = [
    { id: "balcony", name: "🏠 Small Balcony", description: "Limited space" },
    { id: "terrace", name: "🏘️ Terrace", description: "Medium space" },
    { id: "garden", name: "🌳 Garden", description: "Large outdoor space" },
    { id: "indoor", name: "🏡 Indoor", description: "Inside your home" },
  ];

  const sunlightOptions = [
    {
      id: "high",
      name: "☀️ High",
      description: "6+ hours direct sunlight",
    },
    {
      id: "medium",
      name: "🌤️ Medium",
      description: "Bright, indirect light",
    },
    { id: "low", name: "🌙 Low", description: "Shady area" },
  ];

  const waterOptions = [
    { id: "frequent", name: "💧 Frequent", description: "Water often (daily/every 2 days)" },
    {
      id: "moderate",
      name: "💦 Moderate",
      description: "Water regularly (2-3 times/week)",
    },
    {
      id: "minimal",
      name: "🌵 Minimal",
      description: "Water rarely (weekly/bi-weekly)",
    },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else {
      onComplete({
        plantType,
        space,
        sunlight,
        water,
      });
    }
  };

  const canProceed = () => {
    if (step === 1) return plantType;
    if (step === 2) return space;
    if (step === 3) return sunlight;
    if (step === 4) return water;
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-2xl mx-auto"
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-(--text-secondary)">
            Step {step} of 4
          </span>
          <span className="text-xs text-(--text-muted)">{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-(--bg-alt) border border-(--border) overflow-hidden">
          <motion.div
            className="h-full bg-linear-to-r from-(--primary) to-(--secondary)"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Plant Type Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-(--text) mb-2">
              What type of plants interest you?
            </h2>
            <p className="text-(--text-secondary) mb-6">
              Choose your preferred plant category
            </p>

            <div className="grid grid-cols-2 gap-4">
              {plantTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => setPlantType(type.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-6 rounded-2xl border-2 transition-all text-center group ${
                    plantType === type.id
                      ? "border-(--primary) bg-(--primary)/10"
                      : "border-(--border) bg-(--card) hover:border-(--primary)/50"
                  }`}
                >
                  <div className="text-4xl mb-3">{type.emoji}</div>
                  <h3 className="font-semibold text-(--text) mb-1">{type.name}</h3>
                  <p className="text-xs text-(--text-muted)">{type.description}</p>
                  {plantType === type.id && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-(--primary)"
                      layoutId="selection"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Space Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-(--text) mb-2">
              What's your available space?
            </h2>
            <p className="text-(--text-secondary) mb-6">
              This helps us recommend appropriately-sized plants
            </p>

            <div className="space-y-3">
              {spaces.map((s) => (
                <motion.button
                  key={s.id}
                  onClick={() => setSpace(s.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    space === s.id
                      ? "border-(--primary) bg-(--primary)/10"
                      : "border-(--border) bg-(--card) hover:border-(--primary)/50"
                  }`}
                >
                  <div>
                    <h3 className="font-semibold text-(--text)">{s.name}</h3>
                    <p className="text-sm text-(--text-muted)">{s.description}</p>
                  </div>
                  {space === s.id && (
                    <motion.div className="w-6 h-6 rounded-full bg-(--primary) flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Sunlight Selection */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-(--text) mb-2">
              How much sunlight does your space get?
            </h2>
            <p className="text-(--text-secondary) mb-6">
              Most plants need at least 4-6 hours of light
            </p>

            <div className="space-y-3">
              {sunlightOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setSunlight(option.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    sunlight === option.id
                      ? "border-(--primary) bg-(--primary)/10"
                      : "border-(--border) bg-(--card) hover:border-(--primary)/50"
                  }`}
                >
                  <div>
                    <h3 className="font-semibold text-(--text)">{option.name}</h3>
                    <p className="text-sm text-(--text-muted)">
                      {option.description}
                    </p>
                  </div>
                  {sunlight === option.id && (
                    <motion.div className="w-6 h-6 rounded-full bg-(--primary) flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 4: Water Selection */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-(--text) mb-2">
              How often can you water?
            </h2>
            <p className="text-(--text-secondary) mb-6">
              Choose based on your availability and commitment
            </p>

            <div className="space-y-3">
              {waterOptions.map((option) => (
                <motion.button
                  key={option.id}
                  onClick={() => setWater(option.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                    water === option.id
                      ? "border-(--primary) bg-(--primary)/10"
                      : "border-(--border) bg-(--card) hover:border-(--primary)/50"
                  }`}
                >
                  <div>
                    <h3 className="font-semibold text-(--text)">{option.name}</h3>
                    <p className="text-sm text-(--text-muted)">
                      {option.description}
                    </p>
                  </div>
                  {water === option.id && (
                    <motion.div className="w-6 h-6 rounded-full bg-(--primary) flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <motion.button
            onClick={() => setStep(step - 1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-6 py-3 rounded-xl border border-(--border) text-(--text) font-medium hover:bg-(--bg-alt) transition-colors"
          >
            Back
          </motion.button>
        )}

        <AnimatedButton
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1"
          size="md"
        >
          {step === 4 ? (
            <span className="flex items-center justify-center gap-2">
              Complete <ArrowRight className="w-4 h-4" />
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </AnimatedButton>

        {step === 1 && (
          <motion.button
            onClick={onSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 rounded-xl border border-(--border) text-(--text-secondary) font-medium hover:bg-(--bg-alt) transition-colors"
          >
            Skip
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
