let express = require("express");//backend object
let cors = require("cors");
let {MongoClient,ObjectId} = require("mongodb");
let multer = require("multer");//storage rrecep bananakeliye
let path = require("path");
let fs = require("fs");
let cloudinary = require("cloudinary").v2;
let {CloudinaryStorage}= require("multer-storage-cloudinary");
let { spawn } = require("child_process");
let https = require("https");
let http = require("http");
require('dotenv').config();  // Load environment variables
let subscription = require("./subscription");  // Subscription management
let ecommerce = require("./ecommerce");  // E-commerce management
let recommendRouter = require("./routes/recommend");  // Plant recommendation routes

let app = express();
app.use(cors());
app.use(express.json());
app.use('/upload', express.static('upload'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// const url = "mongodb://0.0.0.0:27017";

const url = process.env.MONGODB_URL || 'mongodb://0.0.0.0:27017';

// Cloudinary configuration from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
let storage = new CloudinaryStorage({cloudinary})
let recep = multer({storage});

app.post("/upload", recep.single("file"), 
async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("photos");
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    let obj = {
      username: req.body.username,
      caption: req.body.caption,
      file_url: req.file.path,
      file_name: req.file.filename,
      upload_time: new Date()
    }
    
    const result = await collec.insertOne(obj);
    res.status(200).json(result);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Error uploading file" });
  } finally {
    await client.close();
  }

});
app.get("/files",
    (req,res)=>{
        let client= new MongoClient(url);
        client.connect();
        let db = client.db("tinder");
        let collec = db.collection("photos");
        let username = req.query.username;
        obj= username? {username}:{}
        collec.find(obj).toArray()
        .then((result)=>res.send(result))
        .catch((error)=>{res.send(error)});
    }
);
app.delete("/delete/:id",
    (req,res)=>{
        let client = new MongoClient(url);
        client.connect();
        let db= client.db("tinder");
        let collec = db.collection("photos");
        let id= req.params.id;
        let _id = new ObjectId(id);

        collec.findOne({_id})
        .then((obj)=>{
            cloudinary.uploader.destroy(obj.file_name);
            return collec.deleteOne({_id});})
            .then((result)=>res.send(result))
            .catch((error)=>{res.send(error)});

        });

// Space Analysis Endpoint - Uses local file storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "upload/"),
  filename: (req, file, cb) => cb(null, "temp_" + Date.now() + path.extname(file.originalname))
});
const localRecep = multer({ storage: localStorage });

app.post("/analyze-space", localRecep.single("image"), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const email = req.body.email;
    if (!email) {
      if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ error: "Email is required" });
    }

    // Check subscription access first
    const accessStatus = await subscription.canUseSpaceAnalysis(email);
    if (!accessStatus.allowed) {
      if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(403).json({ 
        error: "Access denied",
        message: accessStatus.reason === "trial_exhausted" 
          ? "Free trial limit reached" 
          : "Subscription required",
        ...accessStatus
      });
    }

    tempFilePath = req.file.path;
    const pythonScript = path.join(__dirname, "ml_model", "analyze_space.py");

    console.log("📸 Analyzing image:", tempFilePath);

    // Call Python script for analysis - use system Python with cv2 installed
    const pythonPath = process.env.PYTHON_PATH || "python";
    const pythonProcess = spawn(pythonPath, [pythonScript, tempFilePath]);

    let result = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", async (code) => {
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      if (code !== 0) {
        console.error("Python script error:", errorOutput);
        return res.status(500).json({ 
          error: "Analysis failed", 
          details: errorOutput 
        });
      }

      try {
        const analysisResult = JSON.parse(result);
        
        // Check if person detected
        if (analysisResult.error === "person_detected") {
          return res.status(400).json(analysisResult);
        }

        // Check if invalid scene (not a space image)
        if (analysisResult.error === "invalid_scene") {
          return res.status(400).json(analysisResult);
        }

        // Check for other errors
        if (analysisResult.error) {
          return res.status(500).json(analysisResult);
        }

        // Deduct trial use for Beginner tier
        if (accessStatus.tier === "Beginner") {
          await subscription.deductSpaceAnalysisUse(email);
        }
        
        res.status(200).json(analysisResult);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Raw output:", result);
        res.status(500).json({ 
          error: "Failed to parse analysis result",
          raw_output: result
        });
      }
    });

  } catch (error) {
    // Clean up temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Error analyzing space", details: error.message });
  }
});

