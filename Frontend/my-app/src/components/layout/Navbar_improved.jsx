import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sun, Moon, Menu, X, User, LogOut, Activity, ShoppingCart, Store, ChevronDown } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { auth } from "../Firebase";
import { signOut } from "firebase/auth";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/space-analysis", label: "Space Analysis" },
  { path: "/plant-catalog", label: "Plant Catalog" },
  { path: "/my-plants", label: "My Plants" },
  { path: "/care-guide", label: "Care Guide" },
  { path: "/products-shop", label: "Shop", icon: ShoppingCart },
  { path: "/seller-dashboard", label: "Sell", icon: Store },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

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

  const getUsername = () => {
    if (!user) return "";
    return user.displayName || user.email?.split("@")[0] || "User";
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileDropdownOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-sm border-b border-gray-200 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-md">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight hidden sm:inline">
            Bloomify
          </span>
        </motion.button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-1 mx-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/home");
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  isActive
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-green-600 dark:bg-green-400 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
            title="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {darkMode ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Shopping Cart Icon */}
          <motion.button
            onClick={() => navigate("/shopping-cart")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>

          {/* User Profile */}
          {user ? (
            <div className="relative">
              <motion.button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials()}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white hidden md:inline">
                  {getUsername()}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </motion.button>

              <motion.button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="sm:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center text-white text-xs font-bold"
              >
                {getInitials()}
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-1">
                      <motion.button
                        onClick={() => {
                          navigate("/my-profile");
                          setProfileDropdownOpen(false);
                        }}
                        whileHover={{ x: 4 }}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white text-sm"
                      >
                        <User className="w-4 h-4" />
                        View Profile
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          navigate("/my-activity");
                          setProfileDropdownOpen(false);
                        }}
                        whileHover={{ x: 4 }}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white text-sm"
                      >
                        <Activity className="w-4 h-4" />
                        My Activity
                      </motion.button>

                      <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                      <motion.button
                        onClick={handleLogout}
                        whileHover={{ x: 4 }}
                        className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:inline px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
            >
              Login
            </motion.button>
          )}

          {/* Mobile Menu */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1 max-w-7xl mx-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${
                      isActive
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </motion.button>
                );
              })}
              {user && (
                <>
                  <div className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
                  <motion.button
                    onClick={() => {
                      navigate("/my-profile");
                      setMobileOpen(false);
                    }}
                    className="text-left px-4 py-2.5 rounded-lg text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    My Profile
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="text-left px-4 py-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Logout
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
