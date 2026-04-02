import React, { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf, BookOpen, Sprout, Star,
  ArrowRight, Sparkles, TreePine, Sun, Droplets, Play, ShoppingCart, Store, CheckCircle2, ShieldCheck, Zap
} from "lucide-react";
import PageContainer from "./layout/PageContainer";
import GlassCard from "./ui/GlassCard";
import AnimatedButton from "./ui/AnimatedButton";

const Plant3D = lazy(() => import("./ui/Plant3D"));

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.21, 0.45, 0.32, 0.9] },
  }),
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
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        setDisplayText(currentText.substring(0, displayText.length - 1));
        setSpeed(60);
        if (displayText === "") {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % textList.length);
        }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex, speed]);

  const features = [
    {
      icon: <Sprout className="w-6 h-6" />,
      title: "Smart Guidance",
      desc: "Instant AI recommendations for healthier plants.",
      path: "/plant-guide",
      color: "from-emerald-500 to-green-600"
    },
    {
      icon: <Sun className="w-6 h-6" />,
      title: "Space Analysis",
      desc: "Match plants to your room's light & climate.",
      path: "/space-analysis",
      color: "from-teal-500 to-emerald-500"
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: "Care Schedules",
      desc: "Never miss a watering with smart reminders.",
      path: "/care-guide",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: <TreePine className="w-6 h-6" />,
      title: "Encyclopedia",
      desc: "Explore 500+ species with expert care tips.",
      path: "/plant-catalog",
      color: "from-emerald-600 to-green-700"
    }
  ];

  return (
    <PageContainer>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden commercial-hero-bg">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-(--primary)/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-(--accent)/5 rounded-full blur-[100px]" />

        <div className="section-container relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center text-center lg:text-left">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-sm font-bold mb-8"
              >
                <Sparkles size={14} /> NEW: AI Space Mapping 2.0
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                className="text-5xl md:text-7xl font-black text-(--text) leading-[1.1] mb-8 tracking-tighter"
              >
                {displayText}
                <span className="inline-block w-1.5 h-[0.9em] bg-(--primary) ml-2 rounded-full animate-pulse" />
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={2}
                className="text-lg md:text-xl text-(--text-secondary) mb-12 max-w-xl leading-relaxed"
              >
                Elevate your living space with the world's most advanced plant care platform. Professional guidance, powered by artificial intelligence.
              </motion.p>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={3}
                className="flex flex-wrap justify-center lg:justify-start gap-5 mb-16"
              >
                <AnimatedButton size="lg" onClick={() => navigate("/space-analysis")} className="shadow-premium">
                  Start Analysis <ArrowRight className="ml-2" />
                </AnimatedButton>
                <AnimatedButton variant="secondary" size="lg" onClick={() => navigate("/care-guide")}>
                  Explore Features
                </AnimatedButton>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={4}
                className="grid grid-cols-3 gap-8 border-t border-(--border-light) pt-10 w-full max-w-md mx-auto lg:mx-0"
              >
                <div>
                  <div className="text-2xl font-black text-(--primary)">50k+</div>
                  <div className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mt-1">Users</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-(--primary)">98%</div>
                  <div className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mt-1">Success</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-(--primary)">24/7</div>
                  <div className="text-xs uppercase tracking-widest text-(--text-muted) font-bold mt-1">AI Care</div>
                </div>
              </motion.div>
            </div>

            {/* Right 3D Visual */}
            <div className="lg:col-span-5 relative hidden lg:block h-[600px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-full h-full relative"
              >
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-(--primary)/5 to-transparent rounded-full blur-3xl" />
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-6xl">🌿</div>}>
                  <Plant3D />
                </Suspense>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="py-12 border-y border-(--border-light) bg-white/50">
        <div className="section-container flex flex-wrap justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 font-black text-xl"><Zap fill="currentColor" /> FAST COMPANY</div>
           <div className="flex items-center gap-2 font-black text-xl"><ShieldCheck fill="currentColor" /> FORBES</div>
           <div className="flex items-center gap-2 font-black text-xl"><CheckCircle2 fill="currentColor" /> TECH CRUNCH</div>
           <div className="flex items-center gap-2 font-black text-xl"><Leaf fill="currentColor" /> GREEN LIVING</div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section className="py-32 bg-(--bg-alt)/50">
        <div className="section-container">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Designed for Every Gardener</h2>
            <p className="text-(--text-secondary) max-w-2xl mx-auto text-lg leading-relaxed">
              Whether you're a first-time plant parent or a botanical expert, Bloomify brings professional-grade tools to your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(item.path)}
                className="premium-card group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${item.color} text-white flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-(--primary) transition-colors">{item.title}</h3>
                <p className="text-(--text-secondary) text-sm leading-relaxed mb-6">
                  {item.desc}
                </p>
                <div className="text-(--primary) text-sm font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMERCIAL CTA ── */}
      <section className="py-32">
        <div className="section-container">
          <div className="relative rounded-[40px] overflow-hidden bg-(--text) text-white p-12 md:p-24 shadow-premium">
            <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80')] bg-cover bg-center" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Start Your Green Journey Today.</h2>
              <p className="text-lg text-white/70 mb-12 leading-relaxed">
                Join 50,000+ plant lovers who are already grown their dream indoor gardens with our AI-powered platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <AnimatedButton size="lg" onClick={() => navigate("/signup")} className="bg-white text-(--text) hover:bg-white/90">
                  Join Bloomify Free
                </AnimatedButton>
                <AnimatedButton variant="outline" size="lg" onClick={() => navigate("/products-shop")} className="border-white/20 text-white hover:bg-white/10">
                  Visit the Shop
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-32 bg-(--bg-alt)">
         <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
               {/* Fixed column for heading */}
               <div className="lg:col-span-1">
                  <span className="text-(--primary) font-black uppercase tracking-widest text-sm mb-4 block">Testimonials</span>
                  <h2 className="text-4xl font-black mb-8">What our community says.</h2>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" className="text-amber-400" />)}
                  </div>
                  <p className="text-(--text-secondary) font-medium">Rated 4.9/5 by 2,000+ happy plant parents.</p>
               </div>

               {/* Dynamic columns */}
               <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { 
                      text: "Bloomify totally changed how I care for my plants. The space analysis is scarily accurate!", 
                      author: "James Wilson", 
                      role: "Designer" 
                    },
                    { 
                      text: "Finally an app that works for professional gardeners too. The tool catalog is top-notch.", 
                      author: "Elena Rodriguez", 
                      role: "Botanist" 
                    }
                  ].map((t, i) => (
                    <GlassCard key={i} className="p-10 flex flex-col justify-between">
                       <p className="text-lg italic text-(--text-secondary) mb-8">"{t.text}"</p>
                       <div>
                          <div className="font-black text-(--text)">{t.author}</div>
                          <div className="text-sm text-(--text-muted)">{t.role}</div>
                       </div>
                    </GlassCard>
                  ))}
               </div>
            </div>
         </div>
      </section>

    </PageContainer>
  );
}

