import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sun, Sprout, Home, CalendarDays, Leaf, BookOpen, Camera, ChevronRight } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";

const CareGuide = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("watering");

  const guides = {
    watering: {
      title: "Watering Guide",
      icon: <Droplets className="w-5 h-5" />,
      sections: [
        {
          heading: "How to Know When to Water",
          content: "Stick your finger 1-2 inches into the soil. If it feels dry, it's time to water. If moist, wait a day or two. Overwatering is the #1 cause of houseplant death."
        },
        {
          heading: "Watering Frequency by Plant Type",
          items: [
            { label: "Succulents & Cacti", detail: "Every 2-3 weeks. Let soil dry completely between watering." },
            { label: "Tropical Plants", detail: "2x per week. Keep soil consistently moist, never soggy." },
            { label: "Herbs", detail: "Daily or every other day. They prefer consistently moist soil." },
            { label: "Ferns", detail: "2-3x per week. They love humidity and moist soil." }
          ]
        },
        {
          heading: "Golden Rules",
          tips: [
            "Water in the morning for best absorption",
            "Use room temperature water, not cold",
            "Water the soil, not the leaves",
            "Ensure pots have drainage holes",
            "Reduce watering in winter months"
          ]
        }
      ]
    },
    sunlight: {
      title: "Sunlight Guide",
      icon: <Sun className="w-5 h-5" />,
      sections: [
        {
          heading: "Understanding Light Levels",
          items: [
            { label: "Direct Sunlight (6+ hours)", detail: "South-facing windows. Good for cacti, succulents, tomatoes, herbs." },
            { label: "Bright Indirect (4-6 hours)", detail: "East/west windows with sheer curtains. Ideal for most houseplants." },
            { label: "Low Light (2-3 hours)", detail: "North-facing windows or interior rooms. Good for snake plant, ZZ plant, pothos." }
          ]
        },
        {
          heading: "Signs of Light Problems",
          tips: [
            "Leggy/stretched growth → too little light",
            "Pale or yellow leaves → too much direct sun",
            "Brown leaf edges → sunburn, move to indirect light",
            "Slow or no growth → needs more light",
            "Variegation fading → needs brighter light"
          ]
        },
        {
          heading: "Pro Tips",
          tips: [
            "Rotate plants weekly for even growth",
            "Clean leaves monthly for better light absorption",
            "Use grow lights if you lack natural light",
            "Acclimate plants gradually to new light conditions"
          ]
        }
      ]
    },
    beginners: {
      title: "Beginner-Friendly Plants",
      icon: <Sprout className="w-5 h-5" />,
      sections: [
        {
          heading: "Top 5 Unkillable Plants",
          items: [
            { label: "Snake Plant", detail: "Tolerates low light, infrequent watering. Air-purifying. Perfect first plant." },
            { label: "Pothos (Money Plant)", detail: "Grows in water or soil. Trails beautifully. Nearly impossible to kill." },
            { label: "ZZ Plant", detail: "Survives in near darkness. Water monthly. Glossy leaves look great." },
            { label: "Spider Plant", detail: "Produces baby plants. Adapts to any condition. Great for hanging." },
            { label: "Aloe Vera", detail: "Medicinal, low maintenance. Water every 2 weeks. Loves bright light." }
          ]
        },
        {
          heading: "Beginner Mistakes to Avoid",
          tips: [
            "Overwatering — most common killer of houseplants",
            "Using pots without drainage holes",
            "Placing plants in completely dark corners",
            "Repotting immediately after buying",
            "Ignoring pest signs (sticky leaves, white dots)"
          ]
        },
        {
          heading: "Getting Started Checklist",
          tips: [
            "Start with 1-2 easy plants, not 10",
            "Buy pots with drainage + saucers",
            "Use well-draining potting mix",
            "Set a weekly plant check routine",
            "Learn your home's light conditions first"
          ]
        }
      ]
    },
    indoor_outdoor: {
      title: "Indoor vs Outdoor",
      icon: <Home className="w-5 h-5" />,
      sections: [
        {
          heading: "Best Indoor Plants",
          items: [
            { label: "Snake Plant", detail: "Air purifier, low light, easy care" },
            { label: "Peace Lily", detail: "Blooms in shade, high humidity lover" },
            { label: "Monstera", detail: "Iconic split leaves, medium light" },
            { label: "Rubber Plant", detail: "Bold glossy leaves, grows tall" },
            { label: "Philodendron", detail: "Fast trailing vine, very forgiving" }
          ]
        },
        {
          heading: "Best Outdoor Plants",
          items: [
            { label: "Tomato", detail: "Full sun, daily water, rewarding harvest" },
            { label: "Marigold", detail: "Pest repellent, blooms all season" },
            { label: "Bougainvillea", detail: "Drought tolerant, dazzling colors" },
            { label: "Jasmine", detail: "Fragrant flowers, moderate care" },
            { label: "Tulsi (Holy Basil)", detail: "Aromatic, medicinal, easy to grow" }
          ]
        },
        {
          heading: "Moving Plants Indoor ↔ Outdoor",
          tips: [
            "Acclimate gradually over 7-10 days",
            "Check for pests before bringing indoors",
            "Outdoor → Indoor: do it before temps drop below 10°C",
            "Indoor → Outdoor: start in shade, then increase sun exposure",
            "Some plants (e.g., Aloe, Jade) thrive in both settings"
          ]
        }
      ]
    },
    seasonal: {
      title: "Seasonal Care",
      icon: <CalendarDays className="w-5 h-5" />,
      sections: [
        {
          heading: "Spring (Mar-May)",
          tips: [
            "Increase watering as growth resumes",
            "Start fertilizing every 2-4 weeks",
            "Repot root-bound plants",
            "Prune dead or leggy growth",
            "Best time to propagate"
          ]
        },
        {
          heading: "Summer (Jun-Aug)",
          tips: [
            "Water more frequently, check soil daily",
            "Protect from intense afternoon sun",
            "Mist tropical plants for humidity",
            "Watch for pests (aphids, spider mites)",
            "Continue regular fertilizing"
          ]
        },
        {
          heading: "Autumn (Sep-Nov)",
          tips: [
            "Reduce watering gradually",
            "Stop fertilizing by October",
            "Bring outdoor plants inside before frost",
            "Clean leaves to maximize light absorption",
            "Reduce repotting — let plants rest"
          ]
        },
        {
          heading: "Winter (Dec-Feb)",
          tips: [
            "Water sparingly — most plants are dormant",
            "No fertilizer needed",
            "Keep away from cold drafts and heaters",
            "Provide extra light if days are short",
            "Humidity drops — use pebble trays or humidifiers"
          ]
        }
      ]
    }
  };

  const tabs = [
    { key: "watering", icon: <Droplets className="w-4 h-4" />, label: "Watering" },
    { key: "sunlight", icon: <Sun className="w-4 h-4" />, label: "Sunlight" },
    { key: "beginners", icon: <Sprout className="w-4 h-4" />, label: "Beginners" },
    { key: "indoor_outdoor", icon: <Home className="w-4 h-4" />, label: "Indoor/Outdoor" },
    { key: "seasonal", icon: <CalendarDays className="w-4 h-4" />, label: "Seasonal" }
  ];

  const activeGuide = guides[activeTab];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 text-(--primary) text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" /> Care Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-(--text) mb-3">Plant Care Guide</h1>
          <p className="text-(--text-muted)">Everything you need to keep your plants healthy and thriving</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-(--primary) text-white shadow-lg shadow-(--primary)/25"
                  : "bg-(--card) border border-(--border) text-(--text-secondary) hover:border-(--primary)/50"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-(--primary)/10 flex items-center justify-center text-(--primary)">
                {activeGuide.icon}
              </div>
              <h2 className="text-xl font-bold text-(--text)">{activeGuide.title}</h2>
            </div>

            <div className="space-y-6">
              {activeGuide.sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-(--card) border border-(--border) rounded-2xl p-5"
                >
                  <h3 className="text-base font-bold text-(--text) mb-3">{section.heading}</h3>

                  {section.content && (
                    <p className="text-sm text-(--text-secondary) leading-relaxed">{section.content}</p>
                  )}

                  {section.items && (
                    <div className="space-y-3">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-(--bg-alt)">
                          <Leaf className="w-4 h-4 text-(--primary) mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-(--text)">{item.label}</p>
                            <p className="text-xs text-(--text-muted) mt-0.5">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.tips && (
                    <ul className="space-y-2">
                      {section.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-(--text-secondary)">
                          <ChevronRight className="w-4 h-4 text-(--primary) mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12 bg-linear-to-r from-(--primary)/10 to-(--accent)/10 border border-(--primary)/20 rounded-2xl p-8"
        >
          <p className="text-lg font-semibold text-(--text) mb-4">Ready to start your plant journey?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <AnimatedButton onClick={() => navigate("/space-analysis")}>
              <Camera className="w-4 h-4" /> Analyze Your Space
            </AnimatedButton>
            <AnimatedButton variant="outline" onClick={() => navigate("/plant-catalog")}>
              <Sprout className="w-4 h-4" /> Browse Plants
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default CareGuide;
