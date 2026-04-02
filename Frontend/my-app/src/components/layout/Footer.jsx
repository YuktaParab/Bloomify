import React from "react";
import { motion } from "framer-motion";
import { Leaf, Github, Twitter, Instagram, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/" },
      { label: "Careers", path: "/" },
      { label: "Press Kit", path: "/" },
      { label: "Our Story", path: "/" },
    ]
  },
  {
    title: "Eco-System",
    links: [
      { label: "Space Analysis", path: "/space-analysis" },
      { label: "Plant Catalog", path: "/plant-catalog" },
      { label: "Care Guides", path: "/care-guide" },
      { label: "Community", path: "/my-plants" },
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", path: "/" },
      { label: "Shipping Info", path: "/" },
      { label: "Returns", path: "/" },
      { label: "Contact Us", path: "/" },
    ]
  }
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative w-full bg-(--bg-alt) border-t border-(--border) overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="section-container pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-(--primary) to-(--secondary) flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-(--text) tracking-tight">Bloomify</span>
            </div>
            <p className="text-(--text-secondary) text-base leading-relaxed mb-8 max-w-sm">
              Cultivating the future of indoor gardening with AI-powered insights and sustainable practices. Join our green revolution.
            </p>
            
            <div className="flex items-center gap-4">
              {[Twitter, Instagram, Github, Mail].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ y: -4, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-xl bg-(--card) border border-(--border) flex items-center justify-center text-(--text-secondary) hover:text-(--primary) hover:border-(--primary)/40 transition-all shadow-sm"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-1" /> {/* Spacer */}
          
          {footerLinks.map((column, idx) => (
            <div key={idx} className="lg:col-span-2">
              <h4 className="text-sm font-bold text-(--text) uppercase tracking-widest mb-7">{column.title}</h4>
              <ul className="space-y-4">
                {column.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <button 
                      onClick={() => navigate(link.path)}
                      className="text-(--text-secondary) hover:text-(--primary) text-[0.95rem] transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter / Contact Section */}
          <div className="lg:col-span-3">
             <h4 className="text-sm font-bold text-(--text) uppercase tracking-widest mb-7">Gardening Insights</h4>
             <p className="text-(--text-secondary) text-sm mb-6">Subscribe for seasonal growing tips and exclusive offers.</p>
             <div className="flex flex-col gap-3">
               <div className="relative">
                 <input 
                   type="email" 
                   placeholder="Email address"
                   className="w-full px-4 py-3.5 rounded-xl bg-(--card) border border-(--border) text-sm focus:outline-none focus:border-(--primary) transition-all shadow-inner"
                 />
                 <button className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-(--primary) text-white text-xs font-bold hover:bg-(--primary-hover) transition-colors">
                   Join
                 </button>
               </div>
               <div className="flex items-center gap-2 text-xs text-(--text-muted) px-1">
                 <MapPin size={12} /> Global Support • 24/7
               </div>
             </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-(--border) flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-(--text-muted) font-medium">
            © 2026 Bloomify Inc. <span className="mx-2 opacity-30">|</span> Made for Plant Lovers
          </div>
          
          <div className="flex items-center gap-8">
            <button className="text-sm text-(--text-muted) hover:text-(--primary) transition-colors">Privacy Policy</button>
            <button className="text-sm text-(--text-muted) hover:text-(--primary) transition-colors">Terms of Service</button>
            <button className="text-sm text-(--text-muted) hover:text-(--primary) transition-colors">Cookie Settings</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
