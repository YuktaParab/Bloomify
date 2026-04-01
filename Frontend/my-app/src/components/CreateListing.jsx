import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "./Firebase";
import { Plus, ChevronLeft } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import "./CreateListing.css";

const CATEGORIES = ["soil", "seeds", "tools", "pots", "fertilizer", "pest-control", "other"];

export default function CreateListing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "seeds",
    price: "",
    quantity: "",
    image: "📦"
  });

  // Check if editing existing listing
  const editingListing = location.state?.listing;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (editingListing) {
      setFormData({
        name: editingListing.name || "",
        description: editingListing.description || "",
        category: editingListing.category || "seeds",
        price: editingListing.price || "",
        quantity: editingListing.quantity || "",
        image: editingListing.image || "📦"
      });
    }
  }, [editingListing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.price || !formData.quantity) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/marketplace?email=${user.email}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity),
            image: formData.image
          })
        }
      );

      if (response.ok) {
        alert("✓ Product listing created successfully!");
        navigate("/seller-dashboard");
      } else {
        alert("Error creating listing");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("Error creating listing");
    } finally {
      setLoading(false);
    }
  };

  const emojiCategories = {
    soil: "🌱",
    seeds: "🌾",
    tools: "🛠️",
    pots: "🪴",
    fertilizer: "🥕",
    "pest-control": "🐛",
    other: "📦"
  };

  return (
    <PageContainer>
      <div className="create-listing-container">
        {/* Header */}
        <div className="listing-header">
          <button
            className="back-button"
            onClick={() => navigate("/seller-dashboard")}
          >
            <ChevronLeft size={20} /> Back
          </button>
          <h1>{editingListing ? "Edit Product" : "Create New Listing"}</h1>
          <div style={{ width: "100px" }}></div>
        </div>

        <div className="listing-content">
          {/* Form */}
          <form className="listing-form" onSubmit={handleSubmit}>
            <section className="form-section">
              <h2>Product Information</h2>

              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Organic Potting Mix"
                  maxLength="100"
                />
                <small>{formData.name.length}/100</small>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product, it's features, and benefits..."
                  rows="5"
                  maxLength="500"
                ></textarea>
                <small>{formData.description.length}/500</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {emojiCategories[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Emoji/Icon</label>
                  <div className="emoji-selector">
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      maxLength="2"
                      placeholder="Pick an emoji"
                    />
                    <span className="emoji-preview">{formData.image}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h2>Pricing & Inventory</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <div className="price-input">
                    <span className="currency">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Quantity in Stock *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="pricing-note">
                <span>💡</span>
                <p>
                  Pro Tip: Competitive pricing and adequate stock lead to better sales.
                  Update quantity when stock changes!
                </p>
              </div>
            </section>

            {/* Preview */}
            <section className="preview-section">
              <h2>Preview</h2>
              <div className="preview-card">
                <div className="preview-image">
                  <span className="preview-emoji">{formData.image}</span>
                </div>
                <div className="preview-info">
                  <h3>{formData.name || "Product Name"}</h3>
                  <p className="preview-desc">
                    {formData.description || "Add a description to show here..."}
                  </p>
                  <div className="preview-meta">
                    <span className="preview-category">
                      {formData.category}
                    </span>
                    <span className="preview-stock">Stock: {formData.quantity || "0"}</span>
                  </div>
                  <div className="preview-footer">
                    <span className="preview-price">
                      ${parseFloat(formData.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Publishing..."
                  : editingListing
                  ? "Update Listing"
                  : "Publish Listing"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate("/seller-dashboard")}
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Tips */}
          <div className="tips-sidebar">
            <h3>📝 Listing Tips</h3>
            <div className="tip">
              <strong>Be Descriptive</strong>
              <p>Detailed descriptions help customers understand your product better.</p>
            </div>
            <div className="tip">
              <strong>Accurate Pricing</strong>
              <p>Price competitively but fairly. Include any special features.</p>
            </div>
            <div className="tip">
              <strong>Stock Carefully</strong>
              <p>List accurate inventory to avoid overselling.</p>
            </div>
            <div className="tip">
              <strong>Use Good Emoji</strong>
              <p>Choose an emoji that represents your product well.</p>
            </div>
            <div className="tip">
              <strong>Update Regularly</strong>
              <p>Keep your listings current and respond   to customer inquiries quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
