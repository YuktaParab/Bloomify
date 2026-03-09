import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/space-analysis", label: "Space Analysis" },
  { path: "/plant-catalog", label: "Plant Catalog" },
  { path: "/my-plants", label: "My Plants" },
  { path: "/care-guide", label: "Care Guide" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-(--glass-bg) shadow-lg border-b border-(--glass-border)"
          : "bg-transparent"
      }`}
      style={{ height: "var(--nav-height)" }}
    >
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-12 h-full flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center shadow-md">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-(--text) tracking-tight">
            Bloomify
          </span>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/home");
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-(--primary)"
                    : "text-(--text-secondary) hover:text-(--text)"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-(--primary) rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-(--bg-alt) border border-(--border) flex items-center justify-center text-(--text-secondary) hover:text-(--primary) transition-colors"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="hidden md:flex px-5 py-2.5 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            Login
          </motion.button>

          {/* Mobile Hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-(--bg-alt) border border-(--border) flex items-center justify-center text-(--text)"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden backdrop-blur-xl bg-(--glass-bg) border-b border-(--border) overflow-hidden"
          >
            <div className="px-10 py-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    whileTap={{ scale: 0.97 }}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-(--primary) text-white"
                        : "text-(--text-secondary) hover:bg-(--bg-alt)"
                    }`}
                  >
                    {item.label}
                  </motion.button>
                );
              })}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="mt-2 px-4 py-3 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white text-sm font-semibold text-center"
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
