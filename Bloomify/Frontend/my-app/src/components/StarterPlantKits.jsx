import React, { useState, useEffect } from "react";
import "./StarterPlantKits.css";

const StarterPlantKits = () => {
  const kits = [
    {
      id: "herb",
      name: "Herb Kit",
      desc: "Basil, Mint, and Coriander for your kitchen.",
      emoji: "🌿",
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
      emoji: "🌸",
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
      emoji: "🏡",
      plants: [
        { name: "Peace Lily", tip: "Low light; water when topsoil is dry." },
        { name: "Snake Plant", tip: "Tolerates low light; sparse watering." },
        { name: "Money Plant", tip: "Bright indirect light; moderate water." },
      ],
      fertilizer: "Diluted houseplant feed every 6-8 weeks.",
      waterFreqDays: 7,
    },
  ];

  const [active, setActive] = useState(null); // kit id
  const [saved, setSaved] = useState([]);
  const [toast, setToast] = useState("");

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

  const openKit = (id) => setActive(kits.find((k) => k.id === id) || null);
  const closeKit = () => setActive(null);

  const addToGarden = (kit, qty = 1) => {
    setSaved((s) => {
      const next = [...s, { id: kit.id, name: kit.name, qty, addedAt: new Date().toISOString() }];
      setToast(`${kit.name} added to your garden ✨`);
      setTimeout(() => setToast(""), 3000);
      return next;
    });
  };

  return (
    <div className="feature-card starter-kits">
      <div className="header-row">
        <div>
          <h3>🌱 Starter Plant Kits</h3>
          <p className="sub">Pick from beginner-friendly kits to start your balcony garden.</p>
        </div>
        <div className="saved-count">Saved: <strong>{saved.length}</strong></div>
      </div>

      <div className="kit-grid" role="list">
        {kits.map((kit) => (
          <article key={kit.id} className="kit-card" role="listitem" tabIndex={0}>
            <div className="kit-emoji">{kit.emoji}</div>
            <h4 className="kit-title">{kit.name}</h4>
            <p className="kit-desc">{kit.desc}</p>

            <div className="kit-meta">
              <span className="chip">Water: ~{kit.waterFreqDays}d</span>
              <span className="chip">Fertilizer: seasonal</span>
            </div>

            <div className="kit-actions">
              <button className="small-btn" onClick={() => openKit(kit.id)}>View Kit</button>
              <button
                className="small-btn alt"
                onClick={() => {
                  addToGarden(kit, 1);
                }}
              >
                Add to Garden
              </button>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div className="kit-modal" role="dialog" aria-modal="true" aria-label={`${active.name} details`}>
          <div className="modal-panel">
            <header className="modal-head">
              <div className="modal-emoji">{active.emoji}</div>
              <div>
                <h3>{active.name}</h3>
                <div className="kit-desc">{active.desc}</div>
              </div>
            </header>

            <section className="modal-body">
              <h4>Includes</h4>
              <ul className="plant-list">
                {active.plants.map((p) => (
                  <li key={p.name}>
                    <strong>{p.name}</strong>
                    <div className="p-tip">{p.tip}</div>
                  </li>
                ))}
              </ul>

              <div className="recommend">
                <div className="rec-title">Care at a glance</div>
                <div className="rec-row">
                  <div><strong>Water</strong><div>Every ~{active.waterFreqDays} days</div></div>
                  <div><strong>Fertilizer</strong><div>{active.fertilizer}</div></div>
                </div>
              </div>
            </section>

            <footer className="modal-foot">
              <div className="qty">
                <label>Quantity</label>
                <input type="number" min="1" defaultValue={1} id="kit-qty" />
              </div>

              <div className="modal-actions">
                <button
                  className="cta"
                  onClick={() => {
                    const el = document.getElementById("kit-qty");
                    const qty = el ? Math.max(1, Number(el.value || 1)) : 1;
                    addToGarden(active, qty);
                    closeKit();
                  }}
                >
                  Add {active.name} to Garden
                </button>
                <button className="ghost" onClick={closeKit}>Close</button>
              </div>
            </footer>
          </div>

          <button className="overlay" onClick={closeKit} aria-hidden="true" />
        </div>
      )}

      {toast && <div className="kit-toast">{toast}</div>}
    </div>
  );
};

export default StarterPlantKits;
