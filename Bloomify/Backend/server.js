let express = require("express");//backend object
let cors = require("cors");
let {MongoClient,ObjectId} = require("mongodb");
let multer = require("multer");//storage rrecep bananakeliye
let path = require("path");
let fs = require("fs");
let cloudinary = require("cloudinary").v2;
let {CloudinaryStorage}= require("multer-storage-cloudinary");

let app = express();
app.use(cors());
app.use(express.json());
app.use('/upload', express.static('upload'));
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
    

app.listen(3000, () => {
    console.log("express is readyy");
});