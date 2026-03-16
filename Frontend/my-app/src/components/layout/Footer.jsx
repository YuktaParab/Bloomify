import React from "react";
import { motion } from "framer-motion";
import { Leaf, Github, Twitter, Instagram, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  const quickLinks = [
    { label: "Home", path: "/" },
    { label: "Space Analysis", path: "/space-analysis" },
    { label: "Plant Catalog", path: "/plant-catalog" },
    { label: "My Plants", path: "/my-plants" },
    { label: "Care Guide", path: "/care-guide" },
  ];

  const resources = [
    { label: "Getting Started", path: "/" },
    { label: "Plant Care Tips", path: "/care-guide" },
    { label: "AI Analysis", path: "/space-analysis" },
    { label: "Community", path: "/" },
  ];

  const socials = [
    { icon: Twitter, label: "Twitter" },
    { icon: Instagram, label: "Instagram" },
    { icon: Github, label: "GitHub" },
    { icon: Mail, label: "Email" },
  ];

  return (
    <footer className="relative w-full bg-(--bg-alt) border-t border-(--border)">
      <div className="max-w-[1360px] mx-auto px-10 sm:px-14 lg:px-20 py-24 sm:py-28 lg:py-[120px]" style={{ marginLeft: "auto", marginRight: "auto", paddingLeft: "140px" }}>

        {/* Top: Logo centered */}
        <div className="flex flex-col items-center text-center mb-16 lg:mb-20" style={{ marginTop: "100px", marginBottom: "74px" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-(--text)">Bloomify</span>
          </div>
          <p className="text-(--text-muted) text-[0.95rem] leading-[1.8] max-w-md">
            Your smart companion for growing healthier plants with AI guidance, eco-friendly practices, and smart automation.
          </p>
        </div>

        {/* Middle: Link columns centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14 sm:gap-16 lg:gap-[80px] max-w-[960px] mx-auto text-center mb-16 lg:mb-20">

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-(--text) uppercase tracking-wider mb-7">Quick Links</h4>
            <div className="flex flex-col gap-4">
              {quickLinks.map((link) => (
                <motion.button
                  key={link.path + link.label}
                  onClick={() => navigate(link.path)}
                  whileHover={{ scale: 1.04 }}
                  className="text-(--text-muted) hover:text-(--primary) text-[0.95rem] transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-(--text) uppercase tracking-wider mb-7">Resources</h4>
            <div className="flex flex-col gap-4">
              {resources.map((link) => (
                <motion.button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  whileHover={{ scale: 1.04 }}
                  className="text-(--text-muted) hover:text-(--primary) text-[0.95rem] transition-colors"
                >
                  {link.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-semibold text-(--text) uppercase tracking-wider mb-7">Stay Updated</h4>
            <p className="text-(--text-muted) text-[0.95rem] leading-[1.7] mb-6">
              Get plant care tips and updates right in your inbox.
            </p>
            <div className="flex gap-2 max-w-xs mx-auto">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-xl bg-(--card) border border-(--border) text-(--text) text-sm placeholder:text-(--text-muted) focus:outline-none focus:border-(--primary) transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-3 rounded-xl bg-linear-to-r from-(--primary) to-(--secondary) text-white text-sm font-medium"
              >
                Join
              </motion.button>
            </div>
          </div>

        </div>

        {/* Social Icons centered */}
        <div className="flex items-center justify-center gap-5 mb-16 lg:mb-20">
          {socials.map((s) => (
            <motion.a
              key={s.label}
              href="#"
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 rounded-xl bg-(--card) border border-(--border) flex items-center justify-center text-(--text-muted) hover:text-(--primary) hover:border-(--primary)/40 transition-colors"
              aria-label={s.label}
            >
              <s.icon className="w-5 h-5" />
            </motion.a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-(--border) flex flex-col sm:flex-row items-center justify-between gap-4 text-(--text-muted) text-sm">
          <span style={{ marginLeft: "100px" }}>© 2026 Bloomify — All Rights Reserved</span>
          <div className="flex items-center gap-6">
            <button className="hover:text-(--primary) transition-colors">Privacy</button>
            <button className="hover:text-(--primary) transition-colors">Terms</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
