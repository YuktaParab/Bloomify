import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { Trash2, Plus, Minus, ChevronLeft } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import "./ShoppingCart.css";

export default function ShoppingCart() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState({});

  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        fetchCart(currentUser.email);
        fetchSubscription(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, [navigate, fetchCart, fetchSubscription]);

  const fetchProductDetails = async (items) => {
    const productMap = {};
    for (const item of items) {
      try {
        const response = await fetch(
          `http://localhost:3000/products/${item.productId}`
        );
        if (response.ok) {
          const product = await response.json();
          productMap[item.productId] = product;
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }
    setProducts(productMap);
  };

  const fetchCart = useCallback(async (email) => {
    try {
      const response = await fetch(`http://localhost:3000/cart/${email}`);
      const data = await response.json();
      setCartItems(data.items || []);
      await fetchProductDetails(data.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }, []);

  const fetchSubscription = useCallback(async (email) => {
    try {
      const response = await fetch(
        `http://localhost:3000/subscription/${email}`
      );
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:3000/cart/${user.email}/${productId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: newQuantity })
        }
      );

      if (response.ok) {
        await fetchCart(user.email);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (productId) => {
    if (!user) return;

    try {
      const response = await fetch(
        `http://localhost:3000/cart/${user.email}/${productId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        await fetchCart(user.email);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    cartItems.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        subtotal += product.price * item.quantity;
      }
    });

    // Apply 10% discount for Advanced members
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
      <div className="shopping-cart-container">
        {/* Header */}
        <div className="cart-header">
          <button
            className="back-button"
            onClick={() => navigate("/products-shop")}
          >
            <ChevronLeft size={20} /> Back to Shop
          </button>
          <h1>🛒 Shopping Cart</h1>
          <div style={{ width: "100px" }}></div>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Start shopping to add items to your cart!</p>
            <button
              className="continue-shopping-btn"
              onClick={() => navigate("/products-shop")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items-section">
              <h2>Cart Items ({cartItems.length})</h2>
              <div className="cart-items-list">
                {cartItems.map((item) => {
                  const product = products[item.productId];
                  if (!product)
                    return (
                      <div key={item.productId} className="cart-item loading">
                        Loading product...
                      </div>
                    );

                  return (
                    <div key={item.productId} className="cart-item">
                      <div className="item-image">
                        <span className="item-emoji">{product.image || "📦"}</span>
                      </div>

                      <div className="item-details">
                        <h3>{product.name}</h3>
                        <p className="item-price">${product.price}</p>
                        <p className="item-source">
                          {item.source === "pre-made"
                            ? "Featured Product"
                            : "Marketplace"}
                        </p>
                      </div>

                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="qty">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="item-total">
                        <span>${(product.price * item.quantity).toFixed(2)}</span>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeItem(item.productId)}
                        title="Remove from cart"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>

              {subscription?.tier === "Advanced" && (
                <div className="premium-badge">
                  ✨ Premium Member - 10% Discount Applied!
                </div>
              )}

              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Discount (10%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row shipping">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>

              <button
                className="continue-shopping-btn secondary"
                onClick={() => navigate("/products-shop")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
