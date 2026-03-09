import React from "react";
import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", hover = true, onClick, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: "0 20px 40px var(--shadow-lg)" } : undefined}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`bg-(--card) backdrop-blur-sm border border-(--border) rounded-2xl shadow-[0_4px_20px_var(--shadow)] overflow-hidden ${onClick ? "cursor-pointer" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
