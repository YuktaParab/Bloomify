# Backend ML Model Integration - Setup Guide

## ✅ What's Been Integrated

The Bloomify Space Analysis feature now uses a **backend Python ML system** for better accuracy:

### 1. **Python Analysis Script** (`Backend/ml_model/analyze_space.py`)
- Computer vision-based space analysis using OpenCV
- Lighting detection (high/medium/low)
- Space feature detection
- Person/body detection validation
- Plant recommendations based on conditions
- **Space Green Score** calculation (0-100)
- Placement suggestions

### 2. **Backend API Endpoint** (`Backend/server.js`)
- New endpoint: `POST /analyze-space`
- Accepts image uploads
- Calls Python script for analysis
- Returns structured JSON results

### 3. **Frontend Integration** (`Frontend/my-app/src/components/SpacePhotoAnalysis.jsx`)
- Calls backend API instead of client-side analysis
- Displays Space Green Score
- Shows AI-powered recommendations
- Fallback to client-side if backend fails

---

## 🚀 Setup Instructions

### 1. Install Python Dependencies

Navigate to the Backend folder and install required packages:

```powershell
cd Backend
python -m pip install -r ml_model/requirements.txt
```

Required packages:
- opencv-python
- numpy

### 2. Start the Backend Server

```powershell
cd Backend
node server.js
```

The server should start on `http://localhost:3000`

### 3. Start the Frontend

In a new terminal:

```powershell
cd Frontend/my-app
npm run dev
```

---

## 🧪 Testing the Integration

### Test 1: Valid Room Photo
1. Go to Space Photo Analysis page
2. Upload a clear photo of a room/space
3. Click "Analyze Space"
4. **Expected**: 
   - Space Green Score displayed (0-100)
   - Plant recommendations
   - Lighting analysis

### Test 2: Person Detection
1. Upload a selfie or photo with a person
2. Click "Analyze Space"
3. **Expected**: 
   - Error message: "Person/body detected"
   - No recommendations shown

### Test 3: Manual Input Fallback
1. Click "Manual Input" tab
2. Fill in space details manually
3. **Expected**: 
   - Works as before without backend call

---

## 📊 Features Implemented

### ✅ Completed
- [x] Backend Python analysis script
- [x] API endpoint for space analysis
- [x] Frontend integration with backend
- [x] Person/body detection
- [x] Lighting analysis (high/medium/low)
- [x] Space Green Score (0-100)
- [x] Plant recommendations based on lighting
- [x] Space feature detection
- [x] Error handling & fallback

### 🔄 In Progress
- [ ] Furniture detection
- [ ] Corner detection for placement
- [ ] Visual plant overlay on image
- [ ] Placement suggestions UI display

---

## 🔧 Troubleshooting

### Issue: "Analysis failed" error

**Solution**: 
- Check if Python is installed: `python --version`
- Verify opencv-python is installed: `python -m pip show opencv-python`
- Check backend terminal for error logs

### Issue: Backend not responding

**Solution**:
- Ensure server is running on port 3000
- Check CORS is enabled in server.js
- Verify the backend endpoint: `http://localhost:3000/analyze-space`

### Issue: Python script not found

**Solution**:
- Verify the script exists at `Backend/ml_model/analyze_space.py`
- Check file permissions

---

## 📁 File Structure

```
Backend/
├── server.js                       # Express server with /analyze-space endpoint
├── ml_model/
│   ├── analyze_space.py           # Python CV analysis script ✨ NEW
│   ├── predict.py                 # Future ML model inference
│   ├── train_space_model.py       # Model training script
│   └── requirements.txt           # Python dependencies
└── upload/                        # Uploaded images

Frontend/
└── my-app/
    └── src/
        └── components/
            ├── SpacePhotoAnalysis.jsx  # Updated with backend API call ✨
            └── SpacePhotoAnalysis.css  # Space Score styling ✨
```

---

## 🎯 Next Steps

To complete the full PRD requirements:

1. **Placement Suggestions UI** - Display placement_suggestions from backend
2. **Furniture Detection** - Add furniture detection using object detection models
3. **AR Preview** - Implement plant placement visualization
4. **Database Storage** - Save analysis history to MongoDB
5. **User Feedback** - Allow users to rate recommendations

---

## 📝 API Response Example

```json
{
  "success": true,
  "lighting": {
    "level": "medium",
    "description": "Moderate Light - Suitable for most indoor plants",
    "brightness": 125.3
  },
  "space_features": {
    "complexity": "normal",
    "available_space": "good"
  },
  "space_score": 75,
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
  "analysis_summary": "Your space has moderate light with good space available for plants."
}
```

---

## 🎉 Summary

The backend ML integration is complete! The system now provides:
- **Better accuracy** with Python OpenCV analysis
- **Space Green Score** as per PRD requirements
- **Person detection** to reject invalid images
- **Structured recommendations** based on actual lighting analysis

Ready to test! 🚀
