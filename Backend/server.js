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

const url = 'mongodb://0.0.0.0:27017';


 
cloudinary.config({
  cloud_name: "dqy8fpb6n",
  api_key: "736992766167645",
  api_secret: "taCs9fQZm3B9GflslZPoZnnQiHI"  
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

    tempFilePath = req.file.path;
    const pythonScript = path.join(__dirname, "ml_model", "analyze_space.py");

    console.log("📸 Analyzing image:", tempFilePath);

    // Call Python script for analysis - use system Python with cv2 installed
    const pythonPath = process.env.PYTHON_PATH || "C:\\Users\\yukta\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
    const pythonProcess = spawn(pythonPath, [pythonScript, tempFilePath]);

    let result = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
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

app.listen(3000, () => {
    console.log("express is readyy");
});