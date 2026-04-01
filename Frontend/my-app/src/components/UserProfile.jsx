import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, User, Calendar, ArrowLeft, Edit2 } from "lucide-react";
import { auth } from "./Firebase";
import PageContainer from "./layout/PageContainer";
import "./UserProfile.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleUpdateProfile = async () => {
    try {
      await user.updateProfile({ displayName });
      setUser({ ...user, displayName });
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const getInitials = () => {
    if (!user) return "";
    const name = user.displayName || user.email;
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto rounded-2xl border border-(--border) backdrop-blur-xl p-8"
          style={{ background: "color-mix(in srgb, var(--card) 85%, transparent)" }}
        >
          {/* Avatar & Username */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
              {getInitials()}
            </div>
            <h1 className="text-3xl font-bold text-(--text) mb-2">
              {user.displayName || "User Profile"}
            </h1>
            <p className="text-(--text-secondary) flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          </div>

          <div className="h-px bg-(--border) my-8" />

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-(--text-secondary) mb-2 uppercase">
                Display Name
              </label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-(--border) bg-(--bg-alt) text-(--text) focus:outline-none focus:border-(--primary)"
                    placeholder="Enter display name"
                  />
                  <button
                    onClick={handleUpdateProfile}
                    className="px-4 py-2 rounded-lg bg-(--primary) text-white font-medium hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border border-(--border) text-(--text) hover:bg-(--bg-alt)"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-lg border border-(--border) bg-(--bg-alt)">
                  <p className="text-(--text) font-medium">{displayName || "Not set"}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--primary) text-white text-sm hover:opacity-90"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-(--text-secondary) mb-2 uppercase">
                Email Address
              </label>
              <div className="p-4 rounded-lg border border-(--border) bg-(--bg-alt) text-(--text-muted)">
                {user.email}
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-semibold text-(--text-secondary) mb-2 uppercase">
                Account Created
              </label>
              <div className="flex items-center gap-2 p-4 rounded-lg border border-(--border) bg-(--bg-alt) text-(--text)">
                <Calendar className="w-4 h-4 text-(--text-secondary)" />
                {user.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-semibold text-(--text-secondary) mb-2 uppercase">
                Account Status
              </label>
              <div className="p-4 rounded-lg border border-(--border) bg-(--bg-alt)">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-(--text) font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              💡 Your profile information helps us provide personalized plant recommendations and activity tracking.
            </p>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
