import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { Package, ChevronRight, Calendar } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import "./OrderHistory.css";

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusColors = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#10b981",
    cancelled: "#ef4444"
  };

  const statusLabels = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        fetchOrders(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchOrders = async (email) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/orders/${email}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <PageContainer>
      <div className="order-history-container">
        {/* Header */}
        <div className="orders-header">
          <div className="header-content">
            <Package className="header-icon" />
            <div>
              <h1>Order History</h1>
              <p>Track your purchases and deliveries</p>
            </div>
          </div>
          <button
            className="back-to-shop"
            onClick={() => navigate("/products-shop")}
          >
            Continue Shopping
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {loading ? (
            <div className="loading">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <div className="empty-icon">📦</div>
              <h2>No Orders Yet</h2>
              <p>Start shopping to see your order history here!</p>
              <button
                className="start-shopping"
                onClick={() => navigate("/products-shop")}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <h3>Order #{order.orderNumber}</h3>
                    <div className="order-meta">
                      <span className="order-date">
                        <Calendar size={16} />
                        {formatDate(order.createdAt)} at{" "}
                        {formatTime(order.createdAt)}
                      </span>
                      <span className="order-items">
                        {order.items.length} item(s)
                      </span>
                    </div>
                  </div>

                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: statusColors[order.status] || "#6b7280",
                        color: "white"
                      }}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="items-preview">
                    <strong>Items:</strong>
                    <div className="items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="item-preview">
                          <span className="item-qty">×{item.quantity}</span>
                          <span className="item-id">
                            Product #{item.productId.substring(0, 8)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shipping-info">
                    <strong>Shipping To:</strong>
                    <p>
                      {order.shippingAddress?.fullName}
                      <br />
                      {order.shippingAddress?.address}
                      <br />
                      {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state}{" "}
                      {order.shippingAddress?.zipCode}
                    </p>
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="price-section">
                    <div className="price-row">
                      <span>Subtotal:</span>
                      <span>
                        ${(
                          order.totalAmount - order.discountAmount
                        ).toFixed(2)}
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="price-row discount">
                        <span>Discount:</span>
                        <span>-${order.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="price-row total">
                      <span>Total:</span>
                      <span>${order.finalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    className="view-details-btn"
                    onClick={() =>
                      setSelectedOrder(
                        selectedOrder?._id === order._id ? null : order
                      )
                    }
                  >
                    <span>
                      {selectedOrder?._id === order._id
                        ? "Hide Details"
                        : "View Details"}
                    </span>
                    <ChevronRight
                      size={18}
                      style={{
                        transform:
                          selectedOrder?._id === order._id
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.3s ease"
                      }}
                    />
                  </button>
                </div>

                {selectedOrder?._id === order._id && (
                  <div className="order-details">
                    <div className="detail-section">
                      <h4>Payment Details</h4>
                      <div className="detail-row">
                        <span>Payment Method:</span>
                        <span>
                          {order.paymentMethod === "credit_card"
                            ? "💳 Credit/Debit Card"
                            : order.paymentMethod === "paypal"
                            ? "🅿️ PayPal"
                            : "🍎 Apple Pay"}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Order ID:</span>
                        <span className="monospace">{order._id}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Full Item List</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="detail-row">
                          <span>
                            Product #{item.productId.substring(0, 8)}
                          </span>
                          <span>Quantity: {item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="detail-section">
                      <h4>Timeline</h4>
                      <div className="timeline">
                        <div className="timeline-item">
                          <div className="timeline-marker pending"></div>
                          <div className="timeline-content">
                            <span>Order Placed</span>
                            <p>{formatDate(order.createdAt)}</p>
                          </div>
                        </div>

                        {["processing", "shipped", "delivered"].includes(
                          order.status
                        ) && (
                          <div
                            className="timeline-item"
                            style={{
                              opacity:
                                order.status === "processing" ? 1 : 0.7
                            }}
                          >
                            <div className="timeline-marker processing"></div>
                            <div className="timeline-content">
                              <span>Processing</span>
                              <p>1-2 business days</p>
                            </div>
                          </div>
                        )}

                        {["shipped", "delivered"].includes(order.status) && (
                          <div
                            className="timeline-item"
                            style={{
                              opacity:
                                order.status === "shipped" ||
                                order.status === "delivered"
                                  ? 1
                                  : 0.7
                            }}
                          >
                            <div className="timeline-marker shipped"></div>
                            <div className="timeline-content">
                              <span>Shipped</span>
                              <p>Tracking number available</p>
                            </div>
                          </div>
                        )}

                        {order.status === "delivered" && (
                          <div className="timeline-item">
                            <div className="timeline-marker delivered"></div>
                            <div className="timeline-content">
                              <span>Delivered</span>
                              <p>{formatDate(order.updatedAt)}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
}
