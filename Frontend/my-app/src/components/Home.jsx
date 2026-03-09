import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf, BookOpen, Sprout, Star,
  ArrowRight, Sparkles, TreePine, Sun, Droplets
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
      title: "Smart Plant Guidance",
      desc: "AI-powered recommendations to help you grow healthier plants with eco-friendly practices.",
      gradient: "from-emerald-500 to-green-600",
    },
    {
      icon: <Sun className="w-6 h-6 text-white" />,
      title: "Space Analysis",
      desc: "Upload photos of your space and get personalized plant suggestions based on light and climate.",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: <Droplets className="w-6 h-6 text-white" />,
      title: "Care Reminders",
      desc: "Never forget to water your plants with intelligent care schedules and seasonal guidance.",
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      icon: <TreePine className="w-6 h-6 text-white" />,
      title: "Plant Encyclopedia",
      desc: "Browse 100+ plants with detailed care instructions, growth tips, and companion planting info.",
      gradient: "from-cyan-500 to-emerald-500",
    },
    {
      icon: <Leaf className="w-6 h-6 text-white" />,
      title: "My Plants Dashboard",
      desc: "Track your plant collection, monitor growth progress, and manage your personal garden.",
      gradient: "from-emerald-400 to-green-500",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-white" />,
      title: "Starter Kits",
      desc: "Curated beginner-friendly plant kits to kickstart your gardening journey with confidence.",
      gradient: "from-green-400 to-teal-500",
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
      <section className="hero-section relative flex items-center overflow-hidden" style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
        {/* Background glow */}
        <div className="hero-glow" />

        <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-12 py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left — Text */}
            <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-[520px]">
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
                className="text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-extrabold text-(--text) leading-[1.08] mb-7 tracking-tight"
              >
                {displayText}
                <span className="inline-block w-[3px] h-[0.85em] bg-(--primary) ml-1.5 rounded-full animate-pulse align-middle" />
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-base sm:text-[1.1rem] text-(--text-secondary) max-w-[460px] mb-12 leading-[1.75]"
              >
                Bloomify helps you grow healthier plants with AI-powered
                recommendations, smart care reminders, and a beautiful plant
                encyclopedia — all in one place.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-5 mb-16">
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
                  { value: "Free", label: "To Use" },
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
              className="hidden lg:flex items-center justify-center"
              style={{ height: '500px' }}
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
      <section className="py-28 sm:py-32 bg-(--bg-alt)">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-20"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-sm font-semibold text-(--primary) uppercase tracking-widest mb-4"
            >
              Features
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-extrabold text-(--text) mb-5"
            >
              Everything You Need to Grow
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-(--text-muted) max-w-lg mx-auto text-base leading-relaxed"
            >
              Powerful tools and smart features to make plant care simple, fun, and effective.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.07 }}
              >
                <GlassCard className="p-9 h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-linear-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-md`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-[1.05rem] font-bold text-(--text) mb-3">
                    {item.title}
                  </h3>
                  <p className="text-(--text-muted) text-sm leading-[1.7]">
                    {item.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TESTIMONIALS SECTION ══════ */}
      <section className="py-28 sm:py-32">
        <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-20"
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
              className="text-3xl sm:text-4xl font-extrabold text-(--text) mb-5"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
              >
                <GlassCard className="p-9 h-full flex flex-col">
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-(--text-secondary) text-[0.95rem] leading-[1.75] mb-8 italic flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 pt-5 border-t border-(--border-light)">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-(--border-light)"
                      loading="lazy"
                    />
                    <div>
                      <div className="text-sm font-semibold text-(--text)">{t.name}</div>
                      <div className="text-xs text-(--text-muted) mt-0.5">{t.location}</div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CALL TO ACTION ══════ */}
      <section className="py-28 sm:py-32 bg-(--bg-alt)">
        <div className="max-w-[720px] mx-auto px-6 sm:px-10 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="px-10 py-16 sm:px-16 sm:py-20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-(--primary)/5 to-(--accent)/5" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-(--primary)/10 flex items-center justify-center mx-auto mb-7">
                  <Leaf className="w-8 h-8 text-(--primary)" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-(--text) mb-4">
                  Start Your Plant Journey
                </h2>
                <p className="text-(--text-muted) mb-10 max-w-sm mx-auto text-[0.95rem] leading-[1.7]">
                  Join Bloomify and access AI-powered plant care, smart
                  reminders, and a growing community of plant lovers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <AnimatedButton size="lg" onClick={() => navigate("/signup")}>
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" size="lg" onClick={() => navigate("/plant-catalog")}>
                    <BookOpen className="w-5 h-5" /> Browse Plants
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

    </PageContainer>
  );
}
