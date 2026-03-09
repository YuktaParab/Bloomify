import React from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PageContainer({ children, showFooter = true }) {
  return (
    <div className="min-h-screen bg-(--bg)">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="pt-(--nav-height)"
      >
        {children}
      </motion.main>
      {showFooter && <Footer />}
    </div>
  );
}
