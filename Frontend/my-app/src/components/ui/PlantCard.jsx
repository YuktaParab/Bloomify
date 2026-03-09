import React from "react";
import { motion } from "framer-motion";
import { Droplets, Sun, CloudSun, Moon, Gauge } from "lucide-react";

const diffColors = {
  Easy: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  Medium: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  Hard: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
};

const sunIcons = {
  high: <Sun className="w-4 h-4 text-amber-500" />,
  medium: <CloudSun className="w-4 h-4 text-yellow-500" />,
  low: <Moon className="w-4 h-4 text-indigo-400" />,
};

export default function PlantCard({ plant, onClick, onAdd, index = 0 }) {
  const diff = diffColors[plant.difficulty] || diffColors.Easy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6, boxShadow: "0 20px 40px var(--shadow-lg)" }}
      onClick={onClick}
      className="group relative bg-(--card) border border-(--border) rounded-2xl p-5 cursor-pointer overflow-hidden transition-all duration-300"
    >
      {/* Glow overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-(--primary)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header row */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-1.5">
          {sunIcons[plant.sunlight] || sunIcons.medium}
          <span className="text-xs text-(--text-muted)">{plant.sunlight}</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${diff.bg} ${diff.text}`}>
          {plant.difficulty}
        </span>
      </div>

      {/* Plant icon */}
      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-linear-to-br from-(--accent-light) to-(--bg-alt) flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 relative z-10">
        🌱
      </div>

      {/* Name */}
      <h3 className="text-center font-bold text-(--text) mb-1 relative z-10 text-sm">
        {plant.plant_name}
      </h3>

      {/* Description */}
      <p className="text-center text-xs text-(--text-muted) mb-3 line-clamp-2 relative z-10">
        {plant.description?.substring(0, 80)}...
      </p>

      {/* Tags */}
      <div className="flex items-center justify-center gap-2 relative z-10">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-(--bg-alt) text-xs text-(--text-secondary)">
          <Droplets className="w-3 h-3" /> {plant.watering}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-(--bg-alt) text-xs text-(--text-secondary)">
          {plant.indoor_outdoor}
        </span>
      </div>

      {/* Add button (appears on hover) */}
      {onAdd && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onAdd(plant);
          }}
          className="mt-3 w-full py-2 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10"
        >
          + Add to My Plants
        </motion.button>
      )}
    </motion.div>
  );
}