// ========== PLANT DATABASE ENDPOINTS ==========

// Seed plants collection from CSV data
app.post("/seed-plants", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("plants");
    
    const count = await collec.countDocuments();
    if (count > 0) {
      return res.status(200).json({ message: "Plants already seeded", count });
    }

    const plants = req.body.plants;
    if (!plants || !Array.isArray(plants) || plants.length === 0) {
      return res.status(400).json({ error: "No plant data provided" });
    }

    const result = await collec.insertMany(plants);
    res.status(200).json({ message: "Plants seeded successfully", count: result.insertedCount });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: "Error seeding plants" });
  } finally {
    await client.close();
  }
});

// Get all plants
app.get("/plants", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("plants");
    
    const { sunlight, difficulty, indoor_outdoor, search } = req.query;
    let filter = {};
    if (sunlight) filter.sunlight = sunlight;
    if (difficulty) filter.difficulty = difficulty;
    if (indoor_outdoor) filter.indoor_outdoor = indoor_outdoor;
    if (search) filter.plant_name = { $regex: search, $options: "i" };

    const plants = await collec.find(filter).toArray();
    res.status(200).json(plants);
  } catch (error) {
    console.error("Plants fetch error:", error);
    res.status(500).json({ error: "Error fetching plants" });
  } finally {
    await client.close();
  }
});

// Get single plant by ID
app.get("/plants/:id", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("plants");
    const plant = await collec.findOne({ _id: new ObjectId(req.params.id) });
    if (!plant) return res.status(404).json({ error: "Plant not found" });
    res.status(200).json(plant);
  } catch (error) {
    console.error("Plant fetch error:", error);
    res.status(500).json({ error: "Error fetching plant" });
  } finally {
    await client.close();
  }
});

// ========== MY PLANTS (USER COLLECTION) ENDPOINTS ==========

// Get user's plant collection
app.get("/my-plants", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("my_plants");

    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email required" });

    const plants = await collec.find({ email }).toArray();
    res.status(200).json(plants);
  } catch (error) {
    console.error("My plants fetch error:", error);
    res.status(500).json({ error: "Error fetching user plants" });
  } finally {
    await client.close();
  }
});

// Add plant to user's collection
app.post("/my-plants", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("my_plants");

    const { email, plant_name, sunlight, watering, difficulty, temperature_min_c, temperature_max_c, description, added_date, nickname } = req.body;
    if (!email || !plant_name) return res.status(400).json({ error: "Email and plant_name required" });

    // Check for duplicate
    const existing = await collec.findOne({ email, plant_name });
    if (existing) return res.status(409).json({ error: "Plant already in your collection" });

    const result = await collec.insertOne({
      email,
      plant_name,
      nickname: nickname || "",
      sunlight: sunlight || "",
      watering: watering || "",
      difficulty: difficulty || "",
      temperature_min_c: temperature_min_c || null,
      temperature_max_c: temperature_max_c || null,
      description: description || "",
      added_date: added_date || new Date().toISOString(),
      notes: ""
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Add plant error:", error);
    res.status(500).json({ error: "Error adding plant" });
  } finally {
    await client.close();
  }
});

// Remove plant from user's collection
app.delete("/my-plants/:id", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("my_plants");
    const result = await collec.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json(result);
  } catch (error) {
    console.error("Remove plant error:", error);
    res.status(500).json({ error: "Error removing plant" });
  } finally {
    await client.close();
  }
});

// Update plant notes/nickname
app.patch("/my-plants/:id", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("my_plants");
    const { notes, nickname } = req.body;
    const update = {};
    if (notes !== undefined) update.notes = notes;
    if (nickname !== undefined) update.nickname = nickname;

    const result = await collec.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: update }
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Update plant error:", error);
    res.status(500).json({ error: "Error updating plant" });
  } finally {
    await client.close();
  }
});

// ========== CARE REMINDERS ENDPOINTS ==========

// Get reminders for a user
app.get("/reminders", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("reminders");

    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Email required" });

    const reminders = await collec.find({ email }).sort({ date: 1 }).toArray();
    res.status(200).json(reminders);
  } catch (error) {
    console.error("Reminders fetch error:", error);
    res.status(500).json({ error: "Error fetching reminders" });
  } finally {
    await client.close();
  }
});

