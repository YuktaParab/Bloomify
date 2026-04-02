import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Heart, Search, Calendar, Leaf, BarChart3 } from "lucide-react";
import { auth } from "./Firebase";
import PageContainer from "./layout/PageContainer";
import "./UserActivity.css";

export default function UserActivity() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState("all");
  const [preferences, setPreferences] = useState({
    vegetables: 0,
    fruits: 0,
    flowers: 0,
    herbs: 0,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserActivity(currentUser.uid);
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const loadUserActivity = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/activity/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
        setPreferences(data.preferences || {});
      }
    } catch (error) {
      console.error("Failed to load activity:", error);
      // Use mock data for demonstration
      setActivities(mockActivities);
      setPreferences(mockPreferences);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockActivities = [
    {
      _id: "1",
      userId: user?.uid,
      action: "view",
      plantName: "Tomato Plant",
      category: "vegetables",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      _id: "2",
      userId: user?.uid,
      action: "search",
      searchTerm: "easy vegetables",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      _id: "3",
      userId: user?.uid,
      action: "select",
      plantName: "Basil",
      category: "herbs",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  const mockPreferences = {
    vegetables: 3,
    fruits: 1,
    flowers: 2,
    herbs: 5,
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case "view":
        return <Eye className="w-4 h-4" />;
      case "search":
        return <Search className="w-4 h-4" />;
      case "select":
        return <Heart className="w-4 h-4" />;
      default:
        return <Leaf className="w-4 h-4" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity.action) {
      case "view":
        return `Viewed ${activity.plantName} (${activity.category})`;
      case "search":
        return `Searched for "${activity.searchTerm}"`;
      case "select":
        return `Added ${activity.plantName} to favorites`;
      default:
        return "Unknown activity";
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case "view":
        return "text-blue-500";
      case "search":
        return "text-purple-500";
      case "select":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const filteredActivities =
    activityFilter === "all"
      ? activities
      : activities.filter((a) => a.action === activityFilter);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PageContainer>
      <div className="pt-20 pb-12">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) hover:text-(--primary) transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-(--text) mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-(--primary)" />
            My Activity
          </h1>
          <p className="text-(--text-secondary)">
            Track your plant exploration and preferences
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Preferences Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3 rounded-2xl border border-(--border) backdrop-blur-xl p-6"
            style={{
              background: "color-mix(in srgb, var(--card) 85%, transparent)",
            }}
          >
            <h2 className="text-lg font-bold text-(--text) mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-(--primary)" />
              Your Preferences
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(preferences).map(([category, count]) => (
                <div
                  key={category}
                  className="p-4 rounded-lg bg-(--bg-alt) border border-(--border)"
                >
                  <p className="text-(--text-secondary) text-sm font-medium mb-1 capitalize">
                    {category}
                  </p>
                  <p className="text-2xl font-bold text-(--primary)">{count}</p>
                  <p className="text-xs text-(--text-muted) mt-1">interactions</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-3 flex flex-wrap gap-2"
          >
            {["all", "view", "search", "select"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActivityFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activityFilter === filter
                    ? "bg-(--primary) text-white"
                    : "border border-(--border) text-(--text) hover:border-(--primary)"
                }`}
              >
                {filter === "all"
                  ? "All Activities"
                  : filter === "view"
                  ? "Viewed"
                  : filter === "search"
                  ? "Searched"
                  : "Liked"}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Activities List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-(--border) backdrop-blur-xl p-4 hover:bg-(--bg-alt) transition-colors"
                style={{
                  background:
                    "color-mix(in srgb, var(--card) 85%, transparent)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-(--bg-alt) flex items-center justify-center ${getActivityColor(
                      activity.action
                    )}`}
                  >
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-(--text)">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-(--text-secondary) text-sm">
                      <Calendar className="w-3 h-3" />
                      {formatTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-(--border) backdrop-blur-xl p-8 text-center"
              style={{
                background:
                  "color-mix(in srgb, var(--card) 85%, transparent)",
              }}
            >
              <Leaf className="w-12 h-12 mx-auto text-(--text-secondary) mb-4 opacity-50" />
              <p className="text-(--text-secondary) font-medium">
                No activities yet. Start exploring plants!
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
