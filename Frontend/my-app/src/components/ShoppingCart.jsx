import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ChevronLeft, ShoppingBag, CreditCard, Sparkles } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import { useCart } from "../context/CartContext";
import AnimatedButton from "./ui/AnimatedButton";
import "./ShoppingCart.css";

export default function ShoppingCart() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const { cartItems, updateQuantity, removeFromCart, loading: cartLoading } = useCart();
  const [products, setProducts] = useState({});
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchSubscription(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const detailsToFetch = cartItems.filter(item => !products[item.productId]);
      if (detailsToFetch.length === 0) {
        setLoading(false);
        return;
      }

      const productMap = {};
      let changed = false;
      for (const item of detailsToFetch) {
        try {
          const response = await fetch(`http://localhost:3001/products/${item.productId}`);
          if (response.ok) {
            productMap[item.productId] = await response.json();
            changed = true;
          }
        } catch (error) {
          console.error("ShoppingCart: Error fetching product:", error);
        }
      }
      if (changed) {
        setProducts(prev => ({ ...prev, ...productMap }));
      }
      setLoading(false);
    };
    fetchProductDetails();
  }, [cartItems]);

  const fetchSubscription = useCallback(async (email) => {
    try {
      const response = await fetch(`http://localhost:3001/subscription/${email}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("ShoppingCart: Error fetching subscription:", error);
    }
  }, []);

  const calculateTotals = () => {
    let subtotal = 0;
    cartItems.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        subtotal += product.price * item.quantity;
      }
    });

    let discountAmount = 0;
    if (subscription?.tier === "Advanced") {
      discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
    }

    const total = subtotal - discountAmount;
    return { subtotal, discountAmount, total };
  };

  const { subtotal, discountAmount, total } = calculateTotals();

  const handleCheckout = () => {
    navigate("/checkout", {
      state: { items: cartItems, total, discount: discountAmount }
    });
  };

  return (
    <PageContainer>
      <div className="shopping-cart-container animate-fade-in">
        {/* Header */}
        <div className="cart-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <button
              className="group flex items-center gap-2 text-sm font-bold text-(--text-secondary) hover:text-(--primary) transition-all mb-4"
              onClick={() => navigate("/products-shop")}
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              BACK TO MARKETPLACE
            </button>
            <h1 className="text-4xl font-black text-(--text) flex items-center gap-4">
              Your Shopping Bag
              <span className="text-lg font-medium text-(--text-muted)">({cartItems.length} items)</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-(--text-muted) uppercase tracking-widest">Est. Total</span>
                <span className="text-2xl font-black text-(--text)">${total.toFixed(2)}</span>
             </div>
             <AnimatedButton 
               variant="primary" 
               onClick={handleCheckout}
               disabled={cartItems.length === 0}
               className="!px-10 shadow-xl shadow-emerald-500/20"
               icon={CreditCard}
             >
               Checkout Now
             </AnimatedButton>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="glass-panel !p-24 flex flex-col items-center justify-center text-center gap-6">
            <div className="w-24 h-24 rounded-full bg-(--bg-alt) flex items-center justify-center text-(--text-muted) mb-2">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-(--text)">Your bag is empty</h2>
            <p className="text-(--text-secondary) max-w-sm font-medium">
              Looks like you haven't added any botanical essentials to your collection yet.
            </p>
            <AnimatedButton
              variant="secondary"
              onClick={() => navigate("/products-shop")}
              className="mt-4 !px-8"
            >
              Explore Official Catalog
            </AnimatedButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-10 items-start">
            {/* Bag Items List */}
            <div className="space-y-6">
              {cartItems.map((item) => {
                const product = products[item.productId];
                if (!product) {
                    return (
                      <div key={item.productId} className="h-32 rounded-3xl bg-(--bg-alt) animate-pulse border border-(--border)"></div>
                    );
                }

                return (
                  <motion.div 
                    layout
                    key={item.productId} 
                    className="premium-card !p-6 flex flex-col sm:flex-row items-center gap-8 group"
                  >
                    <div className="w-32 h-32 rounded-2xl bg-(--bg-alt) flex items-center justify-center text-5xl shrink-0 overflow-hidden relative">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <span>📦</span>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg glass-panel text-[8px] font-black uppercase tracking-widest text-white">
                        {product.category}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-(--text) group-hover:text-(--primary) transition-colors">{product.name}</h3>
                          <p className="text-xs font-bold text-(--text-muted) uppercase tracking-widest">
                            {item.source === "pre-made" ? "Official Bloomify Store" : "Community Seller"}
                          </p>
                        </div>
                        <span className="text-xl font-black text-(--text)">${product.price?.toFixed(2)}</span>
                      </div>
                      
                      <p className="text-sm text-(--text-secondary) mb-6 line-clamp-1 max-w-md font-medium">
                        {product.description || "Premium gardening item crafted for the best experience."}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-(--border-light) pt-5">
                        <div className="flex items-center gap-4 bg-(--bg-alt) rounded-xl p-1.5 border border-(--border-light)">
                          <button
                            className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-(--text-secondary) transition-all disabled:opacity-30"
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center text-(--text-secondary) transition-all"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          className="flex items-center gap-2 text-xs font-bold text-red-500/60 hover:text-red-500 transition-colors uppercase tracking-widest"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Sticky Order Summary */}
            <aside className="sticky top-24">
              <div className="glass-panel !p-8 border-(--border-light) space-y-8">
                <h2 className="text-2xl font-black text-(--text)">Order Summary</h2>

                {subscription?.tier === "Advanced" && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-3">
                    <Sparkles size={18} className="shrink-0" />
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest">Active Member</p>
                        <p className="text-sm font-bold">10% Loyalty Discount Applied</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-(--text-secondary)">Subtotal Item(s)</span>
                    <span className="text-lg font-black text-(--text)">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="text-sm font-bold">Member Savings</span>
                      <span className="text-lg font-black">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-(--text-secondary)">Premium Shipping</span>
                    <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Complimentary</span>
                  </div>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-(--border) to-transparent" />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-(--text)">Ground Total</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-(--text-primary)">${total.toFixed(2)}</span>
                    <p className="text-[10px] text-(--text-muted) font-bold uppercase tracking-widest mt-1">Inclusive of VAT</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                    <AnimatedButton 
                      variant="primary" 
                      onClick={handleCheckout} 
                      className="w-full !py-5 shadow-2xl shadow-emerald-500/20"
                      size="lg"
                    >
                        Secure Checkout
                    </AnimatedButton>
                    <div className="flex items-center justify-center gap-4 text-(--text-muted)">
                         <div className="flex items-center gap-1 uppercase text-[10px] font-black tracking-widest">
                            <CreditCard size={12} /> Secure Pay
                         </div>
                         <div className="w-1 h-1 rounded-full bg-(--border)" />
                         <div className="uppercase text-[10px] font-black tracking-widest">
                            SSL Encrypted
                         </div>
                    </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
