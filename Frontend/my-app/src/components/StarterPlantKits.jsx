import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Flower, Home, Droplets, X, Plus, Minus, ShoppingBag, Sprout } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

const StarterPlantKits = () => {
  const kits = [
    {
      id: "herb",
      name: "Herb Kit",
      desc: "Basil, Mint, and Coriander for your kitchen.",
      icon: <Leaf className="w-8 h-8 text-emerald-500" />,
      color: "from-emerald-500/10 to-green-500/10",
      borderColor: "border-emerald-500/20",
      plants: [
        { name: "Basil", tip: "6+ hrs sun, regular watering." },
        { name: "Mint", tip: "Partial shade, keep soil moist." },
        { name: "Coriander", tip: "Likes cool temps; light sun." },
      ],
      fertilizer: "Balanced liquid feed every 3-4 weeks.",
      waterFreqDays: 2,
    },
    {
      id: "flower",
      name: "Flower Kit",
      desc: "Marigold, Jasmine, and Rose starters.",
      icon: <Flower className="w-8 h-8 text-pink-500" />,
      color: "from-pink-500/10 to-rose-500/10",
      borderColor: "border-pink-500/20",
      plants: [
        { name: "Marigold", tip: "Full sun; deadhead for more blooms." },
        { name: "Jasmine", tip: "Bright indirect light; moderate water." },
        { name: "Rose", tip: "Full sun; prune and feed in season." },
      ],
      fertilizer: "Bloom booster or high potassium feed in season.",
      waterFreqDays: 3,
    },
    {
      id: "indoor",
      name: "Indoor Kit",
      desc: "Peace Lily, Snake Plant, and Money Plant.",
      icon: <Home className="w-8 h-8 text-blue-500" />,
      color: "from-blue-500/10 to-indigo-500/10",
      borderColor: "border-blue-500/20",
      plants: [
        { name: "Peace Lily", tip: "Low light; water when topsoil is dry." },
        { name: "Snake Plant", tip: "Tolerates low light; sparse watering." },
        { name: "Money Plant", tip: "Bright indirect light; moderate water." },
      ],
      fertilizer: "Diluted houseplant feed every 6-8 weeks.",
      waterFreqDays: 7,
    },
  ];

  const [active, setActive] = useState(null);
  const [saved, setSaved] = useState([]);
  const [toast, setToast] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bloomify_saved_kits");
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bloomify_saved_kits", JSON.stringify(saved));
    } catch {}
  }, [saved]);

  const openKit = (id) => { setActive(kits.find((k) => k.id === id) || null); setQty(1); };
  const closeKit = () => setActive(null);

  const addToGarden = (kit, quantity = 1) => {
    setSaved((s) => {
      const next = [...s, { id: kit.id, name: kit.name, qty: quantity, addedAt: new Date().toISOString() }];
      setToast(`${kit.name} added to your garden`);
      setTimeout(() => setToast(""), 3000);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--primary)/10 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-(--primary)" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-(--text)">Starter Plant Kits</h3>
            <p className="text-xs text-(--text-muted)">Pick from beginner-friendly kits to start your garden</p>
          </div>
        </div>
        <span className="text-xs bg-(--primary)/10 text-(--primary) px-3 py-1 rounded-full font-medium">
          Saved: {saved.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kits.map((kit, idx) => (
          <motion.div
            key={kit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className={`bg-linear-to-br ${kit.color} border ${kit.borderColor} rounded-2xl p-5 cursor-pointer`}
            onClick={() => openKit(kit.id)}
          >
            <div className="mb-3">{kit.icon}</div>
            <h4 className="text-base font-bold text-(--text) mb-1">{kit.name}</h4>
            <p className="text-xs text-(--text-muted) mb-4">{kit.desc}</p>
            <div className="flex gap-2 mb-4">
              <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-(--card) px-2 py-1 rounded-full text-(--text-secondary)">
                <Droplets className="w-3 h-3" /> ~{kit.waterFreqDays}d
              </span>
              <span className="text-[10px] font-medium bg-(--card) px-2 py-1 rounded-full text-(--text-secondary)">
                Seasonal feed
              </span>
            </div>
            <div className="flex gap-2">
              <AnimatedButton size="sm" onClick={(e) => { e.stopPropagation(); openKit(kit.id); }}>View Kit</AnimatedButton>
              <AnimatedButton variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addToGarden(kit, 1); }}>
                <Plus className="w-3 h-3" /> Add
              </AnimatedButton>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Kit Detail Modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeKit}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--card) border border-(--border) rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {active.icon}
                  <div>
                    <h3 className="text-lg font-bold text-(--text)">{active.name}</h3>
                    <p className="text-xs text-(--text-muted)">{active.desc}</p>
                  </div>
                </div>
                <button onClick={closeKit} className="p-2 rounded-xl hover:bg-(--bg-alt) transition-colors">
                  <X className="w-5 h-5 text-(--text-muted)" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <h4 className="text-sm font-semibold text-(--text)">Includes</h4>
                {active.plants.map((p) => (
                  <div key={p.name} className="p-3 rounded-xl bg-(--bg-alt) border border-(--border)">
                    <p className="text-sm font-medium text-(--text)">{p.name}</p>
                    <p className="text-xs text-(--text-muted)">{p.tip}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-(--bg-alt) border border-(--border) mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">Water</p>
                  <p className="text-sm font-medium text-(--text)">Every ~{active.waterFreqDays} days</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-(--text-muted) font-semibold">Fertilizer</p>
                  <p className="text-sm font-medium text-(--text)">{active.fertilizer}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <label className="text-sm font-medium text-(--text-secondary)">Quantity</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg bg-(--bg-alt) border border-(--border) flex items-center justify-center hover:bg-(--border) transition-colors">
                    <Minus className="w-3 h-3 text-(--text)" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-(--text)">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-lg bg-(--bg-alt) border border-(--border) flex items-center justify-center hover:bg-(--border) transition-colors">
                    <Plus className="w-3 h-3 text-(--text)" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <AnimatedButton size="md" className="flex-1" onClick={() => { addToGarden(active, qty); closeKit(); }}>
                  <ShoppingBag className="w-4 h-4" /> Add to Garden
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="md" onClick={closeKit}>Close</AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-(--card) border border-(--border) text-(--text) px-6 py-3 rounded-2xl shadow-xl text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StarterPlantKits;
