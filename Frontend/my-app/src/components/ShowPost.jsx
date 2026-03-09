import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Trash2, Clock, User } from "lucide-react";

function ShowPost(props) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [props.refreshTrigger]);

  const fetchFiles = () => {
    axios
      .get("http://localhost:3000/files")
      .then((response) => {
        setFiles(response.data);
      })
      .catch((error) => {
        console.error("Error fetching files", error);
      });
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:3000/delete/${id}`)
      .then(() => {
        fetchFiles();
      })
      .catch((error) => {
        console.error("Error deleting file", error);
      });
  };

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleString();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-(--text) mb-5">Your Feed</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {files.map((file, idx) => (
          <motion.div
            key={file._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden group hover:shadow-lg hover:shadow-(--primary)/5 transition-all"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={file.file_url}
                alt={file.file_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-(--primary)/10 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-(--primary)" />
                </div>
                <span className="text-sm font-semibold text-(--text)">{file.username}</span>
              </div>
              <p className="text-sm text-(--text-secondary) mb-2 line-clamp-2">{file.caption}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] text-(--text-muted)">
                  <Clock className="w-3 h-3" /> {formatTime(file.upload_time)}
                </span>
                <button
                  onClick={() => handleDelete(file._id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ShowPost;
