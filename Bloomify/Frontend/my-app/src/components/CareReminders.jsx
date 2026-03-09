import React, { useState, useEffect } from "react";
import "./CareReminders.css";

const FERTILIZER_SUGGESTIONS = {
  "Tomato": "Balanced NPK 10-10-10 during growth; higher potassium once fruiting (5-10-10).",
  "Basil": "Liquid organic fertilizer every 3-4 weeks during growth season.",
  "Lavender": "Low-nitrogen, slow-release fertilizer in spring.",
  "Peace Lily": "Diluted balanced houseplant feed every 4-6 weeks.",
  "Pothos": "Balanced liquid fertilizer every 6-8 weeks.",
  "Fern": "Liquid feed every 4 weeks in growing season.",
  "Default": "Use a balanced, slow-release fertilizer appropriate for the plant type."
};

const REPOTTING_SUGGESTIONS_MONTHS = {
  "Tomato": 6,
  "Basil": 6,
  "Lavender": 24,
  "Peace Lily": 12,
  "Pothos": 18,
  "Fern": 18,
  "Default": 12,
};

const STORAGE_KEY = "bloomify_care_reminders_v1";

const daysBetween = (d1, d2) => Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d;
};

const addMonthsApprox = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months));
  return d;
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

const defaultPlants = ["Tomato", "Basil", "Lavender", "Peace Lily", "Pothos", "Fern"];

const CareReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({
    type: "watering",
    plant: "Tomato",
    startDate: new Date().toISOString().slice(0,10),
    frequencyDays: 2,
    frequencyWeeks: 4,
    frequencyMonths: 12,
    notes: ""
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReminders(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  const createReminder = () => {
    const baseDate = new Date(form.startDate);
    let nextDue = new Date(baseDate);
    let meta = {};
    if (form.type === "watering") {
      nextDue = addDays(baseDate, form.frequencyDays || 2);
      meta.frequencyDays = Number(form.frequencyDays || 2);
    } else if (form.type === "fertilizing") {
      nextDue = addDays(baseDate, (form.frequencyWeeks || 4) * 7);
      meta.frequencyWeeks = Number(form.frequencyWeeks || 4);
      meta.suggestion = FERTILIZER_SUGGESTIONS[form.plant] || FERTILIZER_SUGGESTIONS.Default;
    } else if (form.type === "repotting") {
      const months = form.frequencyMonths || REPOTTING_SUGGESTIONS_MONTHS[form.plant] || REPOTTING_SUGGESTIONS_MONTHS.Default;
      nextDue = addMonthsApprox(baseDate, months);
      meta.frequencyMonths = Number(months);
      meta.suggestion = `Recommended repot every ${months} month(s).`;
    }

    const r = {
      id: uid(),
      type: form.type,
      plant: form.plant,
      notes: form.notes || "",
      createdAt: new Date().toISOString(),
      nextDue: nextDue.toISOString(),
      meta
    };
    setReminders((s) => [...s, r].sort((a,b) => new Date(a.nextDue) - new Date(b.nextDue)));
  };

  const markDone = (id) => {
    setReminders((arr) =>
      arr.map((r) => {
        if (r.id !== id) return r;
        const now = new Date();
        let next;
        if (r.type === "watering") next = addDays(now, r.meta.frequencyDays || 2);
        else if (r.type === "fertilizing") next = addDays(now, (r.meta.frequencyWeeks || 4) * 7);
        else if (r.type === "repotting") next = addMonthsApprox(now, r.meta.frequencyMonths || REPOTTING_SUGGESTIONS_MONTHS.Default);
        return { ...r, nextDue: next.toISOString() };
      })
    );
  };

  const snooze = (id, days = 1) => {
    setReminders((arr) =>
      arr.map((r) => (r.id === id ? { ...r, nextDue: addDays(new Date(r.nextDue), days).toISOString() } : r))
    );
  };

  const remove = (id) => setReminders((arr) => arr.filter((r) => r.id !== id));

  const plantFertilizer = (plant) => FERTILIZER_SUGGESTIONS[plant] || FERTILIZER_SUGGESTIONS.Default;
  const plantRepotMonths = (plant) => REPOTTING_SUGGESTIONS_MONTHS[plant] || REPOTTING_SUGGESTIONS_MONTHS.Default;

  return (
    <div className="feature-card care-reminders">
      <h3>⏰ Care Reminders</h3>
      <p className="sub">Set gentle reminders for watering, fertilizing, or repotting — tailored suggestions included.</p>

      <div className="cards-row">
        <div className={`reminder-card watering ${form.type === "watering" ? "active" : ""}`}>
          <div className="card-head">💧 Watering</div>
          <div className="card-body">
            <label>Plant</label>
            <select value={form.plant} onChange={(e)=>setForm({...form, plant:e.target.value})}>
              {defaultPlants.map(p=> <option key={p}>{p}</option>)}
            </select>

            <label>Start date</label>
            <input type="date" value={form.startDate} onChange={(e)=>setForm({...form, startDate:e.target.value})} />

            <label>Frequency (days)</label>
            <input type="number" min="1" value={form.frequencyDays} onChange={(e)=>setForm({...form, frequencyDays: e.target.value})} />

            <button onClick={()=>{ setForm(f=>({...f, type:"watering"})); createReminder(); }} className="set-btn">Set Watering Reminder</button>
            <div className="hint">Typical: {form.plant === "Tomato" ? "every 1-3 days" : "every 2-7 days"}</div>
          </div>
        </div>

        <div className={`reminder-card fertilizing ${form.type === "fertilizing" ? "active" : ""}`}>
          <div className="card-head">🌿 Fertilizing</div>
          <div className="card-body">
            <label>Plant</label>
            <select value={form.plant} onChange={(e)=>setForm({...form, plant:e.target.value})}>
              {defaultPlants.map(p=> <option key={p}>{p}</option>)}
            </select>

            <label>Start date</label>
            <input type="date" value={form.startDate} onChange={(e)=>setForm({...form, startDate:e.target.value})} />

            <label>Frequency (weeks)</label>
            <input type="number" min="1" value={form.frequencyWeeks} onChange={(e)=>setForm({...form, frequencyWeeks: e.target.value})} />

            <div className="suggestion">{plantFertilizer(form.plant)}</div>

            <button onClick={()=>{ setForm(f=>({...f, type:"fertilizing"})); createReminder(); }} className="set-btn alt">Set Fertilizer Reminder</button>
          </div>
        </div>

        <div className={`reminder-card repotting ${form.type === "repotting" ? "active" : ""}`}>
          <div className="card-head">🪴 Repotting</div>
          <div className="card-body">
            <label>Plant</label>
            <select value={form.plant} onChange={(e)=>setForm({...form, plant:e.target.value})}>
              {defaultPlants.map(p=> <option key={p}>{p}</option>)}
            </select>

            <label>Start date</label>
            <input type="date" value={form.startDate} onChange={(e)=>setForm({...form, startDate:e.target.value})} />

            <label>Interval (months)</label>
            <input type="number" min="1" value={form.frequencyMonths} onChange={(e)=>setForm({...form, frequencyMonths: e.target.value})} />

            <div className="suggestion">Suggested: every {plantRepotMonths(form.plant)} months</div>

            <button onClick={()=>{ setForm(f=>({...f, type:"repotting"})); createReminder(); }} className="set-btn">Set Repot Reminder</button>
          </div>
        </div>
      </div>

      <div className="upcoming">
        <h4>Upcoming Reminders</h4>
        {reminders.length === 0 && <div className="empty">No reminders yet — add one from the cards above.</div>}
        <ul>
          {reminders.sort((a,b)=> new Date(a.nextDue)-new Date(b.nextDue)).map(r=>{
            const due = new Date(r.nextDue);
            const days = daysBetween(new Date(), due);
            return (
              <li key={r.id} className={`up-item ${days <= 0 ? "due" : ""}`}>
                <div className="left">
                  <div className="type">{r.type === "watering" ? "💧 Water" : r.type === "fertilizing" ? "🌿 Fertilize" : "🪴 Repot"}</div>
                  <div className="meta">{r.plant} • {due.toLocaleDateString()}</div>
                  <div className="notes">{r.meta?.suggestion || r.notes}</div>
                </div>
                <div className="actions">
                  <button onClick={()=>markDone(r.id)} className="action done">Mark Done</button>
                  <button onClick={()=>snooze(r.id,1)} className="action snooze">Snooze 1d</button>
                  <button onClick={()=>remove(r.id)} className="action remove">Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CareReminders;
