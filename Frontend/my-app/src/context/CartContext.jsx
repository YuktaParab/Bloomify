import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth } from "../components/Firebase";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const fetchCart = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/cart/${email}`);
      const data = await response.json();
      const items = data.items || [];
      setCartItems(items);
      
      const count = items.reduce((acc, item) => acc + (item.quantity || 0), 0);
      setCartCount(count);
      
      // Calculate subtotal - we'll need product details but for basic count it's fine
    } catch (error) {
      console.error("Cart Context: Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUserEmail(currentUser.email);
        fetchCart(currentUser.email);
      } else {
        setUserEmail(null);
        setCartItems([]);
        setCartCount(0);
      }
    });
    return () => unsubscribe();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, source = "pre-made") => {
    if (!userEmail) return false;
    
    try {
      const response = await fetch(`http://localhost:3001/cart/${userEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, source })
      });
      
      if (response.ok) {
        await fetchCart(userEmail);
        return true;
      }
    } catch (error) {
      console.error("Cart Context: Error adding to cart:", error);
    }
    return false;
  };

  const removeFromCart = async (productId) => {
    if (!userEmail) return false;
    
    try {
      const response = await fetch(`http://localhost:3001/cart/${userEmail}/${productId}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        await fetchCart(userEmail);
        return true;
      }
    } catch (error) {
      console.error("Cart Context: Error removing from cart:", error);
    }
    return false;
  };

  const updateQuantity = async (productId, quantity) => {
    if (!userEmail) return false;
    
    try {
      const response = await fetch(`http://localhost:3001/cart/${userEmail}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      });
      
      if (response.ok) {
        await fetchCart(userEmail);
        return true;
      }
    } catch (error) {
      console.error("Cart Context: Error updating quantity:", error);
    }
    return false;
  };

  const clearCart = async () => {
    if (!userEmail) return false;
    
    try {
      const response = await fetch(`http://localhost:3001/cart/${userEmail}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        await fetchCart(userEmail);
        return true;
      }
    } catch (error) {
      console.error("Cart Context: Error clearing cart:", error);
    }
    return false;
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount, 
      cartTotal, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      refreshCart: () => fetchCart(userEmail)
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
