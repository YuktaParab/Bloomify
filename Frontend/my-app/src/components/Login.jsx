import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Mail, Lock, ArrowRight, UserPlus, KeyRound } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        alert("Login Successful!");
        navigate("/home");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  return (
    <div className="min-h-screen bg-(--bg) flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-(--primary)/8 blur-[160px] animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-(--accent)/8 blur-[140px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-(--secondary)/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] relative z-10"
      >
        {/* Glassmorphism card */}
        <div
          className="rounded-[28px] border border-(--glass-border) shadow-2xl backdrop-blur-xl"
          style={{
            background: "color-mix(in srgb, var(--card) 85%, transparent)",
            boxShadow: "0 8px 32px var(--shadow), 0 1px 0 inset rgba(255,255,255,0.1)",
            padding: "40px",
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
            className="w-[72px] h-[72px] mx-auto mb-7 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
          >
            <Leaf className="w-9 h-9 text-white drop-shadow-sm" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-[28px] font-extrabold text-center text-(--text) mb-2 tracking-tight"
          >
            Welcome Back
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[15px] text-center text-(--text-muted) mb-9 font-medium"
          >
            Sign in to your Bloomify account
          </motion.p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email field */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-semibold text-(--text-secondary) mb-2 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "email" ? "text-(--primary)" : "text-(--text-muted)"
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-(--bg-alt) border border-(--border) text-(--text) text-[15px] placeholder:text-(--text-muted)/60 focus:outline-none focus:border-(--primary) focus:ring-[3px] focus:ring-(--primary)/15 hover:border-(--primary)/40 transition-all duration-300 shadow-sm"
                />
              </div>
            </motion.div>

            {/* Password field */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-semibold text-(--text-secondary) mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                    focusedField === "password" ? "text-(--primary)" : "text-(--text-muted)"
                  }`}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-(--bg-alt) border border-(--border) text-(--text) text-[15px] placeholder:text-(--text-muted)/60 focus:outline-none focus:border-(--primary) focus:ring-[3px] focus:ring-(--primary)/15 hover:border-(--primary)/40 transition-all duration-300 shadow-sm"
                />
              </div>
            </motion.div>

            {/* Sign In button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-3"
            >
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full px-8 py-16 rounded-2xl text-white font-bold text-[16px] tracking-wide flex items-center justify-center gap-4 shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  background: "var(--gradient-primary)",
                  boxShadow: "0 4px 20px var(--shadow-lg)",
                  minHeight: "160px",
                }}
              >
                Sign In
                <ArrowRight className="w-8 h-8" />
              </motion.button>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-(--border)" />
              <span className="text-xs font-medium text-(--text-muted) uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-(--border)" />
            </div>

            {/* Secondary actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, borderColor: "var(--primary)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/forgot-password")}
                className="flex-1 py-3 rounded-2xl bg-(--bg-alt) border border-(--border) text-(--text-secondary) text-sm font-semibold flex items-center justify-center gap-2 hover:text-(--primary) hover:border-(--primary)/50 transition-all duration-300"
              >
                <KeyRound className="w-4 h-4" />
                Forgot?
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, borderColor: "var(--primary)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/signup")}
                className="flex-1 py-3 rounded-2xl bg-(--bg-alt) border border-(--border) text-(--text-secondary) text-sm font-semibold flex items-center justify-center gap-2 hover:text-(--primary) hover:border-(--primary)/50 transition-all duration-300"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
