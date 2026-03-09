import React, { useMemo } from "react";
import { motion } from "framer-motion";

function FloatingLeaf({ delay, x, size, duration }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: "-5%", fontSize: size }}
      animate={{
        y: ["0vh", "105vh"],
        x: [0, Math.random() > 0.5 ? 30 : -30, 0],
        rotate: [0, 360],
        opacity: [0, 0.6, 0.6, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {["🍃", "🌿", "☘️", "🍀"][Math.floor(Math.random() * 4)]}
    </motion.div>
  );
}

export default function LeafParticles({ count = 8 }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        delay: Math.random() * 10,
        x: Math.random() * 100,
        size: `${14 + Math.random() * 16}px`,
        duration: 12 + Math.random() * 10,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {leaves.map((leaf) => (
        <FloatingLeaf key={leaf.id} {...leaf} />
      ))}
    </div>
  );
}
