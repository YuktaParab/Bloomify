let express = require("express");//backend object
let cors = require("cors");
let {MongoClient,ObjectId} = require("mongodb");
let multer = require("multer");//storage rrecep bananakeliye
let path = require("path");
let fs = require("fs");
let { spawn } = require("child_process");

let app = express();
app.use(cors());
app.use(express.json());
app.use('/upload', express.static('upload'));
const url = "mongodb://0.0.0.0:27017";
let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null,"upload/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const recep = multer({storage});

app.post("/upload", recep.single("file"), 
(req, res) => {
  let client = new MongoClient(url);
  client.connect()
  let db = client.db("tinder");
  let collec = db.collection("photos");
    let obj= {
        username: req.body.username,
        caption: req.body.caption,
        file_url: `http://localhost:3000/upload/${req.file.filename}`,
        file_name: req.file.filename,
        upload_time: new Date()
    }
    collec.insertOne(obj)
    .then((result) => res.send(result))
    .catch((error) => res.send(error))

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
            fs.promises.unlink(`upload/${obj.file_name}`)
            return collec.deleteOne({_id});})
            .then((result)=>res.send(result))
            .catch((error)=>{res.send(error)});

        });
    
// Space Analysis Endpoint
const spaceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "upload/"),
  filename: (req, file, cb) => cb(null, "temp_" + Date.now() + path.extname(file.originalname))
});
const spaceRecep = multer({ storage: spaceStorage });

app.post("/analyze-space", spaceRecep.single("image"), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    tempFilePath = req.file.path;
    const pythonScript = path.join(__dirname, "ml_model", "analyze_space.py");

    console.log("📸 Analyzing image:", tempFilePath);

    // Use full path to Python from venv
    const pythonExe = "d:\\College_Projects\\sem5 miniproject\\Project\\.venv\\Scripts\\python.exe";
    const pythonProcess = spawn(pythonExe, [pythonScript, tempFilePath]);

    let result = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }

      if (code !== 0) {
        console.error("Python script error:", errorOutput);
        return res.status(500).json({ error: "Analysis failed", details: errorOutput });
      }

      try {
        const analysisResult = JSON.parse(result);
        
        if (analysisResult.error === "person_detected") {
          return res.status(400).json(analysisResult);
        }
        if (analysisResult.error === "invalid_scene") {
          return res.status(400).json(analysisResult);
        }
        if (analysisResult.error) {
          return res.status(500).json(analysisResult);
        }
        
        res.status(200).json(analysisResult);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Raw output:", result);
        res.status(500).json({ error: "Failed to parse analysis result", raw_output: result });
      }
    });

  } catch (error) {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    console.error("Analysis error:", error);
    res.status(500).json({ error: "Error analyzing space", details: error.message });
  }
});

// ============ ACTIVITY TRACKING ENDPOINTS ============

// Track user activity
app.post("/api/activity", async (req, res) => {
  try {
    const { userId, action, plantName, category, searchTerm } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: "Missing required fields: userId, action" });
    }

    let client = new MongoClient(url);
    await client.connect();
    let db = client.db("bloomify");
    let activitiesCollection = db.collection("activities");

    const activity = {
      userId,
      action,
      plantName: plantName || null,
      category: category || null,
      searchTerm: searchTerm || null,
      timestamp: new Date(),
    };

    const result = await activitiesCollection.insertOne(activity);
    client.close();

    res.status(201).json({ success: true, result });
  } catch (error) {
    console.error("Error tracking activity:", error);
    res.status(500).json({ error: "Failed to track activity" });
  }
});

// Get user activities
app.get("/api/activity/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    let client = new MongoClient(url);
    await client.connect();
    let db = client.db("bloomify");
    let activitiesCollection = db.collection("activities");

    // Get activities
    const activities = await activitiesCollection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    // Calculate preferences
    const preferences = {
      vegetables: 0,
      fruits: 0,
      flowers: 0,
      herbs: 0,
    };

    activities.forEach((activity) => {
      if (activity.category && preferences.hasOwnProperty(activity.category)) {
        preferences[activity.category]++;
      }
    });

    client.close();

    res.status(200).json({ activities, preferences });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

// Get user statistics
app.get("/api/activity-stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let client = new MongoClient(url);
    await client.connect();
    let db = client.db("bloomify");
    let activitiesCollection = db.collection("activities");

    const activities = await activitiesCollection
      .find({ userId })
      .toArray();

    const stats = {
      totalViews: activities.filter((a) => a.action === "view").length,
      totalSearches: activities.filter((a) => a.action === "search").length,
      totalSelections: activities.filter((a) => a.action === "select").length,
      favoriteCategories: {},
    };

    activities.forEach((activity) => {
      if (activity.category) {
        stats.favoriteCategories[activity.category] =
          (stats.favoriteCategories[activity.category] || 0) + 1;
      }
    });

    client.close();

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// ============ END ACTIVITY TRACKING ============

// ============ USER PREFERENCES ENDPOINTS ============

// Save/Update user preferences
app.post("/api/user-preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { preferences } = req.body;

    let client = new MongoClient(url);
    await client.connect();
    let db = client.db("bloomify");
    let preferencesCollection = db.collection("userPreferences");

    const result = await preferencesCollection.updateOne(
      { userId },
      {
        $set: {
          userId,
          preferences,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    client.close();

    res.status(200).json({
      success: true,
      message: "Preferences saved successfully",
    });
  } catch (error) {
    console.error("Error saving preferences:", error);
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

// Get user preferences
app.get("/api/user-preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let client = new MongoClient(url);
    await client.connect();
    let db = client.db("bloomify");
    let preferencesCollection = db.collection("userPreferences");

    const userPrefs = await preferencesCollection.findOne({ userId });
    client.close();

    if (userPrefs) {
      res.status(200).json(userPrefs);
    } else {
      res.status(404).json({
        preferences: {
          favoriteCategories: [],
          favoriteSeasons: [],
          experienceLevel: "beginner",
        },
      });
    }
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// ============ END USER PREFERENCES ============

app.listen(3000, () => {
    console.log("express is readyy");
});