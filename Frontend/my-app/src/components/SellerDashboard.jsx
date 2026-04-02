import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { Store, Plus, Edit2, Trash2, ChevronLeft } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import "./SellerDashboard.css";

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [listings, setListings] = useState([]);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkSellerStatus(currentUser.email);
        fetchListings(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkSellerStatus = async (email) => {
    try {
      const response = await fetch(`http://localhost:3001/sellers/${email}`);
      if (response.ok) {
        const seller = await response.json();
        setIsSeller(true);
        setStoreName(seller.storeName || "");
        setStoreDescription(seller.description || "");
        setPhone(seller.phone || "");
        setAddress(seller.address || "");
      }
    } catch (error) {
      console.error("Error checking seller status:", error);
    }
  };

  const fetchListings = async (email) => {
    try {
      const response = await fetch(`http://localhost:3001/seller-listings/${email}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data || []);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    if (!user || !storeName) return;

    try {
      const response = await fetch(`http://localhost:3001/sellers?email=${user.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          description: storeDescription,
          phone,
          address
        })
      });

      if (response.ok) {
        setIsSeller(true);
        setShowSellerForm(false);
        alert("✓ Welcome to the marketplace! Start selling now!");
      }
    } catch (error) {
      console.error("Error creating seller profile:", error);
      alert("Error creating seller profile");
    }
  };

  const deleteListing = async () => {
    if (!window.confirm("Delete this listing?")) return;

    try {
      // Note: We need a delete endpoint - for now showing UI
      alert("Delete functionality coming soon");
      // await fetch(`http://localhost:3001/marketplace/${listingId}`, { method: "DELETE" });
      // await fetchListings(user.email);
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  return (
    <PageContainer>
      <div className="seller-dashboard-container">
        {/* Login Prompt */}
        {!user && (
          <div className="login-prompt" style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            marginBottom: '40px'
          }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--text)' }}>
              Sign In to Become a Seller
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Create an account or log in to start selling your plants and products
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: '12px 32px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: 'white',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginRight: '12px'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              style={{
                padding: '12px 32px',
                borderRadius: '12px',
                background: 'transparent',
                color: 'var(--primary)',
                border: '2px solid var(--primary)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {user && (
          <>
        {/* Header */}
        <div className="dashboard-header">
          <button
            className="back-button"
            onClick={() => navigate("/products-shop")}
          >
            <ChevronLeft size={20} /> Back
          </button>
          <div className="header-title">
            <Store className="header-icon" />
            <h1>Seller Dashboard</h1>
          </div>
          <div style={{ width: "100px" }}></div>
        </div>

        {!isSeller ? (
          // Become Seller Form
          <div className="seller-registration">
            <div className="registration-card">
              <div className="registration-icon">🏪</div>
              <h2>Launch Your Store</h2>
              <p>Start selling your plant-related products on our marketplace</p>

              {!showSellerForm ? (
                <button
                  className="start-selling-btn"
                  onClick={() => setShowSellerForm(true)}
                >
                  <Plus size={18} /> Start Selling
                </button>
              ) : (
                <form className="seller-form" onSubmit={handleBecomeSeller}>
                  <div className="form-group">
                    <label>Store Name *</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      placeholder="e.g., Green Thumb Supplies"
                    />
                  </div>

                  <div className="form-group">
                    <label>Store Description</label>
                    <textarea
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                      placeholder="Tell customers about your store..."
                      rows="4"
                    ></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main Street"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      Create Store
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowSellerForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="benefits-section">
              <h3>Why Sell With Us?</h3>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">📱</div>
                  <h4>Easy to Use</h4>
                  <p>Simple interface to manage your products</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🌍</div>
                  <h4>Reach Customers</h4>
                  <p>Connect with plant lovers worldwide</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">📊</div>
                  <h4>Analytics</h4>
                  <p>Track your sales and performance</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🔒</div>
                  <h4>Secure</h4>
                  <p>Secure transactions and buyer protection</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Seller Dashboard
          <div className="active-dashboard">
            {/* Store Info */}
            <div className="store-info-card">
              <div className="store-header">
                <div>
                  <h2>{storeName}</h2>
                  <p className="store-desc">{storeDescription}</p>
                  <div className="store-stats">
                    <span>📦 {listings.length} Products</span>
                    <span>⭐ 4.8 Rating</span>
                    <span>💰 150 Sales</span>
                  </div>
                </div>
                <button
                  className="edit-store-btn"
                  onClick={() => setShowSellerForm(true)}
                >
                  <Edit2 size={18} /> Edit Store
                </button>
              </div>
            </div>

            {/* Add Product Button */}
            <div className="add-product-section">
              <button
                className="add-product-btn"
                onClick={() => navigate("/create-listing")}
              >
                <Plus size={20} /> Add New Product
              </button>
            </div>

            {/* Listings */}
            <div className="listings-section">
              <h3>Your Products ({listings.length})</h3>

              {listings.length === 0 ? (
                <div className="no-listings">
                  <div className="empty-icon">📦</div>
                  <h4>No Products Yet</h4>
                  <p>Add your first product to get started</p>
                  <button
                    className="add-first-product"
                    onClick={() => navigate("/create-listing")}
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="listings-grid">
                  {listings.map((listing) => (
                    <div key={listing._id} className="listing-card">
                      <div className="listing-image">
                        <span className="product-emoji">{listing.image || "📦"}</span>
                      </div>

                      <div className="listing-info">
                        <h4>{listing.name}</h4>
                        <p className="listing-desc">{listing.description}</p>
                        <div className="listing-meta">
                          <span className="category">
                            {listing.category}
                          </span>
                          <span className="stock">
                            Stock: {listing.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="listing-footer">
                        <span className="price">${listing.price}</span>
                        <div className="listing-actions">
                          <button
                            className="edit-btn"
                            title="Edit product"
                            onClick={() =>
                              navigate("/create-listing", {
                                state: { listing }
                              })
                            }
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="delete-btn"
                            title="Delete product"
                            onClick={() => deleteListing(listing._id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </PageContainer>
  );
}