// Add a reminder
app.post("/reminders", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("reminders");

    const { email, plant_name, task, date, recurring } = req.body;
    if (!email || !plant_name || !task || !date) {
      return res.status(400).json({ error: "email, plant_name, task, and date are required" });
    }

    const result = await collec.insertOne({
      email,
      plant_name,
      task,
      date,
      recurring: recurring || false,
      completed: false,
      created_at: new Date().toISOString()
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Add reminder error:", error);
    res.status(500).json({ error: "Error adding reminder" });
  } finally {
    await client.close();
  }
});

// Toggle reminder complete
app.patch("/reminders/:id", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("reminders");
    const { completed } = req.body;

    const result = await collec.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { completed: !!completed } }
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Update reminder error:", error);
    res.status(500).json({ error: "Error updating reminder" });
  } finally {
    await client.close();
  }
});

// Delete a reminder
app.delete("/reminders/:id", async (req, res) => {
  let client = new MongoClient(url);
  try {
    await client.connect();
    let db = client.db("tinder");
    let collec = db.collection("reminders");
    const result = await collec.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(200).json(result);
  } catch (error) {
    console.error("Delete reminder error:", error);
    res.status(500).json({ error: "Error deleting reminder" });
  } finally {
    await client.close();
  }
});

// ========== SUBSCRIPTION ENDPOINTS ==========

// Get user subscription status
app.get("/subscription/:email", async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }
    console.log(`Fetching subscription for email: ${email}`);
    const userSubscription = await subscription.getUserSubscription(email);
    console.log(`✓ Subscription fetched successfully for ${email}`);
    res.status(200).json(userSubscription);
  } catch (error) {
    console.error("❌ Get subscription error:", error.message);
    res.status(500).json({ 
      error: "Error fetching subscription",
      details: error.message 
    });
  }
});

// Check if user can use space analysis
app.get("/check-space-analysis-access/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const accessStatus = await subscription.canUseSpaceAnalysis(email);
    res.status(200).json(accessStatus);
  } catch (error) {
    console.error("Check space analysis access error:", error);
    res.status(500).json({ error: "Error checking access" });
  }
});

// Record space analysis use (call after successful analysis)
app.post("/record-space-analysis-use/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    // First check if user can use it
    const accessStatus = await subscription.canUseSpaceAnalysis(email);
    if (!accessStatus.allowed) {
      return res.status(403).json({ error: "Access denied", ...accessStatus });
    }

    // If Beginner tier, deduct a use
    if (accessStatus.tier === "Beginner") {
      await subscription.deductSpaceAnalysisUse(email);
    }

    res.status(200).json({ message: "Space analysis use recorded", ...accessStatus });
  } catch (error) {
    console.error("Record space analysis use error:", error);
    res.status(500).json({ error: "Error recording use" });
  }
});

// Create Stripe payment session (upgrade to Advanced)
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    // TODO: Implement Stripe checkout session creation
    // For now, simulate successful payment
    await subscription.upgradeToAdvanced(email, "stripe_cus_" + Date.now(), 1);
    
    res.status(200).json({ 
      message: "Subscription upgraded",
      checkoutUrl: "/success" // In production, return Stripe checkout URL
    });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: "Error creating checkout session" });
  }
});

// ========== E-COMMERCE ENDPOINTS ==========

// Initialize products on first load
ecommerce.initializeProducts().catch(err => console.error("Product initialization error:", err));

// GET all pre-made products with filters
app.get("/products", async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined
    };
    
    const products = await ecommerce.getProducts(filters);
    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
});

// GET single product details
app.get("/products/:id", async (req, res) => {
  try {
    const product = await ecommerce.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ error: "Error fetching product" });
  }
});

// GET all marketplace listings
app.get("/marketplace", async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      search: req.query.search,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined
    };
    
    const listings = await ecommerce.getMarketplaceListings(filters);
    res.status(200).json(listings);
  } catch (error) {
    console.error("Get marketplace listings error:", error);
    res.status(500).json({ error: "Error fetching marketplace listings" });
  }
});

