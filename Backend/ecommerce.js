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
    
    // Always clear old generic items when initializing to ensure the commercial 25-item set takes over
    await collection.deleteMany({ type: "pre-made" });
    
    const products = [
      // == PLANTS ==
      {
        name: "Costa Farms Snake Plant",
        description: "Nearly indestructible indoor plant that thrives in low light and purifies the air.",
        category: "plants",
        price: 29.99,
        quantity: 50,
        image: "https://images.unsplash.com/photo-1599427303058-f04cbcc4ecda?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Fiddle Leaf Fig Tree",
        description: "Lush, large-leafed tropical plant to make a bold statement in any room.",
        category: "plants",
        price: 59.99,
        quantity: 30,
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.5,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Live Aloe Vera Plant",
        description: "Healing and highly drought-resistant, perfect for sunny windowsills.",
        category: "plants",
        price: 19.99,
        quantity: 120,
        image: "https://images.unsplash.com/photo-1596547609652-9cb5d8d73b0a?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.7,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Meyer Lemon Indoor Tree",
        description: "Bear sweet, juicy lemons indoors year-round with this vibrant tree.",
        category: "plants",
        price: 49.99,
        quantity: 25,
        image: "https://images.unsplash.com/photo-1590680482559-0fdb8c1f03f5?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.6,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Potted Lavender Herb",
        description: "Aromatic and soothing French lavender ready for your indoor garden.",
        category: "plants",
        price: 24.99,
        quantity: 80,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.9,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Monstera Deliciosa",
        description: "The classic Swiss Cheese Plant. Easy to grow and absolutely stunning.",
        category: "plants",
        price: 45.00,
        quantity: 40,
        image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Ruby Red Strawberry Starters",
        description: "A bundle of 10 live strawberry starter plants for your garden beds.",
        category: "crops",
        price: 22.50,
        quantity: 150,
        image: "https://images.unsplash.com/photo-1518133501309-1a74d2b21703?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.4,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Boston Fern Hanging Basket",
        description: "Lush, trailing fronds perfect for adding greenery to your patios.",
        category: "plants",
        price: 32.99,
        quantity: 60,
        image: "https://images.unsplash.com/photo-1620127807580-0abcbcde7b55?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.7,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Rosemary Culinary Herb",
        description: "Fresh, healthy rosemary plant. Perfect for cooking and decor.",
        category: "crops",
        price: 15.99,
        quantity: 90,
        image: "https://images.unsplash.com/photo-1598512752271-33f913a5af13?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.5,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Heirloom Vegetable Starter Set",
        description: "10 varieties of heirloom seeds including tomatoes, peppers, and carrots.",
        category: "seeds",
        price: 29.99,
        quantity: 200,
        image: "https://images.unsplash.com/photo-1593489814782-eeb7a62799c8?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.9,
        reviews: [],
        createdAt: new Date()
      },

      // == FERTILIZERS ==
      {
        name: "Miracle-Gro All Purpose Food",
        description: "Water-soluble plant food that instantly feeds to grow bigger, more beautiful plants.",
        category: "fertilizer",
        price: 14.99,
        quantity: 100,
        image: "https://images.unsplash.com/photo-1592394533824-9440e5d68530?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "FoxFarm Liquid Nutrient Trio",
        description: "Pack of 3 professional-grade soil formulas for magnificent blooms and fruit.",
        category: "fertilizer",
        price: 39.99,
        quantity: 45,
        image: "https://images.unsplash.com/photo-1585465715862-e6eab53ff0d6?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.9,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Jobe's Organics Spikes",
        description: "Pre-measured, absolutely no-mess fertilizer spikes specifically for indoor plants.",
        category: "fertilizer",
        price: 11.49,
        quantity: 200,
        image: "https://images.unsplash.com/photo-1598282361730-1a74d2b21703?auto=format&fit=crop&w=600&q=80", // generic nice plant macro
        type: "pre-made",
        rating: 4.6,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Osmocote Plant Food Plus",
        description: "Smart-release granular formula that feeds your plants continuously for 6 months.",
        category: "fertilizer",
        price: 21.99,
        quantity: 75,
        image: "https://images.unsplash.com/photo-1592424001844-31b316f0ce11?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.7,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Espoma Organic Indoor Food",
        description: "Liquid organic fertilizer packed with beneficial microbes for lush foliage.",
        category: "fertilizer",
        price: 13.99,
        quantity: 85,
        image: "https://images.unsplash.com/photo-1581008035764-16279f6d140e?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.5,
        reviews: [],
        createdAt: new Date()
      },

      // == TOOLS ==
      {
        name: "Fiskars Bypass Pruning Shears",
        description: "Ultra-sharp, fully hardened steel blades for clean cuts on stems and light branches.",
        category: "tools",
        price: 18.95,
        quantity: 120,
        image: "https://images.unsplash.com/photo-1416879598555-52834b6e5123?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Edward Tools Garden Trowel",
        description: "Heavy-duty carbon steel hand shovel with an ergonomic, anti-slip grip.",
        category: "tools",
        price: 10.99,
        quantity: 150,
        image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.7,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Garden Genie Gloves w/ Claws",
        description: "Waterproof, puncture-resistant gloves with built-in hard plastic digging claws.",
        category: "tools",
        price: 12.50,
        quantity: 200,
        image: "https://images.unsplash.com/photo-1586548171017-910e54ff5214?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.3,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "VIVOSUN 1 Gallon Pump Sprayer",
        description: "Pressure sprayer with an adjustable nozzle, perfect for gentle misting or jet streams.",
        category: "tools",
        price: 24.99,
        quantity: 65,
        image: "https://images.unsplash.com/photo-1584486520270-19eca1efcce5?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.6,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "AMES Steel Garden Rake",
        description: "Forged steel rake with a sturdy fiberglass handle for moving soil and compost.",
        category: "tools",
        price: 29.98,
        quantity: 40,
        image: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.5,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Gorilla Carts Poly Dump Cart",
        description: "Heavy-duty yard cart with an innovative quick-release dumping mechanism.",
        category: "tools",
        price: 129.00,
        quantity: 15,
        image: "https://images.unsplash.com/photo-1508535099308-f4ccdbdfd6dd?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.9,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Felco F-2 Classic Manual Pruner",
        description: "The professional standard for pruning, highly durable precision steel.",
        category: "tools",
        price: 64.99,
        quantity: 50,
        image: "https://images.unsplash.com/photo-1583207036611-30310fb4e068?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.9,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Radius Garden Root Slayer Shovel",
        description: "O-handle shovel featuring a uniquely shaped blade with saw-tooth edges.",
        category: "tools",
        price: 54.99,
        quantity: 35,
        image: "https://images.unsplash.com/photo-1579624838647-73ac28fcfb52?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Corona Extendable Bypass Lopper",
        description: "Extendable handles from 21 to 33 inches to tackle high branches easily.",
        category: "tools",
        price: 39.50,
        quantity: 60,
        image: "https://images.unsplash.com/photo-1593361427546-27a3c75abfcf?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.7,
        reviews: [],
        createdAt: new Date()
      },
      {
        name: "Dramm One Touch Rain Wand",
        description: "30-inch watering wand with an easy thumb valve and gentle shower spray pattern.",
        category: "tools",
        price: 34.00,
        quantity: 80,
        image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
        type: "pre-made",
        rating: 4.8,
        reviews: [],
        createdAt: new Date()
      }
    ];
    
    await collection.insertMany(products);
    console.log("✓ Pre-made professional products initialized");
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
