import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ShoppingCart, Trash2, ArrowRight, CreditCard, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import AnimatedButton from "./ui/AnimatedButton";

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { cartItems, cartCount, removeFromCart, updateQuantity, loading } = useCart();
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchDetails = async () => {
      const missingIds = cartItems
        .map(i => i.productId)
        .filter(id => !productDetails[id]);

      if (missingIds.length === 0) return;

      const details = {};
      for (const id of missingIds) {
        try {
          const resp = await fetch(`http://localhost:3001/products/${id}`);
          if (resp.ok) {
            details[id] = await resp.json();
          }
        } catch (e) {
          console.error("Cart Drawer: Error fetching product:", e);
        }
      }
      if (Object.keys(details).length > 0) {
        setProductDetails(prev => ({ ...prev, ...details }));
      }
    };
    if (isOpen && cartItems.length > 0) {
      fetchDetails();
    }
  }, [isOpen, cartItems]);

  const subtotal = cartItems.reduce((acc, item) => {
    const product = productDetails[item.productId];
    return acc + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-(--bg) shadow-2xl z-[101] flex flex-col border-l border-(--border)"
          >
            {/* Header */}
            <div className="p-6 border-b border-(--border) flex items-center justify-between bg-(--bg-alt)/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-(--primary)/10 flex items-center justify-center text-(--primary)">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-(--text)">Your Cart</h2>
                  <p className="text-xs text-(--text-secondary) font-medium">{cartItems.length} styles selected</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-(--bg-alt) flex items-center justify-center text-(--text-secondary) transition-colors"
                title="Close Shopping Cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                  <div className="w-20 h-20 rounded-full bg-(--bg-alt) flex items-center justify-center text-(--text-muted) mb-2">
                    <ShoppingCart size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-(--text)">Your cart is empty</h3>
                  <p className="text-(--text-secondary) text-sm max-w-[240px]">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <AnimatedButton 
                    variant="primary" 
                    onClick={() => { onClose(); navigate("/products-shop"); }}
                    className="mt-4"
                  >
                    Start Shopping
                  </AnimatedButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const product = productDetails[item.productId];
                    return (
                      <motion.div 
                        layout
                        key={item.productId}
                        className="flex gap-4 p-4 rounded-2xl border border-(--border-light) bg-(--bg-alt)/30 hover:border-(--primary)/20 transition-colors group"
                      >
                        <div className="w-20 h-20 rounded-xl bg-(--bg-alt) flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                          {product?.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>📦</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-(--text) line-clamp-1 group-hover:text-(--primary) transition-colors">
                              {product?.name || "Loading..."}
                            </h4>
                            <button 
                              onClick={() => removeFromCart(item.productId)}
                              className="text-(--text-muted) hover:text-red-500 transition-colors p-1"
                              title="Delete Item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          
                          <p className="text-xs text-(--text-secondary) mb-3 font-semibold">
                            ${product?.price?.toFixed(2) || "0.00"}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 bg-(--bg-alt) rounded-lg p-1 border border-(--border-light)">
                              <button 
                                onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center text-(--text-secondary) transition-all"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center text-(--text-secondary) transition-all"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-(--text)">
                              ${(product ? product.price * item.quantity : 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-(--border) bg-(--bg-alt)/50 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-(--text-secondary)">Subtotal Estimate</span>
                  <span className="text-xl font-black text-(--text)">${subtotal.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AnimatedButton 
                    variant="secondary" 
                    onClick={() => { onClose(); navigate("/shopping-cart"); }}
                    className="w-full !py-4 font-bold"
                  >
                    Review Cart
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="primary" 
                    onClick={() => { onClose(); navigate("/checkout"); }}
                    className="w-full !py-4 font-bold"
                    icon={CreditCard}
                  >
                    Checkout
                  </AnimatedButton>
                </div>
                <p className="text-[10px] text-center text-(--text-muted) font-medium uppercase tracking-widest">
                  Shipping & Taxes Calculated at Checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
