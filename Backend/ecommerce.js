const { MongoClient, ObjectId } = require("mongodb");

const url = 'mongodb://0.0.0.0:27017';
const dbName = 'tinder';

// ========== PRODUCTS OPERATIONS ==========

// Get all pre-made products with filters
async function getProducts(filters = {}) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("products");
    
    let query = { type: "pre-made" };
    
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      query.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
    }
    
    const products = await collection.find(query).limit(50).toArray();
    return products;
  } catch (error) {
    console.error("Get products error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Get single product details
async function getProductById(productId) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("products");
    
    const product = await collection.findOne({ _id: new ObjectId(productId) });
    return product;
  } catch (error) {
    console.error("Get product by ID error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// ========== MARKETPLACE OPERATIONS ==========

// Get marketplace listings
async function getMarketplaceListings(filters = {}) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("marketplace_listings");
    
    let query = { status: "active" };
    
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      query.price = { $gte: filters.minPrice, $lte: filters.maxPrice };
    }
    
    const listings = await collection.find(query)
      .limit(50)
      .toArray();
    
    return listings;
  } catch (error) {
    console.error("Get marketplace listings error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Create marketplace listing
async function createMarketplaceListing(sellerEmail, listingData) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("marketplace_listings");
    
    const listing = {
      sellerId: sellerEmail,
      name: listingData.name,
      description: listingData.description,
      category: listingData.category,
      price: listingData.price,
      quantity: listingData.quantity,
      image: listingData.image || null,
      rating: 0,
      reviews: [],
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(listing);
    return result;
  } catch (error) {
    console.error("Create marketplace listing error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Get seller's listings
async function getSellerListings(sellerEmail) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("marketplace_listings");
    
    const listings = await collection.find({ sellerId: sellerEmail }).toArray();
    return listings;
  } catch (error) {
    console.error("Get seller listings error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// ========== CART OPERATIONS ==========

// Get user's cart
async function getCart(userEmail) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("carts");
    
    let cart = await collection.findOne({ email: userEmail });
    if (!cart) {
      cart = { email: userEmail, items: [], createdAt: new Date() };
      await collection.insertOne(cart);
    }
    
    return cart;
  } catch (error) {
    console.error("Get cart error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Add item to cart
async function addToCart(userEmail, productId, quantity, source = "pre-made") {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("carts");
    
    const cart = await collection.findOne({ email: userEmail });
    
    let cartItems = cart?.items || [];
    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({
        productId,
        quantity,
        source,
        addedAt: new Date()
      });
    }
    
    await collection.updateOne(
      { email: userEmail },
      { $set: { items: cartItems, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return { success: true, items: cartItems };
  } catch (error) {
    console.error("Add to cart error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Remove item from cart
async function removeFromCart(userEmail, productId) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("carts");
    
    await collection.updateOne(
      { email: userEmail },
      { $pull: { items: { productId } } }
    );
    
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Update cart quantity
async function updateCartQuantity(userEmail, productId, quantity) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("carts");
    
    if (quantity <= 0) {
      await removeFromCart(userEmail, productId);
    } else {
      await collection.updateOne(
        { email: userEmail, "items.productId": productId },
        { $set: { "items.$.quantity": quantity } }
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error("Update cart quantity error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Clear cart
async function clearCart(userEmail) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("carts");
    
    await collection.updateOne(
      { email: userEmail },
      { $set: { items: [] } }
    );
    
    return { success: true };
  } catch (error) {
    console.error("Clear cart error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// ========== ORDER OPERATIONS ==========

// Create order
async function createOrder(orderData) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("orders");
    
    const order = {
      orderNumber: `ORD-${Date.now()}`,
      userEmail: orderData.userEmail,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      discountAmount: orderData.discountAmount || 0,
      finalAmount: orderData.finalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(order);
    return { success: true, orderId: result.insertedId, ...order };
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Get user orders
async function getUserOrders(userEmail) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("orders");
    
    const orders = await collection.find({ userEmail }).sort({ createdAt: -1 }).toArray();
    return orders;
  } catch (error) {
    console.error("Get user orders error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Get order details
async function getOrderById(orderId) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("orders");
    
    const order = await collection.findOne({ _id: new ObjectId(orderId) });
    return order;
  } catch (error) {
    console.error("Get order by ID error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("orders");
    
    await collection.updateOne(
      { _id: new ObjectId(orderId) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    return { success: true };
  } catch (error) {
    console.error("Update order status error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// ========== SELLER OPERATIONS ==========

// Create seller profile
async function createSellerProfile(sellerEmail, sellerData) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("sellers");
    
    const seller = {
      email: sellerEmail,
      storeName: sellerData.storeName,
      description: sellerData.description || "",
      rating: 0,
      totalSales: 0,
      phone: sellerData.phone || "",
      address: sellerData.address || "",
      createdAt: new Date(),
      isVerified: false
    };
    
    const result = await collection.updateOne(
      { email: sellerEmail },
      { $set: seller },
      { upsert: true }
    );
    
    return { success: true };
  } catch (error) {
    console.error("Create seller profile error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Get seller profile
async function getSellerProfile(sellerEmail) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("sellers");
    
    const seller = await collection.findOne({ email: sellerEmail });
    return seller;
  } catch (error) {
    console.error("Get seller profile error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Initialize pre-made products (run once)
async function initializeProducts() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("products");
    
    const existingCount = await collection.countDocuments({ type: "pre-made" });
    if (existingCount > 0) return;
    
    const products = [
      {
        name: "Premium Plant Soil Mix",
        description: "Nutrient-rich soil mix perfect for indoor plants",
        category: "soil",
        price: 12.99,
        quantity: 100,
        image: "🌱",
        type: "pre-made",
        rating: 4.5,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Organic Fertilizer (500g)",
        description: "100% organic NPK fertilizer for healthy plant growth",
        category: "fertilizer",
        price: 15.99,
        quantity: 80,
        image: "🥕",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Ceramic Plant Pot (10 inch)",
        description: "Beautiful ceramic pot with drainage hole",
        category: "pots",
        price: 18.99,
        quantity: 50,
        image: "🪴",
        type: "pre-made",
        rating: 4.6,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Garden Hand Tool Set",
        description: "3-piece garden tool set: shovel, rake, hoe",
        category: "tools",
        price: 22.99,
        quantity: 40,
        image: "🛠️",
        type: "pre-made",
        rating: 4.7,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Watering Can (2L)",
        description: "Ergonomic watering can with fine mist spray",
        category: "tools",
        price: 14.99,
        quantity: 60,
        image: "💧",
        type: "pre-made",
        rating: 4.5,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Basil Seeds (30 seeds)",
        description: "Premium basil seeds for home gardening",
        category: "seeds",
        price: 5.99,
        quantity: 200,
        image: "🌿",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Tomato Seeds (50 seeds)",
        description: "High-yield cherry tomato seeds",
        category: "seeds",
        price: 6.99,
        quantity: 180,
        image: "🍅",
        type: "pre-made",
        rating: 4.7,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Plant Pest Spray",
        description: "Natural organic pest control spray",
        category: "pest-control",
        price: 16.99,
        quantity: 45,
        image: "🐛",
        type: "pre-made",
        rating: 4.6,
        reviews: [],
        createdAt: new Date()
      }
    ];
    
    await collection.insertMany(products);
    console.log("✓ Pre-made products initialized");
  } catch (error) {
    console.error("Initialize products error:", error);
  } finally {
    await client.close();
  }
}

module.exports = {
  getProducts,
  getProductById,
  getMarketplaceListings,
  createMarketplaceListing,
  getSellerListings,
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  createSellerProfile,
  getSellerProfile,
  initializeProducts
};
