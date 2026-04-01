import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf, BookOpen, Sprout, Star,
  ArrowRight, Sparkles, TreePine, Sun, Droplets, Play, ShoppingCart, Store
} from "lucide-react";
import PageContainer from "./layout/PageContainer";
import GlassCard from "./ui/GlassCard";
import AnimatedButton from "./ui/AnimatedButton";
import "./Home.css";

const Plant3D = lazy(() => import("./ui/Plant3D"));

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
  const navigate = useNavigate();

  const textList = [
    "Grow Your Green Space",
    "Smart Plant Care with AI",
    "Your Garden Companion",
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(120);

  useEffect(() => {
    const currentText = textList[textIndex];
    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length + 1));
        setSpeed(120);
        if (displayText === currentText) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        setSpeed(70);
        if (displayText === "") {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % textList.length);
        }
      }
    }, speed);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayText, isDeleting, textIndex, speed]);

  const features = [
    {
      icon: <Sprout className="w-6 h-6 text-white" />,
      illustration: "🌱",
      title: "Smart Plant Guidance",
      desc: "AI-powered recommendations to help you grow healthier plants with eco-friendly practices.",
      gradient: "from-emerald-500 to-green-600",
      glow: "rgba(16, 185, 129, 0.15)",
      path: "/plant-guide",
    },
    {
      icon: <Sun className="w-6 h-6 text-white" />,
      illustration: "📷",
      title: "Space Analysis",
      desc: "Upload photos of your space and get personalized plant suggestions based on light and climate.",
      gradient: "from-green-500 to-teal-500",
      glow: "rgba(34, 197, 94, 0.15)",
      path: "/space-analysis",
    },
    {
      icon: <Droplets className="w-6 h-6 text-white" />,
      illustration: "💧",
      title: "Care Reminders",
      desc: "Never forget to water your plants with intelligent care schedules and seasonal guidance.",
      gradient: "from-teal-500 to-cyan-500",
      glow: "rgba(20, 184, 166, 0.15)",
      path: "/care-guide",
    },
    {
      icon: <TreePine className="w-6 h-6 text-white" />,
      illustration: "📚",
      title: "Plant Encyclopedia",
      desc: "Browse 100+ plants with detailed care instructions, growth tips, and companion planting info.",
      gradient: "from-cyan-500 to-emerald-500",
      glow: "rgba(6, 182, 212, 0.15)",
      path: "/plant-catalog",
    },
    {
      icon: <Leaf className="w-6 h-6 text-white" />,
      illustration: "🪴",
      title: "My Plants Dashboard",
      desc: "Track your plant collection, monitor growth progress, and manage your personal garden.",
      gradient: "from-emerald-400 to-green-500",
      glow: "rgba(52, 211, 153, 0.15)",
      path: "/my-plants",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-white" />,
      illustration: "🧰",
      title: "Starter Kits",
      desc: "Curated beginner-friendly plant kits to kickstart your gardening journey with confidence.",
      gradient: "from-green-400 to-teal-500",
      glow: "rgba(74, 222, 128, 0.15)",
      path: "/starter-kits",
    },
    {
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      illustration: "🛒",
      title: "Plant Shop",
      desc: "Browse and buy quality plants, seeds, soil, tools, and gardening supplies. Free shipping available!",
      gradient: "from-amber-500 to-orange-500",
      glow: "rgba(245, 158, 11, 0.15)",
      path: "/products-shop",
    },
    {
      icon: <Store className="w-6 h-6 text-white" />,
      illustration: "🏪",
      title: "Sell Your Plants",
      desc: "Start your own plant marketplace store and sell cuttings, seeds, or surplus plants to fellow gardeners.",
      gradient: "from-rose-500 to-pink-500",
      glow: "rgba(244, 63, 94, 0.15)",
      path: "/seller-dashboard",
    },
  ];

  const testimonials = [
    {
      text: "Bloomify transformed my balcony into a mini garden! The AI recommendations were spot on.",
      name: "Sarah Mitchell",
      location: "New York",
      avatar: "https://i.pravatar.cc/100?img=12",
    },
    {
      text: "I can finally keep plants alive thanks to Bloomify's care reminders and seasonal tips!",
      name: "Marcus Lee",
      location: "San Francisco",
      avatar: "https://i.pravatar.cc/100?img=5",
    },
    {
      text: "Perfect guidance for every season. My indoor garden has never looked better.",
      name: "Priya Sharma",
      location: "Mumbai",
      avatar: "https://i.pravatar.cc/100?img=32",
    },
  ];

  return (
    <PageContainer>

      {/* ══════ HERO SECTION ══════ */}
      <section className="section-panel hero-section relative overflow-hidden" style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
        {/* Background glow */}
        <div className="hero-glow" />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left — Text */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[520px]" style={{ marginLeft: '100px' }}>
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-(--primary)/8 border border-(--primary)/15 text-(--primary) text-sm font-medium mb-10"
              >
                <Sparkles className="w-4 h-4" />
                Your Smart Plant Companion
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold text-(--text) leading-[1.08] mb-8 tracking-tight whitespace-nowrap"
              >
                {displayText}
                <span className="inline-block w-[3px] h-[0.85em] bg-(--primary) ml-1.5 rounded-full animate-pulse align-middle" />
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-base sm:text-[1.1rem] text-(--text-secondary) max-w-[460px] mb-14 leading-[1.75]"
              >
                Bloomify helps you grow healthier plants with AI-powered
                recommendations, smart care reminders, and a beautiful plant
                encyclopedia — all in one place.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-6 mb-16">
                <AnimatedButton size="lg" onClick={() => navigate("/space-analysis")}>
                  Get Started <ArrowRight className="w-5 h-5" />
                </AnimatedButton>
                <AnimatedButton variant="outline" size="lg" onClick={() => navigate("/care-guide")}>
                  Learn More
                </AnimatedButton>
              </motion.div>

              <motion.div variants={fadeUp} custom={4} className="flex items-center gap-0">
                {[
                  { value: "100+", label: "Plants" },
                  { value: "AI", label: "Powered" },
                  { value: "Free", label: "Trial Available" },
                ].map((stat, idx) => (
                  <div key={stat.label} className={`flex-1 ${idx !== 0 ? "border-l border-(--border) pl-8" : ""} ${idx !== 2 ? "pr-8" : ""}`}>
                    <div className="text-2xl font-extrabold text-(--primary)">{stat.value}</div>
                    <div className="text-xs text-(--text-muted) mt-1.5 uppercase tracking-wider font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — 3D Plant Model */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              className="hidden lg:flex items-center justify-end"
              style={{ height: '500px', marginRight: '-5rem' }}
            >
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center text-7xl animate-pulse">
                    🌿
                  </div>
                }
              >
                <Plant3D />
              </Suspense>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════ FEATURES SECTION ══════ */}
      <section className="section-panel bg-(--bg-alt) py-20 sm:py-24">
        <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-10 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-12 sm:mb-14"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-sm font-semibold text-(--primary) uppercase tracking-widest mb-5"
            >
              Features
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-(--text) mb-5"
            >
              Everything You Need to Grow
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-(--text-muted) max-w-xl mx-auto text-base sm:text-[1.05rem] leading-relaxed"
            >
              Powerful tools and smart features to make plant care simple, fun, and effective.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                className="group cursor-pointer"
                onClick={() => item.path && navigate(item.path)}
              >
                <div
                  className="relative h-full min-h-[220px] rounded-2xl border border-(--border) bg-(--card) backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-(--primary)/30 group-hover:shadow-2xl"
                  style={{
                    padding: "32px",
                    boxShadow: "0 4px 24px var(--shadow)",
                  }}
                >
                  {/* Gradient glow on hover */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[60px] pointer-events-none"
                    style={{ background: item.glow }}
                  />

                  {/* 3D Illustration */}
                  <motion.div
                    className="absolute top-5 right-5 text-[2.5rem] leading-none opacity-20 group-hover:opacity-40 transition-opacity duration-300 select-none pointer-events-none"
                    whileHover={{ rotate: 12, scale: 1.15 }}
                    style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
                  >
                    {item.illustration}
                  </motion.div>

                  {/* Icon */}
                  <div
                    className={`relative z-10 w-14 h-14 rounded-xl bg-linear-to-br ${item.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                  >
                    {item.icon}
                  </div>

                  {/* Title */}
                  <h3 className="relative z-10 text-lg font-bold text-(--text) mb-3 group-hover:text-(--primary) transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="relative z-10 text-(--text-muted) text-[0.9rem] leading-[1.75] pr-6">
                    {item.desc}
                  </p>

                  {/* Bottom gradient line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[3px] bg-linear-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS SECTION ══════ */}
      <section className="section-panel py-20 sm:py-28">
        <div className="max-w-[1200px] w-full mx-auto px-6 sm:px-10 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-10 sm:mb-12"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-sm font-semibold text-(--primary) uppercase tracking-widest mb-4"
            >
              Testimonials
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-extrabold text-(--text) mb-4"
            >
              Loved by Gardeners
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-(--text-muted) max-w-lg mx-auto text-base leading-relaxed"
            >
              See what plant lovers are saying about Bloomify.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 lg:gap-8">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
              >
                <GlassCard className="px-8 py-9 sm:px-10 sm:py-10 h-full flex flex-col items-center text-center min-h-[260px]">
                  <div className="flex gap-1.5 mt-4 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-(--text-secondary) text-[1.05rem] leading-[1.8] mb-8 italic flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-(--border-light)">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-(--border-light) shadow-md"
                      loading="lazy"
                    />
                    <div>
                      <div className="text-[15px] font-bold text-(--text)">{t.name}</div>
                      <div className="text-xs text-(--text-muted) mt-1">{t.location}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CALL TO ACTION ══════ */}
      <section className="min-h-screen bg-(--bg-alt) grid grid-cols-1 lg:grid-cols-2">

        {/* Left — Full-height Video Thumbnail */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative group cursor-pointer min-h-[50vh] lg:min-h-screen overflow-hidden"
          style={{ background: "var(--gradient-card)" }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-(--primary)/20 via-(--secondary)/10 to-(--accent)/20" />

          {/* Decorative plant elements */}
          <div className="absolute top-10 left-10 text-5xl opacity-25 select-none">🌿</div>
          <div className="absolute bottom-10 right-10 text-4xl opacity-20 select-none">🌱</div>
          <div className="absolute top-16 right-16 text-3xl opacity-15 select-none">🌸</div>
          <div className="absolute bottom-20 left-16 text-3xl opacity-15 select-none">🍃</div>

          {/* "Bloomify Demo" label */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-(--card)/80 backdrop-blur-sm border border-(--border) text-xs font-semibold text-(--text-secondary) tracking-wide uppercase z-10">
            Bloomify Demo
          </div>

          {/* Centered Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:shadow-[0_0_60px_var(--primary)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </motion.div>
          </div>

          {/* Bottom progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-(--border)">
            <div className="h-full w-1/3 rounded-r-full" style={{ background: "var(--gradient-primary)" }} />
          </div>

          {/* Inner rounded edge (right on desktop, bottom on mobile) */}
          <div className="hidden lg:block absolute top-4 bottom-4 right-0 w-6 bg-(--bg-alt) rounded-l-3xl" />
        </motion.div>

        {/* Right — Content & CTA */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col items-center justify-center text-center px-8 sm:px-12 lg:px-16 xl:px-24 py-16 lg:py-0 min-h-[50vh] lg:min-h-screen"
        >
          <div className="w-14 h-14 rounded-2xl bg-(--primary)/10 flex items-center justify-center mb-6">
            <Leaf className="w-7 h-7 text-(--primary)" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-(--text) mb-5 tracking-tight">
            Start Your Plant Journey
          </h2>

          <p className="text-(--text-muted) mb-10 max-w-md text-base sm:text-[1.08rem] leading-[1.8]">
            Join Bloomify and access AI-powered plant care, smart
            reminders, and a growing community of plant lovers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <AnimatedButton size="lg" onClick={() => navigate("/signup")}>
              Get Started Free <ArrowRight className="w-5 h-5" />
            </AnimatedButton>
            <AnimatedButton variant="secondary" size="lg" onClick={() => navigate("/plant-catalog")}>
              <BookOpen className="w-5 h-5" /> Browse Plants
            </AnimatedButton>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/space-analysis")}
            className="text-sm font-medium text-(--primary) hover:text-(--primary-hover) transition-colors flex items-center gap-1.5 mt-2"
          >
            <Play className="w-4 h-4" /> Try Demo
          </motion.button>
        </motion.div>

      </section>

    </PageContainer>
  );
}
