import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { ShoppingCart, Store, Plus, Filter, X } from "lucide-react";
import PageContainer from "./layout/PageContainer";
import AnimatedButton from "./ui/AnimatedButton";
import "./ProductsShop.css";

export default function ProductsShop() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pre-made"); // pre-made or marketplace
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState({ items: [] });

  const CATEGORIES = ["soil", "fertilizer", "pots", "seeds", "tools", "pest-control"];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchCart(currentUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeTab, searchTerm, selectedCategory, priceRange, fetchProducts]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "pre-made" ? "/products" : "/marketplace";
      const params = new URLSearchParams();
      
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      params.append("minPrice", priceRange[0]);
      params.append("maxPrice", priceRange[1]);

      const response = await fetch(`http://localhost:3000${endpoint}?${params}`);
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, selectedCategory, priceRange]);

  const fetchCart = async (email) => {
    try {
      const response = await fetch(`http://localhost:3000/cart/${email}`);
      const data = await response.json();
      setCart(data || { items: [] });
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/cart/${user.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: 1,
          source: activeTab === "pre-made" ? "pre-made" : "marketplace"
        })
      });

      if (response.ok) {
        await fetchCart(user.email);
        alert("✓ Added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const cartCount = cart.items?.length || 0;

  return (
    <PageContainer>
      <div className="products-shop-container">
        {/* Header */}
        <div className="shops-header">
          <div className="shops-title-section">
            <Store className="shops-icon" />
            <h1>Plant Shop</h1>
            <p>Premium plants, tools & marketplace</p>
          </div>

          {/* Cart Button */}
          <button
            className="cart-button"
            onClick={() => navigate("/cart")}
          >
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === "pre-made" ? "active" : ""}`}
            onClick={() => setActiveTab("pre-made")}
          >
            Featured Products
          </button>
          <button
            className={`tab ${activeTab === "marketplace" ? "active" : ""}`}
            onClick={() => setActiveTab("marketplace")}
          >
            Marketplace
          </button>
          <button
            className="tab sell-tab"
            onClick={() => navigate("/seller-dashboard")}
          >
            <Plus size={16} /> Sell Your Products
          </button>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /> Filters
          </button>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="filter-range"
                />
              </div>

              <button
                className="clear-filters"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setPriceRange([0, 100]);
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <span className="product-emoji">{product.image || "📦"}</span>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>

                  <div className="product-meta">
                    <span className="product-category">
                      {product.category}
                    </span>
                    <span className="product-rating">
                      ⭐ {product.rating || 4.5}
                    </span>
                  </div>

                  <div className="product-footer">
                    <span className="product-price">${product.price}</span>
                    <button
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product._id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products">No products found</div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
