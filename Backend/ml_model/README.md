# Space Photo Analysis ML Model

## Overview
This ML model analyzes space photos to determine light conditions and recommend suitable plants.

## Setup Instructions

### 1. Install Python Dependencies
```bash
cd Backend/ml_model
pip install -r requirements.txt
```

### 2. Configure Kaggle API (for real dataset)

1. Create a Kaggle account at https://www.kaggle.com
2. Go to Account settings → API → Create New API Token
3. Download `kaggle.json` file
4. Place it in:
   - **Windows**: `C:\Users\<YourUsername>\.kaggle\kaggle.json`
   - **Mac/Linux**: `~/.kaggle/kaggle.json`

5. Set permissions (Mac/Linux only):
   ```bash
   chmod 600 ~/.kaggle/kaggle.json
   ```

### 3. Recommended Kaggle Datasets

Choose one of these datasets:

1. **Indoor-Outdoor Scene Classification**
   ```bash
   kaggle datasets download -d nitishabharathi/scene-classification
   ```

2. **Sun Database (Scene Recognition)**
   ```bash
   kaggle datasets download -d tensorflow/sun397
   ```

3. **Plant Seedlings Classification**
   ```bash
   kaggle datasets download -d vbookshelf/v2-plant-seedlings-dataset
   ```

4. **Indoor Outdoor Images**
   ```bash
   kaggle datasets download -d s1m0n38/indoor-outdoor-images
   ```

### 4. Train the Model

```bash
python train_space_model.py
```

The script will:
- Download dataset from Kaggle (or create synthetic data if unavailable)
- Preprocess images
- Train a CNN model with transfer learning (EfficientNetB0)
- Evaluate performance
- Save the trained model and metadata

### 5. Model Output

After training, you'll find in `models/`:
- `space_analysis_model.h5` - Trained Keras model
- `saved_model/` - TensorFlow SavedModel format
- `model_metadata.json` - Label mappings and plant recommendations
- `training_history.png` - Training metrics visualization
- `confusion_matrix.png` - Model evaluation

## Model Architecture

- **Base**: EfficientNetB0 (pretrained on ImageNet)
- **Custom Layers**: Dense layers with dropout for classification
- **Input**: 224x224 RGB images
- **Output**: 4 classes (bright outdoor, bright indoor, moderate light, low light)

## Plant Recommendations

The model provides plant suggestions based on detected light conditions:

- **Bright Outdoor**: Tomato, Basil, Lavender, Rosemary
- **Bright Indoor**: Succulents, Aloe Vera, Spider Plant
- **Moderate Light**: Monstera, Philodendron, Dracaena
- **Low Light**: Peace Lily, Pothos, Snake Plant, ZZ Plant

## Next Steps

1. Train the model with real Kaggle data
2. Create a Flask/FastAPI inference API
3. Integrate with React frontend
4. Deploy the backend service

## Troubleshooting

### Kaggle API Not Working
- Verify `kaggle.json` is in correct location
- Check file permissions
- Test with: `kaggle datasets list`

### Out of Memory Error
- Reduce `BATCH_SIZE` in training script
- Reduce `IMG_SIZE`
- Use CPU instead of GPU (slower but works)

### Low Accuracy
- Use real dataset instead of synthetic
- Increase `EPOCHS`
- Collect more training data
- Fine-tune hyperparameters
