import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Type, Upload, ImagePlus } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

function CreatePost(props){
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !username.trim() || !caption.trim()) {
      setMessage("Please fill in username, caption and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);
    formData.append("caption", caption);

    try {
      await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Post created successfully!");
      props.setRefreshTrigger(
        (prev)=>prev+1
      );
      setUsername("");
      setCaption("");
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage("Error uploading post.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--card) border border-(--border) rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold text-(--text) mb-5 flex items-center gap-2">
        <ImagePlus className="w-5 h-5 text-(--primary)" /> Create a New Post
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
          />
        </div>

        <div className="relative">
          <Type className="absolute left-3.5 top-3.5 w-4 h-4 text-(--text-muted)" />
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all resize-none"
          />
        </div>

        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-(--border) hover:border-(--primary)/50 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-(--text-muted)" />
          <span className="text-sm text-(--text-muted)">
            {file ? file.name : "Choose a file..."}
          </span>
          <input type="file" onChange={handleFileChange} className="hidden" />
        </label>

        <AnimatedButton type="submit" size="md" className="w-full">
          <Upload className="w-4 h-4" /> Upload
        </AnimatedButton>
      </form>
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-3 text-sm font-medium text-center ${message.includes("Error") ? "text-red-500" : "text-emerald-500"}`}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
};

export default CreatePost;
