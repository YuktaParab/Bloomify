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

    const pythonProcess = spawn("python", [pythonScript, tempFilePath]);

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

app.listen(3000, () => {
    console.log("express is readyy");
});