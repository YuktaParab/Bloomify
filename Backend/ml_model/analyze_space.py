"""
Space Analysis Script - Computer Vision based room analyzer with OpenAI Vision API
Analyzes uploaded images to detect lighting, space, and recommend plants
"""

import sys
import json
import cv2
import numpy as np
from pathlib import Path
import os
from dotenv import load_dotenv
import base64

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

# OpenAI import (conditional)
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: OpenAI not installed. Using CV-only validation.", file=sys.stderr)

def validate_image_with_openai(image_path):
    """
    Use OpenAI Vision API to classify and validate the uploaded image.
    Classifies into 4 categories: space, human, text/document, non-space object.
    Returns (is_valid, error_message, confidence)
    """
    if not OPENAI_AVAILABLE:
        return None, None, 0  # Fall back to CV validation
    
    api_key = os.getenv('OPENAI_API_KEY')
    use_openai = os.getenv('USE_OPENAI_VISION', 'false').lower() == 'true'
    
    if not api_key or api_key == 'your_openai_api_key_here' or not use_openai:
        return None, None, 0  # Fall back to CV validation
    
    try:
        # Read and encode image
        with open(image_path, 'rb') as img_file:
            image_data = base64.b64encode(img_file.read()).decode('utf-8')
        
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert image classifier for a plant recommendation app called Bloomify.

Analyze the uploaded image and first determine what type of image it is before performing any other task. The image must be classified into one of these four categories:

1. "space" - a space image showing a room, balcony, garden, desk, window area, patio, or any physical environment where plants could realistically be placed.
2. "human" - a human image or selfie where people or faces are the main focus.
3. "text_document" - a text or document image such as certificates, screenshots, posters, notes, or images that contain mostly readable text.
4. "non_space_object" - a non-space object image such as food, vehicles, animals, products, random objects, landscapes with no usable plant placement area, or anything unrelated to indoor or home spaces.

Never classify a text/document/certificate image as a space image. If the classification is uncertain, treat the image as non_space_object.

