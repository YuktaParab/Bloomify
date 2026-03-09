import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import AnimatedButton from "./ui/AnimatedButton";

function SearchUser(){
  const [username, setUsername] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false); 

  const handleSearch = () => {
    if (!username.trim()) return;

    axios
      .get(`http://localhost:3000/files?username=${username}`)
      .then((response) => {
        setSearchResults(response.data);
        setError("");
        setSearched(true);
      })
      .catch((error) => {
        setError("Error fetching user posts.");
        setSearchResults([]);
        setSearched(true);
      });
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
          <input
            type="text"
            placeholder="Search by username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-(--bg-alt) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/20 transition-all"
          />
        </div>
        <AnimatedButton size="md" onClick={handleSearch}>
          <Search className="w-4 h-4" /> Search
        </AnimatedButton>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {searched ? (
          searchResults.length > 0 ? (
            searchResults.map((file, idx) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-(--card) border border-(--border) rounded-2xl overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-(--text-secondary)">{file.caption}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-(--text-muted) col-span-full text-center py-8">No posts found for this username.</p>
          )
        ) : null}
      </div>
    </div>
  );
};

export default SearchUser;
