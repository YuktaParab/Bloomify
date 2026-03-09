# 🚀 Quick Start Guide

## Step 1: Configure OpenAI API Key

Edit `Backend/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
USE_OPENAI_VISION=true
```

Get your API key from: https://platform.openai.com/api-keys

## Step 2: Start the Backend

```powershell
cd Backend
node server.js
```

## Step 3: Start the Frontend

```powershell
cd Frontend/my-app
npm run dev
```

## Step 4: Test!

Open http://localhost:5174/space-analysis and try:
- ✅ Upload a room photo → Should recommend plants
- ❌ Upload a certificate → Should reject
- ❌ Upload a selfie → Should reject

## What Changed?

### 🎯 Improved Accuracy
- **OpenAI Vision API** for intelligent image classification
- **Fine-tuned CV thresholds** to reduce false positives
- **Dual-layer validation** (AI + Computer Vision)

### 🛡️ Better Validation
Real spaces are now accepted while rejecting:
- Documents, certificates, screenshots
- Selfies, portraits, close-ups
- Pure landscapes, vehicles
- Blurry, dark, or filtered images

### 📊 Cost
- Uses `gpt-4o-mini` model (most affordable)
- ~$0.00015 per image analysis
- $1 = ~6,600 images analyzed

---

**Without OpenAI:** Set `USE_OPENAI_VISION=false` in `.env` to use only CV validation (free, but less accurate).