Respond in JSON format ONLY:
{
  "category": "space" | "human" | "text_document" | "non_space_object",
  "confidence": 0.0-1.0,
  "reason": "brief explanation of why this category was chosen"
}"""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Classify this image into one of the four categories. Respond in JSON format only."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_data}",
                                "detail": "low"
                            }
                        }
                    ]
                }
            ],
            max_tokens=200,
            temperature=0.1
        )
        
        result_text = response.choices[0].message.content.strip()
        
        # Extract JSON from response
        if result_text.startswith('```json'):
            result_text = result_text[7:-3].strip()
        elif result_text.startswith('```'):
            result_text = result_text[3:-3].strip()
        
        result = json.loads(result_text)
        
        category = result.get('category', 'non_space_object').lower().strip()
        confidence = result.get('confidence', 0.8)
        reason = result.get('reason', 'Image classification completed')
        
        print(f"DEBUG OpenAI: category={category}, confidence={confidence}, reason={reason}", file=sys.stderr)
        
        if category == 'space':
            return True, None, confidence
        
        # Map categories to user-friendly rejection messages
        if category == 'human':
            error_msg = "\u26a0\ufe0f This image appears to be a human photo or selfie. Please upload a picture of your room, balcony, desk area, or space where you want plants."
        elif category == 'text_document':
            error_msg = "\u274c This image contains mostly text (document, certificate, screenshot, or poster). Please upload a photo of a real physical space for plant recommendations."
        else:  # non_space_object or any unknown
            error_msg = f"\u274c This image does not appear to show a usable space for placing plants. {reason}. Please upload a clear picture of your room, balcony, or plant placement area."
        
        return False, error_msg, confidence
        
    except Exception as e:
        print(f"OpenAI API error: {str(e)}", file=sys.stderr)
        return None, None, 0  # Fall back to CV validation

def analyze_lighting(img):
    """Analyze lighting conditions in the image"""
    # Convert to grayscale for brightness analysis
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Calculate average brightness
    avg_brightness = np.mean(gray)
    
    # Calculate brightness distribution
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    total_pixels = img.shape[0] * img.shape[1]
    
    # Percentage of bright pixels (> 180)
    bright_ratio = np.sum(hist[180:]) / total_pixels
    
    # Percentage of dark pixels (< 60)
    dark_ratio = np.sum(hist[:60]) / total_pixels
    
    # Classify lighting
    if avg_brightness > 150:
        light_level = "high"
        light_description = "Bright Light - Perfect for sun-loving plants"
    elif avg_brightness > 100:
        light_level = "medium"
        light_description = "Moderate Light - Suitable for most indoor plants"
    else:
        light_level = "low"
        light_description = "Low Light - Best for shade-tolerant plants"
    
    return {
        "level": light_level,
        "description": light_description,
        "brightness": float(avg_brightness),
        "bright_ratio": float(bright_ratio),
        "dark_ratio": float(dark_ratio)
    }

def detect_space_features(img):
    """Detect space features like walls, floor, furniture"""
    height, width = img.shape[:2]
    
    # Edge detection for structure
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    
    # Calculate edge density
    edge_density = np.sum(edges > 0) / (height * width)
    
    # Color analysis
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Detect potential floor (usually bottom third)
    bottom_third = img[int(height * 0.66):, :]
    bottom_avg = np.mean(bottom_third, axis=(0, 1))
    
    # Detect walls (vertical structures)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Estimate available space
    if edge_density > 0.15:
        space_complexity = "complex"
        available_space = "moderate"
    elif edge_density > 0.08:
        space_complexity = "normal"
        available_space = "good"
    else:
        space_complexity = "simple"
        available_space = "excellent"
    
    return {
        "complexity": space_complexity,
        "available_space": available_space,
        "edge_density": float(edge_density),
        "has_structure": bool(edge_density > 0.05)
    }

def detect_skin_tones(img):
    """Detect if image is dominated by a person (skin tones + face detection).
    
    Returns detection info. Only flags has_person=True when a human clearly
    dominates the image (selfie/portrait), NOT for wooden floors, beige walls,
    or warm-lit rooms that happen to have skin-like colors.
    """
    height, width = img.shape[:2]
    img_area = height * width
    
    # Method 1: Face detection using Haar Cascade
    face_detected = False
    face_area_ratio = 0.0
    num_faces = 0
    try:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(face_cascade_path)
        
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        num_faces = len(faces)
        
        if num_faces > 0:
            # Calculate total face area as fraction of image
            total_face_area = sum(w * h for (x, y, w, h) in faces)
            face_area_ratio = total_face_area / img_area
            
            # Only flag as person if face is prominent (>3% of image area)
            # Small faces (photos on walls, people far away in a room) are fine
            if face_area_ratio > 0.03:
                face_detected = True
                print(f"DEBUG: Prominent face detected! {num_faces} face(s), area_ratio={face_area_ratio:.3f}", file=sys.stderr)
    except Exception as e:
        print(f"DEBUG: Face cascade failed: {e}", file=sys.stderr)
    
    # Method 2: Skin tone detection (YCrCb color space)
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    
    # Tighter skin range to reduce false positives from wood/walls
    lower_skin = np.array([0, 138, 80], dtype=np.uint8)
    upper_skin = np.array([255, 170, 125], dtype=np.uint8)
    
    skin_mask = cv2.inRange(ycrcb, lower_skin, upper_skin)
    
    # Apply morphological operations to reduce noise
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel)
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel)
    
    skin_ratio = np.sum(skin_mask > 0) / img_area
    
    # Find contours to check for person-like shapes
    contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    has_person_shape = False
    max_contour_ratio = 0
    is_centered = False
    
    if contours and len(contours) > 0:
        largest_contour = max(contours, key=cv2.contourArea)
        largest_area = cv2.contourArea(largest_contour)
        max_contour_ratio = largest_area / img_area
        
        x, y, w, h = cv2.boundingRect(largest_contour)
        center_x = x + w / 2
        center_y = y + h / 2
        img_center_x = width / 2
        img_center_y = height / 2
        
        dist_from_center = ((center_x - img_center_x)**2 + (center_y - img_center_y)**2)**0.5
        max_dist = ((width/2)**2 + (height/2)**2)**0.5
        center_ratio = 1 - (dist_from_center / max_dist)
        
        is_centered = center_ratio > 0.65
        
        if max_contour_ratio > 0.12:
            aspect_ratio = float(w) / h if h > 0 else 0
            if 0.3 < aspect_ratio < 3.0:
                has_person_shape = True
    
    # HIGH thresholds — only flag when a person clearly dominates the image.
    # Wooden floors, beige walls, warm lighting should NEVER trigger this.
    # 1. Prominent face detected (face > 3% of image) AND meaningful skin
    # 2. Very high skin ratio (>30%) — clearly a selfie/portrait
    # 3. High skin (>20%) AND large person-shaped blob AND centered (selfie pattern)
    has_person = (
        (face_detected and skin_ratio > 0.10) or
        skin_ratio > 0.30 or
        (skin_ratio > 0.20 and has_person_shape and is_centered)
    )
    
    print(f"DEBUG SKIN: skin_ratio={skin_ratio:.3f}, max_region={max_contour_ratio:.3f}, "
          f"face_detected={face_detected}, face_area={face_area_ratio:.3f}, num_faces={num_faces}, "
          f"has_person_shape={has_person_shape}, is_centered={is_centered}, "
          f"has_person={has_person}", file=sys.stderr)
    
    return {
        "has_person": bool(has_person),
        "skin_ratio": float(skin_ratio),
        "max_region": float(max_contour_ratio),
        "face_area_ratio": float(face_area_ratio),
        "detection_method": "face_cascade" if face_detected else "skin_tone"
    }

def calculate_space_score(lighting, features):
    """Calculate Space Green Score (0-100)"""
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
    
    # Structure bonus (well-defined space)
    if features["has_structure"]:
        score += 5
    
    return min(100, max(0, score))

def get_plant_recommendations(lighting, features):
    """Get plant recommendations based on analysis"""
    plants = []
    light_level = lighting["level"]
    
    if light_level == "high":
        plants = [
            {
                "name": "Snake Plant",
                "desc": "Thrives in bright light, extremely hardy and air-purifying.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "High (can also tolerate low)"
            },
            {
                "name": "Aloe Vera",
                "desc": "Loves bright light, medicinal properties, low maintenance.",
                "difficulty": "Easy",
                "watering": "Every 2 weeks",
                "light_tolerance": "High (bright indirect)"
            },
            {
                "name": "Jade Plant",
                "desc": "Succulent that loves sun, brings good fortune.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "High (direct sun)"
            },
            {
                "name": "Rubber Plant",
                "desc": "Beautiful glossy leaves, air-purifying, loves bright light.",
                "difficulty": "Medium",
                "watering": "Weekly",
                "light_tolerance": "High (bright indirect)"
            }
        ]
    elif light_level == "medium":
        plants = [
            {
                "name": "Pothos (Money Plant)",
                "desc": "Perfect for moderate light, easy to care, air-purifying.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "Medium (indirect)"
            },
            {
                "name": "Spider Plant",
                "desc": "Adaptable, produces baby plants, excellent air purifier.",
                "difficulty": "Easy",
                "watering": "2x/week",
                "light_tolerance": "Medium (indirect)"
            },
            {
                "name": "Peace Lily",
                "desc": "Beautiful white flowers, loves shade and humidity.",
                "difficulty": "Medium",
                "watering": "2x/week",
                "light_tolerance": "Medium (shade tolerant)"
            },
            {
                "name": "Philodendron",
                "desc": "Fast-growing vine, heart-shaped leaves, very adaptable.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "Medium (indirect)"
            }
        ]
    else:  # low light
        plants = [
            {
                "name": "Snake Plant",
                "desc": "Survives in low light, minimal care needed.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "Low (extremely tolerant)"
            },
            {
                "name": "ZZ Plant",
                "desc": "Nearly indestructible, perfect for low light and beginners.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "Low (can survive darkness)"
            },
            {
                "name": "Pothos",
                "desc": "Adapts to low light, trailing vines look beautiful.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "Low (very adaptable)"
            },
            {
                "name": "Cast Iron Plant",
                "desc": "Lives up to its name - extremely tough and low-light tolerant.",
                "difficulty": "Easy",
                "watering": "Weekly",
                "light_tolerance": "Low (shade loving)"
            }
        ]
    
    return plants

def get_placement_suggestions(features, lighting):
    """Suggest plant placement locations"""
    suggestions = []
    
    if lighting["level"] == "high":
        suggestions.append({
            "location": "Near Windows",
            "plants": "Place sun-loving plants like Aloe or Jade",
            "reason": "Direct/bright light available"
        })
    
    if features["available_space"] in ["good", "excellent"]:
        suggestions.append({
            "location": "Floor Corners",
            "plants": "Large plants like Rubber Plant or Monstera",
            "reason": "Plenty of floor space available"
        })
        suggestions.append({
            "location": "Desk/Table",
            "plants": "Small plants like Pothos or Snake Plant",
            "reason": "Add greenery to workspace"
        })
    
    suggestions.append({
        "location": "Shelves/Walls",
        "plants": "Hanging plants like Spider Plant or Pothos",
        "reason": "Utilize vertical space efficiently"
    })
    
    return suggestions

def is_valid_space_image(img):
    """
    Determine if image is a valid indoor/outdoor space for plant placement analysis.
    
    ACCEPTS: Real spaces like rooms, balconies, windows, desks, gardens with visible
    environmental context (walls, floors, furniture, lighting).
    
    REJECTS: Selfies, close-ups, screenshots, text, blurry/dark images, landscapes,
    vehicles, or images lacking environmental context.
    
    Returns (is_valid, error_message)
    """
    height, width = img.shape[:2]
    
    # Convert to multiple color spaces for comprehensive analysis
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 1. CHECK FOR EXTREMELY DARK OR OVEREXPOSED IMAGES
    avg_brightness = np.mean(gray)
    brightness_std = np.std(gray)
    
    if avg_brightness < 15:  # Almost completely black
        return False, "❌ Image is too dark to analyze. Please upload a well-lit photo of your space."
    
    if avg_brightness > 245:  # Almost completely white/overexposed
        return False, "❌ Image is overexposed. Please upload a clear photo of your space with proper lighting."
    
    # 2. CHECK FOR EXTREMELY BLURRY IMAGES
    # Use Laplacian variance to detect blur
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < 50:  # Very low variance indicates blur
        return False, "❌ Image is too blurry. Please upload a clear, focused photo of your space."
    
    # 3. CHECK FOR TEXT/DOCUMENTS/SCREENSHOTS/CERTIFICATES
    # Documents have high contrast edges in regular patterns
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / (height * width)
    
    # Detect horizontal lines (common in text/screenshots)
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    horizontal_lines = cv2.morphologyEx(edges, cv2.MORPH_OPEN, horizontal_kernel)
    horizontal_ratio = np.sum(horizontal_lines > 0) / (height * width)
    
    # Detect vertical lines (common in borders/frames)
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    vertical_lines = cv2.morphologyEx(edges, cv2.MORPH_OPEN, vertical_kernel)
    vertical_ratio = np.sum(vertical_lines > 0) / (height * width)
    
    # Check for white/light background (common in documents/certificates)
    white_pixels = np.sum(gray > 235) / (height * width)
    very_white = np.sum(gray > 250) / (height * width)
    light_pixels = np.sum(gray > 200) / (height * width)
    
    # Detect rectangular borders (strong indicator of documents/certificates)
    # Certificates typically have a rectangular border with content inside
    contours_doc, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    has_rectangular_border = False
    for cnt in contours_doc:
        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)
        cnt_area = cv2.contourArea(cnt)
        img_area = height * width
        # A large rectangular contour covering significant portion of image
        if len(approx) == 4 and cnt_area > img_area * 0.15:
            has_rectangular_border = True
            break
    
    # Detect text-like small components (OCR-style detection)
    # Binary threshold to find text-like features
    _, text_bin = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    text_contours, _ = cv2.findContours(text_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    # Count small components that look like characters
    small_text_components = sum(
        1 for c in text_contours
        if 20 < cv2.contourArea(c) < 2000
        and 0.2 < (cv2.boundingRect(c)[2] / max(cv2.boundingRect(c)[3], 1)) < 5.0
    )
    text_component_density = small_text_components / max(1, (height * width / 10000))
    
    # --- TEXTURE VARIANCE CHECK ---
    # Real rooms have varied textures everywhere (furniture, walls, objects).
    # Documents/certificates have large uniform background regions with sparse content.
    # Measure local texture variance using a block-based approach.
    block_size = 32
    local_vars = []
    for y_pos in range(0, height - block_size, block_size):
        for x_pos in range(0, width - block_size, block_size):
            block = gray[y_pos:y_pos + block_size, x_pos:x_pos + block_size]
            local_vars.append(np.var(block))
    
    if local_vars:
        median_local_var = float(np.median(local_vars))
        low_var_blocks = sum(1 for v in local_vars if v < 100)
        low_var_ratio = low_var_blocks / len(local_vars)
    else:
        median_local_var = 999
        low_var_ratio = 0
    
    print(f"DEBUG DOC: white={white_pixels:.3f}, light={light_pixels:.3f}, horiz={horizontal_ratio:.4f}, "
          f"vert={vertical_ratio:.4f}, edge={edge_density:.4f}, rect_border={has_rectangular_border}, "
          f"text_density={text_component_density:.2f}, median_var={median_local_var:.1f}, "
          f"low_var_ratio={low_var_ratio:.3f}", file=sys.stderr)
    
    # Documents: High white/light background + moderate text patterns
    if white_pixels > 0.65 and horizontal_ratio > 0.05 and edge_density > 0.05:
        return False, "❌ This appears to be a document or certificate. Please upload a photo of your actual physical space."
    
    # Very white documents (almost pure white background)
    if very_white > 0.70 and horizontal_ratio > 0.03:
        return False, "❌ This appears to be a document or certificate. Please upload a photo of your actual physical space."
    
    # Light background with rectangular border (certificates, diplomas)
    if light_pixels > 0.40 and has_rectangular_border and text_component_density > 1.5:
        return False, "❌ This appears to be a document or certificate. Please upload a photo of your actual physical space."
    
    # High text component density with light background (documents even with logos/images)
    if light_pixels > 0.30 and text_component_density > 4.0:
        return False, "❌ This appears to be a document or text-heavy image. Please upload a photo of your actual physical space."
    
    # White background with both horizontal and vertical lines (bordered documents)
    if white_pixels > 0.35 and horizontal_ratio > 0.015 and vertical_ratio > 0.015 and text_component_density > 1.0:
        return False, "❌ This appears to be a document or certificate. Please upload a photo of your actual physical space."
    
    # --- KEY CHECK: Document texture pattern ---
    # Documents have mostly uniform background (low local variance) with sparse text/logos.
    # Real rooms have texture everywhere. If most blocks are flat AND there's text, it's a document.
    if low_var_ratio > 0.55 and text_component_density > 1.0:
        return False, "❌ This appears to be a document or certificate. Please upload a photo of your actual physical space."
    
    # Very uniform image with some edges (document/certificate with color accents)
    if low_var_ratio > 0.65 and edge_density > 0.03:
        return False, "❌ This appears to be a document or flat image. Please upload a photo of your actual physical space."
    
    # Light background + low texture variance (catches colored certificates)
    if light_pixels > 0.35 and low_var_ratio > 0.50 and horizontal_ratio > 0.005:
        return False, "❌ This appears to be a document or certificate. Please upload a photo of your actual physical space."
    
    # Strong text patterns (screenshots, forms)
    if horizontal_ratio > 0.15:
        return False, "❌ This appears to be a screenshot or text image. Please upload a photo of your actual physical space."
    
    
    # 4. CHECK COLOR DIVERSITY
    # Real spaces have varied colors (walls, floors, furniture)
    # BUT: Plain white/colored walls are common in real rooms!
    # Only reject if EXTREMELY uniform (single color object close-up)
    color_stddev = np.std(img, axis=(0, 1))
    avg_color_stddev = np.mean(color_stddev)
    
    # Very strict threshold - only reject obvious single-color close-ups
    if avg_color_stddev < 8:
        return False, "❌ This appears to be a single-color surface or close-up. Please upload a photo showing your room, balcony, or space environment."
    
    # 5. CHECK FOR INSUFFICIENT ENVIRONMENTAL CONTEXT
    # Real spaces show depth, multiple surfaces, and structure
    # Very lenient - only reject completely featureless images
    if edge_density < 0.01:
        return False, "❌ Image lacks environmental context. Please upload a photo showing the area with walls, floor, or furniture where you want to place plants."
    
    # 6. DETECT SKY/OUTDOOR LANDSCAPES (More lenient - only reject clear landscapes)
    upper_half = img[:int(height * 0.5), :]
    hsv_upper = cv2.cvtColor(upper_half, cv2.COLOR_BGR2HSV)
    
    # Sky detection: blue hue, high saturation
    blue_mask = cv2.inRange(hsv_upper, np.array([90, 50, 50]), np.array([130, 255, 255]))
    sky_ratio = np.sum(blue_mask > 0) / (upper_half.shape[0] * upper_half.shape[1])
    
    # Only reject if DOMINATED by sky
    if sky_ratio > 0.70 and edge_density < 0.10:
        return False, "❌ This appears to be an outdoor landscape photo. Please upload a photo of your actual space (room/balcony/patio) with floor/walls visible."
    
    # 7. DETECT CLOSE-UP PLANT PHOTOS OR PURE NATURE SCENES (More specific)
    green_mask = cv2.inRange(hsv, np.array([35, 40, 40]), np.array([85, 255, 255]))
    green_ratio = np.sum(green_mask > 0) / (height * width)
    
    # Only reject if HEAVILY dominated by greenery with no structure
    if green_ratio > 0.75 and edge_density < 0.08:
        return False, "❌ This appears to be a close-up plant or pure nature photo. Please upload a photo of the space environment where you want to place plants."
    
    # 8. DETECT WATER/BEACH/SEA SCENES (More lenient)
    lower_half = img[int(height * 0.4):, :]
    hsv_lower = cv2.cvtColor(lower_half, cv2.COLOR_BGR2HSV)
    water_mask = cv2.inRange(hsv_lower, np.array([85, 50, 50]), np.array([135, 255, 255]))
    water_ratio = np.sum(water_mask > 0) / (lower_half.shape[0] * lower_half.shape[1])
    
    if water_ratio > 0.65:  # Heavily water-dominated
        return False, "❌ This appears to be a beach/water scene. Please upload a photo of your indoor/outdoor living space."
    
    
    # 9. DETECT VEHICLES/ROADS (Very specific indicators only)
    brightness_variance = np.var(gray)
    
    # Cars: high reflections + low color + specific edge pattern
    # Only reject with very strong confidence
    if brightness_variance > 5000 and avg_color_stddev < 20 and edge_density > 0.20:
        return False, "❌ This appears to be a vehicle. Please upload a photo of your living space (room/balcony/garden)."
    
    # 10. DETECT HEAVILY FILTERED/ARTISTIC IMAGES
    saturation = hsv[:, :, 1]
    high_sat_ratio = np.sum(saturation > 230) / (height * width)
    very_low_sat_ratio = np.sum(saturation < 10) / (height * width)
    
    # Only reject extreme cases
    if high_sat_ratio > 0.85:  # Extremely saturated
        return False, "❌ Image appears heavily filtered. Please upload a natural, unfiltered photo of your space."
    
    if very_low_sat_ratio > 0.92 and brightness_std < 20:  # Almost completely grayscale
        return False, "❌ Image quality is insufficient. Please upload a clear, natural color photo of your space."
    
    # 11. CHECK FOR COLLAGE/MULTI-IMAGE PATTERNS
    aspect_ratio = width / height if height > 0 else 1
    if aspect_ratio > 4.0 or aspect_ratio < 0.25:
        return False, "❌ Unusual image format detected. Please upload a single, standard photo of your space."
    
    # 12. FINAL VALIDATION - Only reject truly useless images
    # Most images should pass if they reached here
    if edge_density < 0.008 and avg_color_stddev < 10:
        return False, "❌ Insufficient spatial information. Please upload a photo clearly showing your room corner, balcony, window area, or plant placement space."
    
    # If all checks pass, image is valid
    return True, None


def classify_image_cv(img):
    """CV-based image classification into 4 categories.
    
    Determines whether an image is a space, human, text/document, or non-space object
    using computer vision heuristics. This runs AFTER document detection and BEFORE
    skin/person detection, so that space images with warm tones are not falsely rejected.
    
    Returns: 'space', 'human', 'text_document', or 'non_space_object'
    """
    height, width = img.shape[:2]
    img_area = height * width
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # --- Structural features (rooms have lines, edges, structure) ---
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / img_area
    
    # Detect long straight lines (walls, floors, ceilings, furniture edges)
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=80, minLineLength=50, maxLineGap=10)
    num_lines = len(lines) if lines is not None else 0
    
    # Detect horizontal and vertical lines specifically (strong room indicators)
    horiz_lines = 0
    vert_lines = 0
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
            if angle < 15 or angle > 165:  # horizontal
                horiz_lines += 1
            elif 75 < angle < 105:  # vertical
                vert_lines += 1
    
    # --- Color diversity (rooms have multiple colors: walls, floor, furniture) ---
    color_stddev = np.std(img, axis=(0, 1))
    avg_color_std = np.mean(color_stddev)
    
    # --- Texture variance (rooms have varied textures; documents are flat) ---
    block_size = 32
    local_vars = []
    for y_pos in range(0, height - block_size, block_size):
        for x_pos in range(0, width - block_size, block_size):
            block = gray[y_pos:y_pos + block_size, x_pos:x_pos + block_size]
            local_vars.append(np.var(block))
    
    median_texture = float(np.median(local_vars)) if local_vars else 0
    high_var_ratio = sum(1 for v in local_vars if v > 200) / max(len(local_vars), 1)
    
    # --- Depth cues: brightness gradient top-to-bottom (rooms often have this) ---
    top_brightness = np.mean(gray[:height // 3])
    bottom_brightness = np.mean(gray[2 * height // 3:])
    brightness_gradient = abs(top_brightness - bottom_brightness)
    
    # --- Space indicators ---
    has_room_structure = (num_lines > 8 and (horiz_lines > 2 or vert_lines > 2))
    has_texture_variety = (median_texture > 150 and high_var_ratio > 0.15)
    has_color_variety = avg_color_std > 25
    has_depth = brightness_gradient > 10
    
    space_score = 0
    if has_room_structure:
        space_score += 3
    if has_texture_variety:
        space_score += 2
    if has_color_variety:
        space_score += 1
    if has_depth:
        space_score += 1
    if edge_density > 0.05:
        space_score += 1
    if num_lines > 15:
        space_score += 1
    
    print(f"DEBUG CLASSIFY: edge_density={edge_density:.3f}, lines={num_lines}, "
          f"horiz={horiz_lines}, vert={vert_lines}, color_std={avg_color_std:.1f}, "
          f"median_texture={median_texture:.1f}, high_var_ratio={high_var_ratio:.3f}, "
          f"brightness_grad={brightness_gradient:.1f}, space_score={space_score}", file=sys.stderr)
    
    # Score >= 4: confident it's a space image
    if space_score >= 4:
        return "space"
    
    # If very low structure, probably a close-up object or non-space
    if edge_density < 0.02 and num_lines < 3 and avg_color_std < 15:
        return "non_space_object"
    
    # Default: uncertain, but lean towards space if there's some structure
    if space_score >= 2:
        return "space"
    
    return "non_space_object"


def analyze_space(image_path):
    """Main analysis function with structured validation pipeline.
    
    Validation order:
    1. OpenAI Vision API (if available) - most accurate classifier
    2. CV: Detect text/document images
    3. CV: Classify image type (space vs human vs non-space)
    4. CV: Detect if human DOMINATES the image (only reject clear selfies/portraits)
    5. If classified as space -> proceed to plant analysis
    """
    try:
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return {"error": "Could not read image"}
        
        # ======== STEP 1: OpenAI Vision API (highest accuracy) ========
        openai_valid, openai_error, confidence = validate_image_with_openai(image_path)
        
        if openai_valid is not None:
            print(f"\u2713 OpenAI Vision classified (confidence: {confidence:.2f})", file=sys.stderr)
            if not openai_valid:
                return {
                    "error": "invalid_scene",
                    "message": openai_error,
                    "validation_method": "openai_vision",
                    "confidence": confidence
                }
            # OpenAI says it's a valid space - skip CV validation, go to analysis
        else:
            print("\u2192 OpenAI unavailable, using CV validation pipeline", file=sys.stderr)
            
            # ======== STEP 2: Detect text/documents FIRST ========
            is_valid, error_msg = is_valid_space_image(img)
            if not is_valid:
                return {
                    "error": "invalid_scene",
                    "message": error_msg,
                    "validation_method": "computer_vision"
                }
            
            # ======== STEP 3: Classify image type ========
            image_type = classify_image_cv(img)
            print(f"DEBUG: CV classification = {image_type}", file=sys.stderr)
            
            # ======== STEP 4: Person detection (context-aware) ========
            person_check = detect_skin_tones(img)
            
            if image_type == "space":
                # Image looks like a room/space - only reject for VERY dominant human presence
                # (e.g., prominent face + high skin = actual selfie taken in a room)
                if person_check["has_person"] and person_check.get("face_area_ratio", 0) > 0.05:
                    return {
                        "error": "person_detected",
                        "message": "\u26a0\ufe0f A person is prominently visible in this space photo. Please upload a photo of the space without people in the foreground.",
                        "skin_ratio": person_check["skin_ratio"],
                        "validation_method": "computer_vision"
                    }
                # Otherwise: space with minor skin tones (wood, walls) -> ALLOW through
                print("DEBUG: Space image with minor skin tones - allowing through", file=sys.stderr)
            else:
                # Image doesn't look like a space - apply normal person check
                if person_check["has_person"]:
                    return {
                        "error": "person_detected",
                        "message": "\u26a0\ufe0f This image appears to be a human photo or selfie. Please upload a picture of your room, balcony, desk area, or space where you want plants.",
                        "skin_ratio": person_check["skin_ratio"],
                        "validation_method": "computer_vision"
                    }
                
                # Not a space and not a person - reject as non-space object
                if image_type == "non_space_object":
                    return {
                        "error": "invalid_scene",
                        "message": "\u274c This image does not appear to show a usable space for placing plants. Please upload a clear picture of your room, balcony, or plant placement area.",
                        "validation_method": "computer_vision"
                    }
        
        # ======== STEP 5: Valid space - proceed with analysis ========
        lighting = analyze_lighting(img)
        features = detect_space_features(img)
        space_score = calculate_space_score(lighting, features)
        plants = get_plant_recommendations(lighting, features)
        placements = get_placement_suggestions(features, lighting)
        
        result = {
            "success": True,
            "lighting": lighting,
            "space_features": features,
            "space_score": space_score,
            "recommended_plants": plants,
            "placement_suggestions": placements,
            "analysis_summary": f"Your space has {lighting['description'].lower()} with {features['available_space']} space available for plants.",
            "validation_method": "openai_vision" if openai_valid is not None else "computer_vision"
        }
        
        return result
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python analyze_space.py <image_path>"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not Path(image_path).exists():
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)
    
    # Perform analysis
    result = analyze_space(image_path)
    
    # Output JSON result
    print(json.dumps(result, indent=2))
