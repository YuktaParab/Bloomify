import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "./Firebase";
import { ShoppingCart, Store, Plus, Filter, X, Star, Search, CreditCard, ChevronDown, Sparkles } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";
import ErrorBoundary from "./ui/ErrorBoundary";
import { useCart } from "../context/CartContext";
import CartDrawer from "./Cart";
import "./ProductsShop.css";

function ShopContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(location.state?.tab || "pre-made"); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { cartCount, addToCart } = useCart();

  const CATEGORIES = ["plants", "crops", "soil", "fertilizer", "pots", "seeds", "tools", "pest-control"];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "pre-made" ? "/products" : "/marketplace";
      const response = await fetch(`http://localhost:3001${endpoint}`);
      if (!response.ok) throw new Error("Backend unreachable");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ProductsShop: Error fetching products:", error);
      setProducts([]);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "" || (product.category || "") === selectedCategory;
    const itemPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
    const matchesPrice = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const success = await addToCart(productId, 1, activeTab === "pre-made" ? "pre-made" : "marketplace");
    if (success) {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="commercial-shop-container animate-fade-in">
      {/* Cart Drawer Overlay */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Premium Hero Banner */}
      <section className="shop-hero-banner relative overflow-hidden rounded-[2.5rem] mb-12">
        <div className="absolute inset-0 mesh-gradient opacity-60"></div>
        <div className="absolute inset-0 bg-linear-to-r from-black/60 to-transparent"></div>
        
        <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <motion.div 
              initial={{ x: -30, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 text-(--primary) font-bold tracking-widest text-sm mb-4"
            >
              <Sparkles size={16} /> PREMIUM GARDENING ESSENTIALS
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight"
            >
              Bloomify <span className="text-transparent bg-clip-text bg-linear-to-r from-(--primary) to-(--secondary)">Market</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 mb-8 max-w-md"
            >
              Elevate your green space with our curated selection of world-class plants, authentic crops, and professional-grade tools.
            </motion.p>
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <AnimatedButton 
              variant="primary" 
              size="lg"
              icon={ShoppingCart}
              onClick={() => setIsCartOpen(true)}
              className="!px-8 !py-4 shadow-xl shadow-emerald-500/20"
            >
              Quick View Cart ({cartCount})
            </AnimatedButton>
            <div className="flex gap-4 items-center justify-center text-white/60 text-sm">
                <span className="flex items-center gap-1"><CreditCard size={14}/> Secure Pay</span>
                <span className="flex items-center gap-1"><Store size={14}/> 25+ Experts</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-4 mb-8 glass-panel !p-2 !rounded-2xl border-(--border-light)">
        <button
          className={`flex-1 min-w-[150px] py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "pre-made" 
              ? "bg-(--primary) text-white shadow-lg shadow-emerald-500/20" 
              : "text-(--text-secondary) hover:text-(--text) hover:bg-(--bg-alt)"
          }`}
          onClick={() => setActiveTab("pre-made")}
        >
          <Store size={18} /> Official Catalog
        </button>
        <button
          className={`flex-1 min-w-[150px] py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "marketplace" 
              ? "bg-(--primary) text-white shadow-lg shadow-emerald-500/20" 
              : "text-(--text-secondary) hover:text-(--text) hover:bg-(--bg-alt)"
          }`}
          onClick={() => setActiveTab("marketplace")}
        >
          <Sparkles size={18} /> Community Market
        </button>
        <AnimatedButton
          variant="secondary"
          onClick={() => navigate("/seller-dashboard")}
          className="flex-1 min-w-[150px] !py-4 !rounded-xl !text-sm !font-bold"
          icon={Plus}
        >
          Start Selling
        </AnimatedButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
        {/* Sidebar Filters */}
        <aside className={`flex flex-col gap-8 lg:sticky lg:top-24 h-fit`}>
          <div className="glass-panel !p-6 border-(--border-light)">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Filter size={20} className="text-(--primary)" /> Refine
              </h3>
              <button 
                className="text-xs font-bold text-(--primary) uppercase tracking-wider hover:opacity-70"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setPriceRange([0, 200]);
                }}
              >
                Reset
              </button>
            </div>

            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">Search Keywords</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-secondary)" size={16} />
                  <input 
                    type="text" 
                    placeholder="Monstera, Soil, etc..."
                    className="w-full bg-(--bg-alt) border border-(--border) rounded-xl py-3 pl-10 pr-3 text-sm focus:ring-2 focus:ring-(--primary) outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">Department</label>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedCategory === "" 
                        ? "bg-(--primary) border-(--primary) text-white" 
                        : "border-(--border) text-(--text-secondary) hover:border-(--primary)"
                    }`}
                    onClick={() => setSelectedCategory("")}
                  >All</button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        selectedCategory === cat 
                          ? "bg-(--primary) border-(--primary) text-white" 
                          : "border-(--border) text-(--text-secondary) hover:border-(--primary)"
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-(--text-secondary) uppercase tracking-wider">Max Price</label>
                  <span className="text-sm font-bold text-(--primary)">${priceRange[1]}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="500" step="10"
                  className="w-full accent-(--primary)"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3x font-black text-(--text)">
              {activeTab === "pre-made" ? "Our Premium Collection" : "Community Marketplace"}
              <span className="ml-3 text-sm font-medium text-(--text-secondary)">({filteredProducts.length} items)</span>
            </h2>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[400px] rounded-3xl bg-(--bg-alt) animate-pulse border border-(--border)"></div>
                ))}
             </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="premium-card flex flex-col group h-full border-(--border-light)"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-2xl mb-4">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-(--bg-alt) flex items-center justify-center text-6xl">📦</div>
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-lg glass-panel text-[10px] font-black uppercase tracking-widest text-white">
                        {product.category}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-1 text-[#F59E0B] mb-2">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold">{product.rating || "4.8"}</span>
                      </div>
                      <h3 className="text-xl font-bold text-(--text) mb-2 group-hover:text-(--primary) transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-(--text-secondary) mb-6 line-clamp-2 leading-relaxed flex-1">
                        {product.description || "Crafted to the highest standards for your premium gardening experience."}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-(--border-light)">
                        <span className="text-2xl font-black text-(--text)">${product.price?.toFixed(2)}</span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAddToCart(product._id)}
                          className="bg-(--text) text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-(--primary) transition-all flex items-center gap-2"
                        >
                          <ShoppingCart size={16} /> Add to Cart
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="glass-panel !p-20 flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-(--bg-alt) flex items-center justify-center text-(--text-secondary) mb-2">
                <Search size={40} />
              </div>
              <h3 className="text-2xl font-bold text-(--text)">No matches found</h3>
              <p className="text-(--text-secondary) max-w-sm">We couldn't find any products matching your current filters. Try refining your search.</p>
              <AnimatedButton variant="secondary" onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}>Clear All Filters</AnimatedButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsShop() {
  return (
    <PageContainer>
      <ErrorBoundary>
        <ShopContent />
      </ErrorBoundary>
    </PageContainer>
  );
}
