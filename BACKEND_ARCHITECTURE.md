# Bloomify Backend Architecture - Complete Guide 🌿

## 📋 Table of Contents
1. [Technology Stack](#technology-stack)
2. [Backend Workflow](#backend-workflow)
3. [API Endpoints](#api-endpoints)
4. [ML Model Training](#ml-model-training)
5. [Computer Vision Analysis](#computer-vision-analysis)
6. [Data Flow Diagram](#data-flow-diagram)
7. [CSV Files & Dataset](#csv-files--dataset)

---

## 🛠️ Technology Stack

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Server runtime environment | Latest |
| **Express.js** | Web framework for API | v5.1.0 |
| **MongoDB** | Database for storing photos | v6.20.0 |
| **Multer** | File upload handling | v2.0.2 |
| **Cloudinary** | Cloud image storage | v1.41.3 |
| **CORS** | Cross-Origin Resource Sharing | v2.8.5 |

### Python ML Stack
| Technology | Purpose | Version |
|------------|---------|---------|
| **Python** | ML scripting language | 3.13.7 |
| **OpenCV** | Computer vision library | v4.8.0 |
| **NumPy** | Numerical computing | v1.24.3 |
| **TensorFlow** | Deep learning framework | v2.15.0 |
| **Keras** | High-level neural networks API | v2.15.0 |
| **Pandas** | Data manipulation | v2.0.3 |
| **scikit-learn** | Machine learning utilities | v1.3.0 |

---

## 🔄 Backend Workflow

### Complete Request Flow

```
┌─────────────┐
│  Frontend   │ User uploads image
│  (React)    │
└──────┬──────┘
       │
       │ HTTP POST /analyze-space
       ▼
┌─────────────────────────────────────────┐
│  Express.js Server (server.js)          │
│  ┌───────────────────────────────────┐  │
│  │ 1. Multer receives image file     │  │
│  │ 2. Saves to Backend/upload/       │  │
│  │ 3. File: temp_1234567890.jpg      │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               │ spawn Python process
               ▼
┌─────────────────────────────────────────┐
│  Python Script (analyze_space.py)       │
│  ┌───────────────────────────────────┐  │
│  │ 1. Load image with OpenCV         │  │
│  │ 2. Person detection (YCrCb)       │  │
│  │ 3. Lighting analysis (histogram)  │  │
│  │ 4. Space feature detection (edges)│  │
│  │ 5. Calculate Space Score (0-100)  │  │
│  │ 6. Generate plant recommendations │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               │ Returns JSON result
               ▼
┌─────────────────────────────────────────┐
│  Express.js Server                      │
│  ┌───────────────────────────────────┐  │
│  │ 1. Parse JSON from Python         │  │
│  │ 2. Delete temp file                │  │
│  │ 3. Send response to frontend      │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               │ JSON Response
               ▼
┌─────────────────────────────────────────┐
│  Frontend (SpacePhotoAnalysis.jsx)      │
│  ┌───────────────────────────────────┐  │
│  │ 1. Display Space Green Score      │  │
│  │ 2. Show plant recommendations     │  │
│  │ 3. Display lighting analysis      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🌐 API Endpoints

### 1. **POST /analyze-space** ⭐ Main Analysis Endpoint

**Purpose**: Analyze room images and return plant recommendations

**Request**:
```javascript
POST http://localhost:3000/analyze-space
Content-Type: multipart/form-data

{
  "image": <File> // Image file (JPG, PNG)
}
```

**Response (Success)**:
```json
{
  "success": true,
  "lighting": {
    "level": "medium",
    "description": "Moderate Light - Suitable for most indoor plants",
    "brightness": 133.27,
    "bright_ratio": 0.42,
    "dark_ratio": 0.32
  },
  "space_features": {
    "complexity": "simple",
    "available_space": "excellent",
    "edge_density": 0.018,
    "has_structure": false
  },
  "space_score": 85,
  "recommended_plants": [
    {
      "name": "Pothos (Money Plant)",
      "desc": "Perfect for moderate light, easy to care, air-purifying.",
      "difficulty": "Easy",
      "watering": "Weekly",
      "light_tolerance": "Medium (indirect)"
    }
  ],
  "placement_suggestions": [
    {
      "location": "Desk/Table",
      "plants": "Small plants like Pothos or Snake Plant",
      "reason": "Add greenery to workspace"
    }
  ],
  "analysis_summary": "Your space has moderate light with excellent space available for plants."
}
```

**Response (Person Detected)**:
```json
{
  "error": "person_detected",
  "message": "⚠️ Person/body detected in image. Please upload a photo of the space only.",
  "skin_ratio": 0.25
}
```

**How It Works**:
1. **Multer** saves uploaded image to `Backend/upload/temp_[timestamp].jpg`
2. **Node.js** spawns Python process: `python analyze_space.py [image_path]`
3. **Python script** analyzes image using OpenCV
4. **Python** outputs JSON to stdout
5. **Node.js** parses JSON and sends to frontend
6. **Temp file** is automatically deleted after analysis

---

### 2. **POST /upload** 📸 Image Upload (Cloudinary)

**Purpose**: Upload and store images to Cloudinary

**Request**:
```javascript
POST http://localhost:3000/upload
Content-Type: multipart/form-data

{
  "file": <File>,
  "username": "john_doe",
  "caption": "My room setup"
}
```

**Response**:
```json
{
  "acknowledged": true,
  "insertedId": "507f1f77bcf86cd799439011"
}
```

**Storage**:
- Images uploaded to **Cloudinary** cloud storage
- Metadata saved in **MongoDB** database (`tinder.photos` collection)

---

### 3. **GET /files** 📁 Retrieve Images

**Purpose**: Get uploaded files for a user

**Request**:
```javascript
GET http://localhost:3000/files?username=john_doe
```

**Response**:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "caption": "My room setup",
    "file_url": "https://res.cloudinary.com/.../image.jpg",
    "file_name": "abc123def",
    "upload_time": "2026-03-07T12:30:00Z"
  }
]
```

---

### 4. **DELETE /delete/:id** 🗑️ Delete Image

**Purpose**: Delete image from Cloudinary and MongoDB

**Request**:
```javascript
DELETE http://localhost:3000/delete/507f1f77bcf86cd799439011
```

**Process**:
1. Find image in MongoDB
2. Delete from Cloudinary using `cloudinary.uploader.destroy()`
3. Delete record from MongoDB
4. Return success response

---

## 🧠 ML Model Training

### Current Status: **Model Not Yet Trained** ⚠️

The project has **two analysis systems**:

### 1. **Currently Active: OpenCV Computer Vision** ✅
Located: `Backend/ml_model/analyze_space.py`

**What it does**:
- Uses **OpenCV** for real-time image processing
- No pre-trained model required
- Analyzes images directly using algorithms

**Techniques Used**:
- **YCrCb Color Space** for skin detection
- **Grayscale Histogram** for brightness analysis
- **Canny Edge Detection** for space features
- **Contour Detection** for structure analysis

### 2. **Planned: Deep Learning Model** 🚧
Located: `Backend/ml_model/train_space_model.py`

**When trained, it will**:
- Use **TensorFlow/Keras** for image classification
- Classify rooms into lighting categories
- Use **Transfer Learning** with EfficientNetB0
- Train on scene classification dataset

---

## 📊 Model Training Process (Future Implementation)

### Step 1: Data Collection

**Dataset Source**: Kaggle Scene Classification Dataset

```bash
kaggle datasets download -d nitishabharathi/scene-classification -p data/ --unzip
```

**Data Structure**:
```
data/
├── train-scene classification/
│   ├── train.csv          # Image labels mapping
│   └── train/             # Training images
│       ├── 0.jpg
│       ├── 1.jpg
│       └── ...
└── test_WyRytb0.csv       # Test set labels
```

**CSV Format** (`train.csv`):
```csv
image_name,label
0.jpg,0
1.jpg,4
2.jpg,5
4.jpg,0
```

**Label Mapping**:
- 0 = Bright outdoor
- 1 = Low light indoor
- 2 = Moderate light
- 3 = Bright indoor
- 4 = Dark space
- 5 = Well-lit room

---

### Step 2: Model Architecture

**Base Model**: EfficientNetB0 (Pre-trained on ImageNet)

```
┌──────────────────────────────┐
│  Input Image (224x224x3)     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  EfficientNetB0              │
│  (Transfer Learning)         │
│  - Frozen weights initially  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  GlobalAveragePooling2D      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  BatchNormalization          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Dropout (0.3)               │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Dense (256, ReLU)           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  BatchNormalization          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Dropout (0.3)               │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Dense (128, ReLU)           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Dropout (0.2)               │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Dense (num_classes, Softmax)│
└──────────────────────────────┘
```

**Training Configuration**:
- **Optimizer**: Adam (lr=0.001)
- **Loss**: Sparse Categorical Crossentropy
- **Batch Size**: 32
- **Image Size**: 224×224×3
- **Epochs**: 50
- **Data Augmentation**: Yes

---

### Step 3: Data Augmentation

```python
ImageDataGenerator(
    rotation_range=20,      # Rotate ±20°
    width_shift_range=0.2,  # Horizontal shift
    height_shift_range=0.2, # Vertical shift
    shear_range=0.2,        # Shear transformation
    zoom_range=0.2,         # Zoom in/out
    horizontal_flip=True,   # Mirror flip
    fill_mode='nearest'     # Fill empty pixels
)
```

**Why Augmentation?**
- Prevents overfitting
- Increases dataset diversity
- Makes model robust to variations

---

### Step 4: Training Process

**Command to Train**:
```bash
cd Backend/ml_model
python train_space_model.py
```

**What Happens**:
1. **Load Data** from CSV files
2. **Preprocess Images**: Resize to 224×224, normalize to [0,1]
3. **Split Data**: 80% train, 20% validation
4. **Create Model**: EfficientNetB0 + custom layers
5. **Train**: 50 epochs with callbacks
6. **Save Model**: `models/space_analysis_model.h5`
7. **Save Metadata**: `models/model_metadata.json`

**Callbacks**:
- **ModelCheckpoint**: Save best model
- **EarlyStopping**: Stop if no improvement (patience=10)
- **ReduceLROnPlateau**: Reduce learning rate when stuck

**Output Files**:
```
Backend/ml_model/models/
├── space_analysis_model.h5      # Trained model
└── model_metadata.json          # Label mapping, plant recommendations
```

---

## 🔬 Computer Vision Analysis (Current System)

### File: `analyze_space.py`

### Function 1: **Lighting Detection**

```python
def analyze_lighting(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    avg_brightness = np.mean(gray)
    
    if avg_brightness > 150:
        return "high"     # Bright light
    elif avg_brightness > 100:
        return "medium"   # Moderate light
    else:
        return "low"      # Low light
```

**How It Works**:
1. Convert image to **grayscale**
2. Calculate **average pixel intensity** (0-255)
3. Create **histogram** of brightness distribution
4. Classify as high/medium/low based on thresholds

**Metrics Calculated**:
- `brightness`: Average intensity (0-255)
- `bright_ratio`: % of pixels > 180
- `dark_ratio`: % of pixels < 60

---

### Function 2: **Person Detection**

```python
def detect_skin_tones(img):
    # Convert to YCrCb color space
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    
    # Skin color range
    lower_skin = [0, 133, 77]
    upper_skin = [255, 173, 127]
    
    # Create mask
    skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)
    
    # Calculate percentage
    skin_ratio = np.sum(skin_mask > 0) / total_pixels
    
    return skin_ratio > 0.12  # True if person detected
```

**Why YCrCb Color Space?**
- Better for **skin tone detection** than RGB
- More robust to lighting variations
- Y = Luminance, Cr/Cb = Chrominance

**Detection Threshold**: 12% skin pixels = person detected

---

### Function 3: **Space Feature Detection**

```python
def detect_space_features(img):
    # Edge detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Calculate edge density
    edge_density = np.sum(edges > 0) / total_pixels
    
    # Classify complexity
    if edge_density > 0.15:
        return "complex"      # Cluttered space
    elif edge_density > 0.08:
        return "normal"       # Normal room
    else:
        return "simple"       # Minimal space
```

**Canny Edge Detection**:
- Detects walls, furniture, windows
- Higher density = more structure/clutter
- Used to estimate available space

---

### Function 4: **Space Score Calculation**

```python
def calculate_space_score(lighting, features):
    score = 50  # Base score
    
    # Lighting bonus
    if lighting["level"] == "high":
        score += 25
    elif lighting["level"] == "medium":
        score += 15
    else:
        score += 5
    
    # Space availability bonus
    if features["available_space"] == "excellent":
        score += 20
    elif features["available_space"] == "good":
        score += 15
    else:
        score += 5
    
    # Structure bonus
    if features["has_structure"]:
        score += 5
    
    return min(100, max(0, score))
```

**Score Breakdown**:
- **Base**: 50 points
- **Lighting**: +5 to +25 points
- **Space**: +5 to +20 points
- **Structure**: +5 points
- **Max**: 100 points

---

### Function 5: **Plant Recommendations**

Based on detected lighting level:

**High Light** (brightness > 150):
- Snake Plant
- Aloe Vera
- Jade Plant
- Rubber Plant

**Medium Light** (100-150):
- Pothos (Money Plant)
- Spider Plant
- Peace Lily
- Philodendron

**Low Light** (< 100):
- Snake Plant
- ZZ Plant
- Pothos
- Cast Iron Plant

---

## 📁 CSV Files & Dataset

### train.csv Structure

```csv
image_name,label
0.jpg,0
1.jpg,4
2.jpg,5
4.jpg,0
7.jpg,4
```

**Columns**:
- `image_name`: Filename in `train/` folder
- `label`: Numeric class (0-5)

**Usage in Training**:
```python
df = pd.read_csv('data/train-scene classification/train.csv')

for idx, row in df.iterrows():
    img_path = f"train/{row['image_name']}"
    label = row['label']
    
    img = cv2.imread(img_path)
    images.append(img)
    labels.append(label)
```

### Model Metadata JSON

After training, this file stores label mappings:

```json
{
  "label_names": ["bright_outdoor", "low_light", "moderate", ...],
  "img_size": 224,
  "plant_recommendations": {
    "bright_outdoor": [
      {"name": "Tomato", "care": "Easy"},
      {"name": "Basil", "care": "Easy"}
    ],
    "low_light": [
      {"name": "Snake Plant", "care": "Easy"},
      {"name": "ZZ Plant", "care": "Easy"}
    ]
  }
}
```

---

## 🔐 Security Features

1. **CORS Enabled**: Only allows requests from your frontend
2. **File Type Validation**: Multer filters non-image files
3. **Temp File Cleanup**: Auto-delete after analysis
4. **MongoDB Connection**: Properly closed after operations
5. **Error Handling**: Catches and logs all errors

---

## 🚀 Performance Optimizations

1. **Local Storage for Analysis**: Faster than downloading from Cloudinary
2. **Async/Await**: Non-blocking operations
3. **OpenCV Native**: Compiled C++ library = fast processing
4. **Temp File Deletion**: Prevents disk space buildup
5. **Process Spawning**: Isolated Python execution

---

## 📈 Future Enhancements

### Phase 1: Complete ML Model
- [ ] Train deep learning model on scene dataset
- [ ] Integrate `predict.py` for ML predictions
- [ ] Compare OpenCV vs ML accuracy

### Phase 2: Advanced Features
- [ ] Furniture detection using YOLO
- [ ] Corner detection for placement suggestions
- [ ] AR plant placement preview
- [ ] Real-time video analysis

### Phase 3: Database Integration
- [ ] Save analysis history to MongoDB
- [ ] User profiles and preferences
- [ ] Plant care reminders
- [ ] Community plant sharing

---

## 🎯 Summary

### Current Working System:
✅ **OpenCV-based Computer Vision**
- Real-time image analysis
- Person detection
- Lighting classification
- Space score calculation
- Plant recommendations

### Future ML System:
🚧 **TensorFlow Deep Learning Model**
- Transfer learning with EfficientNetB0
- Trained on scene classification dataset
- More accurate lighting predictions
- Scalable to new categories

### Technology Highlights:
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Storage**: Cloudinary
- **ML/CV**: Python + OpenCV + TensorFlow
- **Frontend**: React.js

---

**Built with 💚 for plant lovers and aspiring gardeners!**
