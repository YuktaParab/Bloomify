import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "./Firebase";
import { ChevronLeft, CheckCircle } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import "./Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newOrderId, setNewOrderId] = useState(null);

  const { items = [], total = 0, discount = 0 } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    paymentMethod: "credit_card"
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        setFormData((prev) => ({
          ...prev,
          email: currentUser.email
        }));
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/products-shop");
    }
  }, [items, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: user.email,
          items,
          totalAmount: total + discount,
          discountAmount: discount,
          finalAmount: total,
          shippingAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          paymentMethod: formData.paymentMethod
        })
      });

      if (response.ok) {
        const order = await response.json();
        setNewOrderId(order.orderId || order._id);
        setOrderPlaced(true);
      } else {
        alert("Error placing order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <PageContainer>
        <div className="checkout-container">
          <div className="order-success">
            <div className="success-icon">
              <CheckCircle size={80} color="#10b981" />
            </div>
            <h1>Order Placed Successfully! 🎉</h1>
            <p>Thank you for your purchase. Your order is being processed.</p>

            <div className="order-confirmation">
              <div className="confirmation-item">
                <span className="label">Order ID:</span>
                <span className="value">{newOrderId}</span>
              </div>
              <div className="confirmation-item">
                <span className="label">Total Amount:</span>
                <span className="value">${total.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="confirmation-item discount">
                  <span className="label">Discount Applied:</span>
                  <span className="value">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="confirmation-item">
                <span className="label">Shipping To:</span>
                <span className="value">{formData.city}, {formData.state}</span>
              </div>
            </div>

            <div className="success-actions">
              <button
                className="view-order-btn"
                onClick={() => navigate(`/order-history`)}
              >
                View Order History
              </button>
              <button
                className="continue-shopping-btn"
                onClick={() => navigate("/products-shop")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="checkout-container">
        <div className="checkout-header">
          <button
            className="back-button"
            onClick={() => navigate("/shopping-cart")}
          >
            <ChevronLeft size={20} /> Back
          </button>
          <h1>Checkout</h1>
          <div style={{ width: "100px" }}></div>
        </div>

        <div className="checkout-content">
          {/* Checkout Form */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <h2>Shipping Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="New York"
                  />
                </div>
                <div className="form-group">
                  <label>State/Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    placeholder="NY"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    required
                    placeholder="10001"
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    placeholder="United States"
                  />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={formData.paymentMethod === "credit_card"}
                    onChange={handleChange}
                  />
                  <span>💳 Credit/Debit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === "paypal"}
                    onChange={handleChange}
                  />
                  <span>🅿️ PayPal</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="apple_pay"
                    checked={formData.paymentMethod === "apple_pay"}
                    onChange={handleChange}
                  />
                  <span>🍎 Apple Pay</span>
                </label>
              </div>
            </section>

            <button
              type="submit"
              className="place-order-btn"
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>

          {/* Order Summary */}
          <div className="order-summary-sidebar">
            <h2>Order Summary</h2>

            <div className="order-items">
              {items.map((item) => (
                <div key={item.productId} className="summary-item">
                  <span className="item-qty">x{item.quantity}</span>
                  <span className="item-name">Product #{item.productId.substring(0, 8)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total-section">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${(total + discount).toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row shipping">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
