import React, { useRef, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Camera, User, Type, Upload } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton"

const Click = ({ onClose, onUpload }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [username, setUsername] = useState("");
  const [caption, setCaption] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      videoRef.current.srcObject = s;
      // Ensure the video plays and metadata is loaded before allowing capture
      await new Promise((resolve, reject) => {
        const v = videoRef.current;
        const onCanPlay = () => {
          setCameraReady(true);
          v.removeEventListener("canplay", onCanPlay);
          resolve();
        };
        const onError = (err) => {
          v.removeEventListener("error", onError);
          reject(err);
        };
        v.addEventListener("canplay", onCanPlay);
        v.addEventListener("error", onError);
        // try to start playing in case autoPlay didn't
        v.play().catch(() => {});
      });
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera");
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    const vw = video.videoWidth || 0;
    const vh = video.videoHeight || 0;
    if (vw === 0 || vh === 0) {
      alert("Camera not ready yet. Please wait a moment and try again.");
      return;
    }
    canvas.width = vw;
    canvas.height = vh;
    ctx.drawImage(video, 0, 0, vw, vh);
    setPhotoTaken(true);
    // stop camera tracks and clear video srcObject
    try {
      if (video.srcObject && video.srcObject.getTracks) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      } else if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.warn("Error stopping camera tracks", e);
    }
    if (video.srcObject) video.srcObject = null;
    setCameraReady(false);
  };

  const handleSubmit = async () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");
  
    const blob = await (await fetch(imageData)).blob();
    const formData = new FormData();
    formData.append("file", blob, "photo.png"); 
    formData.append("username", username);
    formData.append("caption", caption);
  
    try {
      await axios.post("http://localhost:3001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      alert("Post created!");
      setUsername("");
      setCaption("");
      setPhotoTaken(false);
      onUpload(); 
      onClose(); 
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading post.");
    }
  };
  

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--card) border border-(--border) rounded-2xl p-6"
    >
      <h2 className="text-xl font-bold text-(--text) mb-5 flex items-center gap-2">
        <Camera className="w-5 h-5 text-(--primary)" /> Camera Post
      </h2>

      <video
        ref={videoRef}
        autoPlay
        className="w-full rounded-xl mb-4"
        style={{ display: photoTaken ? "none" : "block" }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: photoTaken ? "block" : "none" }}
        className="w-full rounded-xl mb-4"
      />

      {!photoTaken && (
        <div className="flex gap-3 mb-4">
          <AnimatedButton size="md" onClick={startCamera}>Start Camera</AnimatedButton>
          <AnimatedButton variant="outline" size="md" onClick={takePhoto} disabled={!cameraReady}>
            {cameraReady ? "Take Photo" : "Waiting for camera..."}
          </AnimatedButton>
        </div>
      )}

      {photoTaken && (
        <div className="space-y-4">
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
              placeholder="Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all resize-none"
            />
          </div>
          <AnimatedButton size="md" className="w-full" onClick={handleSubmit}>
            <Upload className="w-4 h-4" /> Upload Post
          </AnimatedButton>
        </div>
      )}
    </motion.div>
  );
};

export default Click;