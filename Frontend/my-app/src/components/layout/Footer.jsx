import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const links = [
    { label: "Home", path: "/" },
    { label: "Space Analysis", path: "/space-analysis" },
    { label: "Plant Catalog", path: "/plant-catalog" },
    { label: "My Plants", path: "/my-plants" },
    { label: "Care Guide", path: "/care-guide" },
  ];

  return (
    <footer className="relative bg-(--bg-alt) border-t border-(--border)">
      <div className="max-w-[1100px] mx-auto px-6 sm:px-10 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-(--text)">Bloomify</span>
            </div>
            <p className="text-(--text-muted) text-sm leading-relaxed">
              Your smart companion for growing healthier plants with AI guidance, eco-friendly practices, and smart automation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-(--text) uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <motion.button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  whileHover={{ x: 4 }}
                  className="text-left text-(--text-muted) hover:text-(--primary) text-sm transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-(--text) uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-(--text-muted) text-sm mb-4">Get plant care tips and updates right in your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-(--card) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2.5 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white text-sm font-medium"
              >
                Join
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-(--border) text-center text-(--text-muted) text-sm">
          © 2026 Bloomify — All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
