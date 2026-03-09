import React from "react";
import { motion } from "framer-motion";

const variants = {
  primary: "bg-linear-to-r from-(--primary) to-(--secondary) text-white shadow-md hover:shadow-lg",
  secondary: "bg-(--bg-alt) text-(--text) border border-(--border) hover:border-(--primary) hover:text-(--primary)",
  outline: "bg-transparent text-(--primary) border-2 border-(--primary) hover:bg-(--primary) hover:text-white",
  ghost: "bg-transparent text-(--text-secondary) hover:bg-(--bg-alt) hover:text-(--text)",
  danger: "bg-(--error) text-white hover:opacity-90",
};

const sizes = {
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-6 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export default function AnimatedButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
