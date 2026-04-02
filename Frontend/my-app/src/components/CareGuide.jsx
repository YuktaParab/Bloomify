import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sun, Sprout, Home, CalendarDays, Leaf, BookOpen, Camera, ChevronRight, CheckCircle2 } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";

const CareGuide = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("watering");

  const guides = {
    watering: {
      title: "Watering Guide",
      icon: <Droplets className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      description: "Master the art of hydration. Explore watering techniques, soil moisture levels, and plant-specific needs.",
      sections: [
        {
          heading: "Moisture Detection",
          content: "The finger test is your best tool. Insert your finger 2 inches deep; if dry, it's time to hydrate. Overwatering causes 90% of plant issues."
        },
        {
          heading: "Frequency by Species",
          items: [
            { label: "Succulents & Cacti", detail: "Every 14-21 days. Desert-dry soil required." },
            { label: "Tropical Foliage", detail: "Every 4-7 days. High humidity and moist soil." },
            { label: "Culinary Herbs", detail: "Every 2-3 days. They prefer consistent moisture." }
          ]
        },
        {
          heading: "Professional Tips",
          tips: [
            "Morning watering allows absorption before evaporation",
            "Drainage holes are non-negotiable for root health",
            "Filtered water is best for sensitive tropicals",
            "Reduce frequency significantly during dormancy"
          ]
        }
      ]
    },
    sunlight: {
      title: "Luminous Needs",
      icon: <Sun className="w-5 h-5" />,
      color: "from-amber-400 to-orange-500",
      description: "Harness the power of light. Understand exposure types and how to read your plant's light signals.",
      sections: [
        {
          heading: "Exposure Levels",
          items: [
            { label: "Direct (South)", detail: "Cacti, herbs, and flowering plants crave this intense light." },
            { label: "Indirect (East/West)", detail: "The 'Sweet Spot' for Monstera, Pothos, and Orchids." },
            { label: "Low (North)", detail: "Perfect for Snake Plants, ZZ Plants, and Ferns." }
          ]
        },
        {
          heading: "Critical Indicators",
          tips: [
            "Yellowing leaves often signal sun scorch",
            "Stretching stems (leggy) mean it's searching for light",
            "Small new leaves suggest insufficient light energy",
            "Rotate 90 degrees weekly for balanced growth"
          ]
        }
      ]
    },
    beginners: {
      title: "Starter Favorites",
      icon: <Sprout className="w-5 h-5" />,
      color: "from-emerald-400 to-green-600",
      description: "New to gardening? These resilient species are forgiving and rewarding to grow.",
      sections: [
        {
          heading: "The 'Invincibles'",
          items: [
            { label: "Snake Plant", detail: "Thrives on neglect and low light. Great air purifier." },
            { label: "Pothos", detail: "Fast-growing vine that tells you when it needs water." },
            { label: "ZZ Plant", detail: "Low-light champion with architectural glossy leaves." }
          ]
        },
        {
          heading: "Kickstart Checklist",
          tips: [
            "Choose species that match your natural room light",
            "Don't repot immediately; let them acclimate first",
            "Invest in high-quality organic potting mix",
            "Observe daily: notice changes early"
          ]
        }
      ]
    },
    indoor_outdoor: {
      title: "Environment Hub",
      icon: <Home className="w-5 h-5" />,
      color: "from-teal-500 to-emerald-700",
      description: "Optimizing the perfect setting for your green friends. Seasonal transitions and air quality.",
      sections: [
        {
          heading: "Indoor Comfort",
          items: [
            { label: "Humidity Control", detail: "Tropicals love 60%+ humidity. Use pebble trays." },
            { label: "Air Circulation", detail: "Avoid stagnant air; it invites fungal issues." }
          ]
        },
        {
          heading: "Outdoor Transition",
          tips: [
            "Acclimatize plants over 7 days when moving outside",
            "Shield from wind to prevent mechanical leaf damage",
            "Monitor outdoor pests weekly"
          ]
        }
      ]
    },
    seasonal: {
      title: "Growth Cycles",
      icon: <CalendarDays className="w-5 h-5" />,
      color: "from-indigo-400 to-purple-600",
      description: "Plants change with the seasons. Adjust your care routine for winter dormancy and spring blooms.",
      sections: [
        {
          heading: "Active Season (Spring/Summer)",
          tips: [
            "Fertilize every 2 weeks with organic liquid plant food",
            "Prune leggy stems to encourage bushier growth",
            "Monitor soil daily during heatwaves"
          ]
        },
        {
          heading: "Dormancy (Autumn/Winter)",
          tips: [
            "Halt all fertilization; the plant is 'sleeping'",
            "Drastically reduce watering frequency",
            "Move plants closer to windows for winter sun"
          ]
        }
      ]
    }
  };

  const tabs = [
    { key: "watering", label: "Watering" },
    { key: "sunlight", label: "Sunlight" },
    { key: "beginners", label: "Beginners" },
    { key: "indoor_outdoor", label: "Environment" },
    { key: "seasonal", label: "Seasonal" }
  ];

  const activeGuide = guides[activeTab];

  return (
    <PageContainer>
      <section className="section-container pt-32 pb-24">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-black uppercase tracking-widest mb-6"
          >
            <BookOpen size={14} /> Knowledge Hub
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-(--text) mb-6 tracking-tight"
          >
            Professional Plant Care
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-(--text-secondary) leading-relaxed"
          >
            Expertly curated guides to help you master indoor gardening and keep your botanical collection flourishing year-round.
          </motion.p>
        </div>

        {/* Dynamic Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-4xl mx-auto px-4">
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab.key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-(--text) text-white shadow-xl scale-105"
                  : "bg-white border border-(--border-light) text-(--text-secondary) hover:border-(--primary) hover:bg-(--bg-alt)"
              }`}
            >
              <div className={activeTab === tab.key ? "text-(--primary)" : "text-(--text-muted)"}>
                {guides[tab.key].icon}
              </div>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              {/* Feature Sidebar */}
              <div className="lg:col-span-4">
                <div className={`p-8 rounded-[32px] bg-linear-to-br ${activeGuide.color} text-white shadow-premium relative overflow-hidden h-full min-h-[300px]`}>
                  <div className="absolute top-[-20%] right-[-20%] scale-[2] opacity-10 pointer-events-none">
                    {activeGuide.icon}
                  </div>
                  <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-md w-14 h-14 rounded-2xl flex items-center justify-center mb-10">
                      {activeGuide.icon}
                    </div>
                    <h2 className="text-3xl font-black mb-6 leading-tight">{activeGuide.title}</h2>
                    <p className="text-white/80 font-medium leading-relaxed mb-10">
                      {activeGuide.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-black/10 p-4 rounded-xl border border-white/10">
                      <CheckCircle2 size={14} /> Certified Specialist Guide
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="lg:col-span-8 space-y-8">
                {activeGuide.sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="premium-card"
                  >
                    <h3 className="text-xl font-black text-(--text) mb-6 flex items-center gap-3">
                      <span className="w-2 h-8 bg-(--primary) rounded-full block" />
                      {section.heading}
                    </h3>

                    {section.content && (
                      <p className="text-(--text-secondary) leading-relaxed mb-2 font-medium">{section.content}</p>
                    )}

                    {section.items && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.items.map((item, i) => (
                          <div key={i} className="p-5 rounded-2xl bg-(--bg-alt) border border-(--border-light) hover:border-(--primary)/30 transition-colors">
                            <h4 className="font-black text-sm text-(--text) mb-2 flex items-center gap-2">
                              <Leaf size={14} className="text-(--primary)" /> {item.label}
                            </h4>
                            <p className="text-xs text-(--text-secondary) leading-relaxed pl-5 font-medium">
                              {item.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.tips && (
                      <div className="grid grid-cols-1 gap-3">
                        {section.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-(--primary)/5 text-sm text-(--text-secondary) font-bold">
                            <ChevronRight size={16} className="text-(--primary) mt-1 shrink-0" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global CTA */}
        <div className="max-w-4xl mx-auto mt-24 px-4">
          <div className="p-12 rounded-[40px] bg-(--text) text-white text-center relative overflow-hidden shadow-premium group">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1473970670511-7301c68e477a?auto=format&fit=crop&q=80')] bg-cover opacity-10 grayscale group-hover:grayscale-0 transition-all duration-700 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-6">Need a personal home analysis?</h2>
              <p className="text-white/60 mb-10 max-w-lg mx-auto font-medium">
                Our AI can analyze your space from a single photo to recommend the perfect species for your unique environment.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <AnimatedButton size="lg" onClick={() => navigate("/space-analysis")} className="bg-white text-(--text) hover:bg-white/90 px-8 font-black">
                  <Camera className="mr-2" size={18} /> Analyze My Room
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};

export default CareGuide;

