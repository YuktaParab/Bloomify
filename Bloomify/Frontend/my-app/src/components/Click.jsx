import React, { useRef, useState } from "react";
import axios from "axios";
import "./Click.css"

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
      await axios.post("http://localhost:3000/upload", formData, {
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
    <div className="create-post-container">
      <h2>Camera Post</h2>

      <video
        ref={videoRef}
        autoPlay
        style={{ width: "100%", display: photoTaken ? "none" : "block" }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: photoTaken ? "block" : "none", width: "100%" }}
      />

      {!photoTaken && (
        <>
          <button className="upload-button" onClick={startCamera}>Start Camera</button>
          <button className="upload-button" onClick={takePhoto} disabled={!cameraReady}>
            {cameraReady ? "Take Photo" : "Waiting for camera..."}
          </button>
        </>
      )}

      {photoTaken && (
        <>
          <input
            className="text-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br/>
          <textarea
            className="caption-input"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          /><br/>
          <button className="upload-button" onClick={handleSubmit}>Upload Post</button>
        </>
      )}
    </div>
  );
};

export default Click;