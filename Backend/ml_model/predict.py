"""
Inference Script for Space Photo Analysis
Predicts light conditions and recommends plants
"""

import numpy as np
import json
from pathlib import Path
from PIL import Image
import cv2
import tensorflow as tf
from tensorflow import keras

# Load model and metadata
MODEL_DIR = Path("models")
MODEL_PATH = MODEL_DIR / "space_analysis_model.h5"
METADATA_PATH = MODEL_DIR / "model_metadata.json"


class SpaceAnalyzer:
    """
    Space photo analyzer for plant recommendations
    """
    
    def __init__(self, model_path=MODEL_PATH, metadata_path=METADATA_PATH):
        """
        Load model and metadata
        """
        print("🌱 Loading Space Analysis Model...")
        
        # Load model
        self.model = keras.models.load_model(str(model_path))
        print(f"✅ Model loaded from {model_path}")
        
        # Load metadata
        with open(metadata_path, 'r') as f:
            self.metadata = json.load(f)
        
        self.label_names = self.metadata['label_names']
        self.img_size = self.metadata['img_size']
        self.plant_recommendations = self.metadata['plant_recommendations']
        
        print(f"✅ Metadata loaded: {len(self.label_names)} categories")
        print(f"Categories: {self.label_names}")
    
    def preprocess_image(self, image_path):
        """
        Preprocess image for prediction
        """
        # Load image
        img = cv2.imread(str(image_path))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize
        img = cv2.resize(img, (self.img_size, self.img_size))
        
        # Normalize
        img = img.astype(np.float32) / 255.0
        
        # Add batch dimension
        img = np.expand_dims(img, axis=0)
        
        return img
    
    def predict(self, image_path):
        """
        Predict light condition and recommend plants
        """
        # Preprocess
        img = self.preprocess_image(image_path)
        
        # Predict
        predictions = self.model.predict(img, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        
        # Get label
        predicted_label = self.label_names[predicted_class_idx]
        
        # Get plant recommendations
        plants = self.plant_recommendations.get(predicted_label, [])
        
        result = {
            'light_condition': predicted_label,
            'confidence': float(confidence),
            'all_probabilities': {
                label: float(prob) 
                for label, prob in zip(self.label_names, predictions[0])
            },
            'recommended_plants': plants
        }
        
        return result
    
    def predict_from_bytes(self, image_bytes):
        """
        Predict from image bytes (for API integration)
        """
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize and normalize
        img = cv2.resize(img, (self.img_size, self.img_size))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        
        # Predict
        predictions = self.model.predict(img, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = predictions[0][predicted_class_idx]
        
        predicted_label = self.label_names[predicted_class_idx]
        plants = self.plant_recommendations.get(predicted_label, [])
        
        result = {
            'light_condition': predicted_label,
            'confidence': float(confidence),
            'all_probabilities': {
                label: float(prob) 
                for label, prob in zip(self.label_names, predictions[0])
            },
            'recommended_plants': plants
        }
        
        return result
    
    def analyze_brightness(self, image_path):
        """
        Additional brightness analysis (as fallback)
        """
        img = cv2.imread(str(image_path))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Calculate average brightness
        avg_brightness = np.mean(img)
        
        # Calculate brightness distribution
        brightness_values = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        hist = cv2.calcHist([brightness_values], [0], None, [256], [0, 256])
        
        return {
            'average_brightness': float(avg_brightness),
            'bright_pixels_ratio': float(np.sum(brightness_values > 180) / brightness_values.size),
            'dark_pixels_ratio': float(np.sum(brightness_values < 60) / brightness_values.size)
        }


def demo():
    """
    Demo usage
    """
    print("=" * 60)
    print("Space Photo Analysis - Inference Demo")
    print("=" * 60)
    
    # Initialize analyzer
    analyzer = SpaceAnalyzer()
    
    # Example: analyze a test image
    test_image = "data/test_image.jpg"
    
    if Path(test_image).exists():
        print(f"\n📸 Analyzing: {test_image}")
        
        result = analyzer.predict(test_image)
        
        print(f"\n🌞 Light Condition: {result['light_condition']}")
        print(f"🎯 Confidence: {result['confidence']:.2%}")
        
        print("\n🌱 Recommended Plants:")
        for plant in result['recommended_plants']:
            print(f"  • {plant['name']}: {plant['desc']}")
        
        print("\n📊 All Probabilities:")
        for label, prob in result['all_probabilities'].items():
            print(f"  {label}: {prob:.2%}")
    else:
        print(f"\n⚠️ Test image not found: {test_image}")
        print("Place a test image in the data/ folder to try the model")


if __name__ == "__main__":
    demo()