// POST create marketplace listing (seller)
app.post("/marketplace", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const { name, description, category, price, quantity, image } = req.body;
    if (!name || !category || !price || !quantity) {
      return res.status(400).json({ error: "Missing required fields: name, category, price, quantity" });
    }
    
    const result = await ecommerce.createMarketplaceListing(email, {
      name, description, category, price, quantity, image
    });
    
    res.status(201).json({ success: true, listingId: result.insertedId });
  } catch (error) {
    console.error("Create marketplace listing error:", error);
    res.status(500).json({ error: "Error creating marketplace listing" });
  }
});

// GET seller's listings
app.get("/seller-listings/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const listings = await ecommerce.getSellerListings(email);
    res.status(200).json(listings);
  } catch (error) {
    console.error("Get seller listings error:", error);
    res.status(500).json({ error: "Error fetching seller listings" });
  }
});

// GET user's shopping cart
app.get("/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const cart = await ecommerce.getCart(email);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ error: "Error fetching cart" });
  }
});

// POST add item to cart
app.post("/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { productId, quantity, source } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ error: "productId and quantity are required" });
    }
    
    const result = await ecommerce.addToCart(email, productId, quantity, source || "pre-made");
    res.status(200).json(result);
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ error: "Error adding item to cart" });
  }
});

// DELETE remove item from cart
app.delete("/cart/:email/:productId", async (req, res) => {
  try {
    const { email, productId } = req.params;
    const result = await ecommerce.removeFromCart(email, productId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ error: "Error removing item from cart" });
  }
});

// PUT update cart item quantity
app.put("/cart/:email/:productId", async (req, res) => {
  try {
    const { email, productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity) {
      return res.status(400).json({ error: "quantity is required" });
    }
    
    const result = await ecommerce.updateCartQuantity(email, productId, quantity);
    res.status(200).json(result);
  } catch (error) {
    console.error("Update cart quantity error:", error);
    res.status(500).json({ error: "Error updating cart quantity" });
  }
});

// DELETE clear entire cart
app.delete("/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const result = await ecommerce.clearCart(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ error: "Error clearing cart" });
  }
});

// POST create order (checkout)
app.post("/orders", async (req, res) => {
  try {
    const { userEmail, items, totalAmount, discountAmount, shippingAddress, paymentMethod } = req.body;
    
    if (!userEmail || !items || !totalAmount || !shippingAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if user is premium member for discount
    let discount = discountAmount || 0;
    try {
      const subStatus = await subscription.getUserSubscription(userEmail);
      if (subStatus.tier === "Advanced") {
        // 10% discount for Advanced members
        discount = Math.round(totalAmount * 0.1 * 100) / 100;
      }
    } catch (subError) {
      console.log("Subscription check skipped for order");
    }
    
    const finalAmount = totalAmount - discount;
    
    const orderData = {
      userEmail,
      items,
      totalAmount,
      discountAmount: discount,
      finalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "credit_card"
    };
    
    const order = await ecommerce.createOrder(orderData);
    
    // Clear user's cart after successful order
    await ecommerce.clearCart(userEmail);
    
    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// GET user's orders
app.get("/orders/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const orders = await ecommerce.getUserOrders(email);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// GET order details
app.get("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await ecommerce.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Error fetching order" });
  }
});

// PATCH update order status (admin/seller)
app.patch("/order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }
    
    const result = await ecommerce.updateOrderStatus(orderId, status);
    res.status(200).json(result);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Error updating order status" });
  }
});

// POST create seller profile
app.post("/sellers", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const { storeName, description, phone, address } = req.body;
    if (!storeName) {
      return res.status(400).json({ error: "Store name is required" });
    }
    
    const result = await ecommerce.createSellerProfile(email, {
      storeName, description, phone, address
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error("Create seller profile error:", error);
    res.status(500).json({ error: "Error creating seller profile" });
  }
});

// GET seller profile
app.get("/sellers/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const seller = await ecommerce.getSellerProfile(email);
    
    if (!seller) {
      return res.status(404).json({ error: "Seller profile not found" });
    }
    
    res.status(200).json(seller);
  } catch (error) {
    console.error("Get seller profile error:", error);
    res.status(500).json({ error: "Error fetching seller profile" });
  }
});

// ========== PLANT RECOMMENDATION ENDPOINTS ==========
// Register recommendation routes
app.use("/api", recommendRouter);

app.listen(3001, () => {
    console.log("Bloomify backend running on port 3001");
});
