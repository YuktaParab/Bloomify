"""
Space Photo Analysis Model Training Script
Analyzes indoor/outdoor spaces and sunlight conditions for plant recommendations
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import json

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import cv2
from PIL import Image

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 50
LEARNING_RATE = 0.001

# Create directories
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

print("=" * 60)
print("Space Photo Analysis Model Training")
print("=" * 60)
print(f"TensorFlow version: {tf.__version__}")
print(f"GPU Available: {tf.config.list_physical_devices('GPU')}")
print("=" * 60)


def download_kaggle_dataset():
    """
    Download plant/indoor gardening dataset from Kaggle
    Using Indoor-Outdoor Scene Classification dataset
    """
    print("\n📥 Downloading dataset from Kaggle...")
    print("Note: Make sure you have kaggle.json in ~/.kaggle/ directory")
    
    # Option 1: Indoor-Outdoor Scene Classification
    # kaggle datasets download -d nitishabharathi/scene-classification
    
    # Option 2: Sun/Shade Plant Images (if available)
    # For demonstration, we'll use a general indoor-outdoor dataset
    
    try:
        os.system("kaggle datasets download -d nitishabharathi/scene-classification -p data/ --unzip")
        print("✅ Dataset downloaded successfully!")
    except Exception as e:
        print(f"⚠️ Error downloading dataset: {e}")
        print("Please manually download a suitable dataset or use custom images")
        return False
    
    return True


def create_synthetic_dataset():
    """
    Create a synthetic dataset for demonstration if Kaggle download fails
    This will be replaced with real Kaggle data
    """
    print("\n🔨 Creating synthetic dataset for demonstration...")
    
    categories = {
        'bright_outdoor': 'High sunlight - outdoor',
        'bright_indoor': 'Bright indoor with windows',
        'moderate_light': 'Moderate indirect light',
        'low_light': 'Low light indoor space'
    }
    
    for category in categories.keys():
        cat_dir = DATA_DIR / category
        cat_dir.mkdir(exist_ok=True)
        
        # Create 50 synthetic images per category
        for i in range(50):
            # Generate synthetic images with different brightness levels
            if 'bright' in category:
                img_array = np.random.randint(180, 255, (IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)
            elif 'moderate' in category:
                img_array = np.random.randint(100, 180, (IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)
            else:
                img_array = np.random.randint(20, 100, (IMG_SIZE, IMG_SIZE, 3), dtype=np.uint8)
            
            img = Image.fromarray(img_array)
            img.save(cat_dir / f"image_{i}.jpg")
    
    print("✅ Synthetic dataset created!")
    print(f"Categories: {list(categories.keys())}")
    return categories


def load_and_preprocess_data(data_path):
    """
    Load images and create train/validation splits
    """
    print("\n📂 Loading and preprocessing data...")
    
    images = []
    labels = []
    label_names = []
    
    # Get all category directories
    categories = sorted([d for d in Path(data_path).iterdir() if d.is_dir()])
    label_map = {cat.name: idx for idx, cat in enumerate(categories)}
    label_names = [cat.name for cat in categories]
    
    print(f"Found {len(categories)} categories: {label_names}")
    
    for category in categories:
        category_label = label_map[category.name]
        image_files = list(category.glob("*.jpg")) + list(category.glob("*.png"))
        
        print(f"Loading {len(image_files)} images from {category.name}...")
        
        for img_path in image_files:
            try:
                # Load and resize image
                img = cv2.imread(str(img_path))
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
                
                images.append(img)
                labels.append(category_label)
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
    
    # Convert to numpy arrays
    images = np.array(images, dtype=np.float32) / 255.0  # Normalize to [0, 1]
    labels = np.array(labels)
    
    print(f"\n✅ Loaded {len(images)} images")
    print(f"Image shape: {images.shape}")
    print(f"Labels shape: {labels.shape}")
    
    return images, labels, label_names, label_map


def create_model(num_classes):
    """
    Create CNN model using transfer learning with EfficientNetB0
    """
    print(f"\n🏗️ Building model for {num_classes} classes...")
    
    # Load pre-trained EfficientNetB0
    base_model = EfficientNetB0(
        include_top=False,
        weights='imagenet',
        input_shape=(IMG_SIZE, IMG_SIZE, 3)
    )
    
    # Freeze base model layers initially
    base_model.trainable = False
    
    # Build model
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("\n📊 Model Architecture:")
    model.summary()
    
    return model, base_model


def create_data_augmentation():
    """
    Create data augmentation for training
    """
    return ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest'
    )


def train_model(model, X_train, y_train, X_val, y_val):
    """
    Train the model with callbacks
    """
    print("\n🚀 Starting model training...")
    
    # Callbacks
    callbacks = [
        ModelCheckpoint(
            MODEL_DIR / 'best_model.h5',
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Data augmentation
    datagen = create_data_augmentation()
    
    # Train
    history = model.fit(
        datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    print("\n✅ Training completed!")
    
    return history


def plot_training_history(history):
    """
    Plot training metrics
    """
    print("\n📈 Plotting training history...")
    
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Accuracy
    axes[0].plot(history.history['accuracy'], label='Train Accuracy')
    axes[0].plot(history.history['val_accuracy'], label='Val Accuracy')
    axes[0].set_title('Model Accuracy')
    axes[0].set_xlabel('Epoch')
    axes[0].set_ylabel('Accuracy')
    axes[0].legend()
    axes[0].grid(True)
    
    # Loss
    axes[1].plot(history.history['loss'], label='Train Loss')
    axes[1].plot(history.history['val_loss'], label='Val Loss')
    axes[1].set_title('Model Loss')
    axes[1].set_xlabel('Epoch')
    axes[1].set_ylabel('Loss')
    axes[1].legend()
    axes[1].grid(True)
    
    plt.tight_layout()
    plt.savefig(MODEL_DIR / 'training_history.png', dpi=300, bbox_inches='tight')
    print(f"✅ Training plots saved to {MODEL_DIR / 'training_history.png'}")


def evaluate_model(model, X_test, y_test, label_names):
    """
    Evaluate model and print metrics
    """
    print("\n📊 Evaluating model...")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_classes = np.argmax(y_pred, axis=1)
    
    # Classification report
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_classes, target_names=label_names))
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred_classes)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=label_names, yticklabels=label_names)
    plt.title('Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(MODEL_DIR / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
    print(f"✅ Confusion matrix saved to {MODEL_DIR / 'confusion_matrix.png'}")


def save_model_and_metadata(model, label_names, label_map):
    """
    Save model and metadata
    """
    print("\n💾 Saving model and metadata...")
    
    # Save model
    model.save(MODEL_DIR / 'space_analysis_model.h5')
    print(f"✅ Model saved to {MODEL_DIR / 'space_analysis_model.h5'}")
    
    # Save as TensorFlow SavedModel format (for production)
    model.save(MODEL_DIR / 'saved_model')
    print(f"✅ SavedModel format saved to {MODEL_DIR / 'saved_model'}")
    
    # Save metadata
    metadata = {
        'label_names': label_names,
        'label_map': label_map,
        'img_size': IMG_SIZE,
        'num_classes': len(label_names),
        'plant_recommendations': get_plant_recommendations()
    }
    
    with open(MODEL_DIR / 'model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✅ Metadata saved to {MODEL_DIR / 'model_metadata.json'}")


def get_plant_recommendations():
    """
    Plant recommendations for each light category
    """
    return {
        'bright_outdoor': [
            {'name': 'Tomato', 'desc': 'Loves full sun; great for balconies', 'light': 'Full sun (6-8h)'},
            {'name': 'Basil', 'desc': 'Fast-growing herb; needs 6+ hrs sun', 'light': 'Full sun'},
            {'name': 'Lavender', 'desc': 'Sun-loving, drought tolerant', 'light': 'Full sun'},
            {'name': 'Rosemary', 'desc': 'Mediterranean herb, loves heat', 'light': 'Full sun'},
            {'name': 'Pepper', 'desc': 'Colorful and productive in sun', 'light': 'Full sun'}
        ],
        'bright_indoor': [
            {'name': 'Succulents', 'desc': 'Low maintenance, bright light lovers', 'light': 'Bright indirect'},
            {'name': 'Aloe Vera', 'desc': 'Healing plant, bright windows', 'light': 'Bright indirect'},
            {'name': 'Spider Plant', 'desc': 'Air purifying, bright spaces', 'light': 'Bright indirect'},
            {'name': 'Jade Plant', 'desc': 'Thick leaves, bright light', 'light': 'Bright indirect'}
        ],
        'moderate_light': [
            {'name': 'Monstera', 'desc': 'Tropical beauty, moderate light', 'light': 'Medium indirect'},
            {'name': 'Philodendron', 'desc': 'Easy care, adaptable', 'light': 'Medium indirect'},
            {'name': 'Dracaena', 'desc': 'Tall and elegant, moderate light', 'light': 'Medium indirect'},
            {'name': 'Chinese Evergreen', 'desc': 'Colorful foliage, medium light', 'light': 'Medium indirect'}
        ],
        'low_light': [
            {'name': 'Peace Lily', 'desc': 'Thrives in low light and indoors', 'light': 'Low to medium'},
            {'name': 'Pothos', 'desc': 'Excellent for shady corners', 'light': 'Low light'},
            {'name': 'Snake Plant', 'desc': 'Nearly indestructible, low light', 'light': 'Low light'},
            {'name': 'ZZ Plant', 'desc': 'Glossy leaves, very low light', 'light': 'Low light'},
            {'name': 'Cast Iron Plant', 'desc': 'Survives neglect and darkness', 'light': 'Very low light'}
        ]
    }


def main():
    """
    Main training pipeline
    """
    print("\n🌱 Starting Space Analysis Model Training Pipeline\n")
    
    # Step 1: Try to download dataset from Kaggle
    kaggle_success = download_kaggle_dataset()
    
    # Step 2: If Kaggle fails, create synthetic data
    if not kaggle_success or not any(DATA_DIR.iterdir()):
        print("\n⚠️ Using synthetic dataset for demonstration")
        print("For production, please use real Kaggle dataset!")
        create_synthetic_dataset()
    
    # Step 3: Load and preprocess data
    images, labels, label_names, label_map = load_and_preprocess_data(DATA_DIR)
    
    # Step 4: Split data
    X_train, X_temp, y_train, y_temp = train_test_split(
        images, labels, test_size=0.3, random_state=42, stratify=labels
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
    )
    
    print(f"\n📊 Data Split:")
    print(f"Training: {len(X_train)} images")
    print(f"Validation: {len(X_val)} images")
    print(f"Test: {len(X_test)} images")
    
    # Step 5: Create model
    model, base_model = create_model(len(label_names))
    
    # Step 6: Train model
    history = train_model(model, X_train, y_train, X_val, y_val)
    
    # Step 7: Fine-tune (unfreeze base model)
    print("\n🔓 Fine-tuning: Unfreezing base model...")
    base_model.trainable = True
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE / 10),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Train a few more epochs
    history_fine = train_model(model, X_train, y_train, X_val, y_val)
    
    # Step 8: Plot training history
    plot_training_history(history_fine)
    
    # Step 9: Evaluate
    evaluate_model(model, X_test, y_test, label_names)
    
    # Step 10: Save model
    save_model_and_metadata(model, label_names, label_map)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print(f"\nModel files saved in: {MODEL_DIR.absolute()}")
    print(f"- best_model.h5")
    print(f"- space_analysis_model.h5")
    print(f"- saved_model/ (TensorFlow format)")
    print(f"- model_metadata.json")
    print(f"- training_history.png")
    print(f"- confusion_matrix.png")
    print("\n🚀 Next: Integrate model with Flask/FastAPI backend!")


if __name__ == "__main__":
    main()
