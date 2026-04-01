import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sun, Moon, Menu, X, User, LogOut, Activity, ShoppingCart, Store } from "lucide-react";
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

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // Get user initials for avatar
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

  // Get username from display name or email
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-(--glass-bg) shadow-lg border-b border-(--glass-border)"
          : "bg-transparent"
      }`}
      style={{ height: "var(--nav-height)" }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
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
        <div className="hidden md:flex flex-1 items-center justify-center gap-8 lg:gap-12">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/home");
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  isActive
                    ? "text-(--primary)"
                    : "text-(--text-secondary) hover:text-(--text)"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
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

        {/* Actions — extreme right */}
        <div className="flex items-center gap-3 ml-auto flex-shrink-0">
          {/* Shopping Cart Icon */}
          <motion.button
            onClick={() => navigate("/shopping-cart")}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-xl bg-(--bg-alt) border border-(--border) flex items-center justify-center text-(--text-secondary) hover:text-(--primary) transition-colors"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </motion.button>

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

          {/* User Profile Section */}
          {user ? (
            <div className="relative">
              <motion.button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl bg-(--bg-alt) border border-(--border) hover:border-(--primary) transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center text-white text-xs font-bold">
                  {getInitials()}
                </div>
                <span className="text-sm font-medium text-(--text)">Hi, {getUsername()}👋</span>
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-(--border) backdrop-blur-xl bg-(--glass-bg) shadow-lg overflow-hidden z-50"
                  >
                    <div className="p-3">
                      {/* View Profile */}
                      <motion.button
                        onClick={() => {
                          navigate("/my-profile");
                          setProfileDropdownOpen(false);
                        }}
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-(--bg-alt) transition-colors text-(--text)"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">View Profile</span>
                      </motion.button>

                      {/* My Activity */}
                      <motion.button
                        onClick={() => {
                          navigate("/my-activity");
                          setProfileDropdownOpen(false);
                        }}
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-(--bg-alt) transition-colors text-(--text)"
                      >
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-medium">My Activity</span>
                      </motion.button>

                      <div className="my-2 h-px bg-(--border)" />

                      {/* Logout */}
                      <motion.button
                        onClick={handleLogout}
                        whileHover={{ x: 4 }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mobile Profile Icon */}
              <motion.button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden w-10 h-10 rounded-xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center text-white font-bold text-xs"
              >
                {getInitials()}
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="hidden md:flex px-5 py-2.5 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              Login
            </motion.button>
          )}

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
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                      isActive
                        ? "bg-(--primary) text-white"
                        : "text-(--text-secondary) hover:bg-(--bg-alt)"
                    }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </motion.button>
                );
              })}
              {user ? (
                <>
                  <div className="my-2 h-px bg-(--border)" />
                  <p className="px-4 py-2 text-xs font-semibold text-(--text-secondary) uppercase">Account</p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      navigate("/my-profile");
                      setMobileOpen(false);
                    }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors text-(--text-secondary) hover:bg-(--bg-alt) flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      navigate("/my-activity");
                      setMobileOpen(false);
                    }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors text-(--text-secondary) hover:bg-(--bg-alt) flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    My Activity
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/login")}
                  className="mt-2 px-4 py-3 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white text-sm font-semibold text-center"
                >
                  Login
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
