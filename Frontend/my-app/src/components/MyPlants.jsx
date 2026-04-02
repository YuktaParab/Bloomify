import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Plus, Trash2, Clock, Edit3, Save, X, Droplets, Sun, BarChart3, Thermometer, Lock, Bell, CheckCircle2, Calendar, Scissors, Beaker, Flower } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";

const MyPlants = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myPlants, setMyPlants] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [showAddReminder, setShowAddReminder] = useState(null);
  const [reminderForm, setReminderForm] = useState({ task: "watering", date: "" });
  const [editingNotes, setEditingNotes] = useState(null);
  const [notesText, setNotesText] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchMyPlants(u.email);
        fetchReminders(u.email);
      } else {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const fetchMyPlants = async (email) => {
    try {
      const res = await fetch(`http://localhost:3001/my-plants?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setMyPlants(data);
    } catch {
      console.error("Failed to load plants");
    }
    setLoading(false);
  };

  const fetchReminders = async (email) => {
    try {
      const res = await fetch(`http://localhost:3001/reminders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setReminders(data);
    } catch {
      console.error("Failed to load reminders");
    }
  };

  const removePlant = async (id, name) => {
    try {
      await fetch(`http://localhost:3001/my-plants/${id}`, { method: "DELETE" });
      setMyPlants((prev) => prev.filter((p) => p._id !== id));
      showToast(`${name} removed from collection`);
    } catch {
      showToast("Failed to remove plant");
    }
  };

  const saveNotes = async (id) => {
    try {
      await fetch(`http://localhost:3001/my-plants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText }),
      });
      setMyPlants((prev) =>
        prev.map((p) => (p._id === id ? { ...p, notes: notesText } : p))
      );
      setEditingNotes(null);
      showToast("Notes saved!");
    } catch {
      showToast("Failed to save notes");
    }
  };

  const addReminder = async () => {
    if (!reminderForm.date) { showToast("Please select a date"); return; }
    try {
      const res = await fetch("http://localhost:3001/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          plant_name: showAddReminder,
          task: reminderForm.task,
          date: reminderForm.date,
        }),
      });
      if (res.ok) {
        fetchReminders(user.email);
        setShowAddReminder(null);
        setReminderForm({ task: "watering", date: "" });
        showToast("Reminder added!");
      }
    } catch {
      showToast("Failed to add reminder");
    }
  };

  const toggleReminder = async (id, current) => {
    try {
      await fetch(`http://localhost:3001/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
      setReminders((prev) =>
        prev.map((r) => (r._id === id ? { ...r, completed: !current } : r))
      );
    } catch {
      showToast("Failed to update reminder");
    }
  };

  const deleteReminder = async (id) => {
    try {
      await fetch(`http://localhost:3001/reminders/${id}`, { method: "DELETE" });
      setReminders((prev) => prev.filter((r) => r._id !== id));
      showToast("Reminder deleted");
    } catch {
      showToast("Failed to delete reminder");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const todayReminders = reminders.filter(
    (r) => r.date === getTodayStr() && !r.completed
  );
  const upcomingReminders = reminders.filter(
    (r) => r.date > getTodayStr() && !r.completed
  );

  const getTaskIcon = (task) => {
    const icons = { watering: <Droplets className="w-4 h-4 text-blue-500" />, fertilizing: <Beaker className="w-4 h-4 text-purple-500" />, pruning: <Scissors className="w-4 h-4 text-amber-500" />, repotting: <Flower className="w-4 h-4 text-emerald-500" /> };
    return icons[task] || <Calendar className="w-4 h-4 text-gray-500" />;
  };

  if (!user && !loading) {
    return (
      <PageContainer showFooter={false}>
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-(--primary)/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-(--primary)" />
            </div>
            <h2 className="text-2xl font-black text-(--text) mb-2">Login Required</h2>
            <p className="text-(--text-muted) mb-6">Please login to manage your plant collection</p>
            <AnimatedButton onClick={() => navigate("/login")}>Go to Login</AnimatedButton>
          </motion.div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 text-(--primary) text-sm font-medium mb-3">
              <Leaf className="w-4 h-4" /> My Garden
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-(--text) mb-1">My Plants</h1>
            <p className="text-(--text-muted)">
              You have <span className="text-(--primary) font-semibold">{myPlants.length}</span> plant{myPlants.length !== 1 ? "s" : ""} in your collection
            </p>
          </div>
          <AnimatedButton onClick={() => navigate("/plant-catalog")}>
            <Plus className="w-4 h-4" /> Add Plants
          </AnimatedButton>
        </motion.div>

        {/* Today's Tasks */}
        {todayReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-linear-to-r from-(--primary)/10 to-(--accent)/10 border border-(--primary)/20 rounded-2xl p-5 mb-8"
          >
            <h3 className="text-base font-bold text-(--text) flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-(--primary)" /> Today's Tasks
            </h3>
            <div className="space-y-2">
              {todayReminders.map((r) => (
                <div key={r._id} className="flex items-center gap-3 bg-(--card) rounded-xl p-3 border border-(--border)">
                  {getTaskIcon(r.task)}
                  <span className="text-sm text-(--text) flex-1">
                    {r.task.charAt(0).toUpperCase() + r.task.slice(1)} — <strong>{r.plant_name}</strong>
                  </span>
                  <button onClick={() => toggleReminder(r._id, r.completed)} className="p-1.5 rounded-lg bg-(--primary)/10 hover:bg-(--primary)/20 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-(--primary)" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plant Cards */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-(--primary)/30 border-t-(--primary) rounded-full animate-spin mx-auto mb-4" />
            <p className="text-(--text-muted)">Loading your plants...</p>
          </div>
        ) : myPlants.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-(--primary)/10 flex items-center justify-center">
              <Leaf className="w-10 h-10 text-(--primary)" />
            </div>
            <h3 className="text-xl font-bold text-(--text) mb-2">No plants yet!</h3>
            <p className="text-(--text-muted) mb-6">Browse the Plant Catalog and add plants to your collection.</p>
            <AnimatedButton onClick={() => navigate("/plant-catalog")}>Browse Plants</AnimatedButton>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myPlants.map((plant, idx) => (
              <motion.div
                key={plant._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-(--card) border border-(--border) rounded-2xl p-5 group hover:shadow-lg hover:shadow-(--primary)/5 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      title="Add Reminder"
                      onClick={() => setShowAddReminder(plant.plant_name)}
                      className="p-2 rounded-xl hover:bg-(--bg-alt) transition-colors"
                    >
                      <Clock className="w-4 h-4 text-(--text-muted)" />
                    </button>
                    <button
                      title="Remove Plant"
                      onClick={() => removePlant(plant._id, plant.plant_name)}
                      className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-(--text) mb-1">{plant.plant_name}</h3>
                {plant.nickname && <span className="text-xs text-(--primary) italic">"{plant.nickname}"</span>}

                <div className="flex items-center gap-2 flex-wrap mt-3 mb-3">
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">
                    <Droplets className="w-3 h-3" /> {plant.watering}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full">
                    <Sun className="w-3 h-3" /> {plant.sunlight}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded-full">
                    <BarChart3 className="w-3 h-3" /> {plant.difficulty}
                  </span>
                </div>

                {plant.temperature_min_c != null && (
                  <div className="flex items-center gap-1.5 text-xs text-(--text-muted) mb-3">
                    <Thermometer className="w-3.5 h-3.5" /> {plant.temperature_min_c}°C – {plant.temperature_max_c}°C
                  </div>
                )}

                <p className="text-xs text-(--text-muted) line-clamp-2 mb-4">{plant.description?.substring(0, 100)}...</p>

                {/* Notes */}
                <div className="border-t border-(--border) pt-3">
                  {editingNotes === plant._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        placeholder="Add your care notes..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-xs focus:outline-none focus:border-(--primary) resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveNotes(plant._id)} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-(--primary) text-white hover:opacity-90 transition-opacity">
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setEditingNotes(null)} className="text-xs px-3 py-1.5 rounded-lg bg-(--bg-alt) text-(--text-muted) hover:bg-(--border) transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => { setEditingNotes(plant._id); setNotesText(plant.notes || ""); }}
                      className="flex items-center gap-2 text-xs text-(--text-muted) cursor-pointer hover:text-(--primary) transition-colors p-2 rounded-xl hover:bg-(--bg-alt)"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> {plant.notes || "Click to add notes..."}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-(--text-muted) mt-3 uppercase tracking-wider">
                  Added {new Date(plant.added_date).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 bg-(--card) border border-(--border) rounded-2xl p-5"
          >
            <h3 className="text-base font-bold text-(--text) flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-(--primary)" /> Upcoming Reminders
            </h3>
            <div className="space-y-2">
              {upcomingReminders.map((r) => (
                <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl bg-(--bg-alt) border border-(--border)">
                  {getTaskIcon(r.task)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--text)">{r.plant_name}</p>
                    <p className="text-xs text-(--text-muted)">{r.task} — {new Date(r.date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteReminder(r._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showAddReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddReminder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-(--card) border border-(--border) rounded-3xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-(--text) flex items-center gap-2">
                  <Bell className="w-5 h-5 text-(--primary)" /> Add Reminder
                </h3>
                <button onClick={() => setShowAddReminder(null)} className="p-2 rounded-xl hover:bg-(--bg-alt) transition-colors">
                  <X className="w-5 h-5 text-(--text-muted)" />
                </button>
              </div>
              <p className="text-sm text-(--text-muted) mb-5">For <strong className="text-(--text)">{showAddReminder}</strong></p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">Task Type</label>
                  <select
                    value={reminderForm.task}
                    onChange={(e) => setReminderForm({ ...reminderForm, task: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
                  >
                    <option value="watering">Watering</option>
                    <option value="fertilizing">Fertilizing</option>
                    <option value="pruning">Pruning</option>
                    <option value="repotting">Repotting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-(--text-secondary) mb-1.5">Date</label>
                  <input
                    type="date"
                    value={reminderForm.date}
                    min={getTodayStr()}
                    onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <AnimatedButton size="md" className="flex-1" onClick={addReminder}>
                  Add Reminder
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="md" onClick={() => setShowAddReminder(null)}>
                  Cancel
                </AnimatedButton>
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
    </PageContainer>
  );
};

export default MyPlants;
