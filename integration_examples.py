"""
Practical Integration Examples for Phoenix AID Backend

These examples show how to integrate common ML patterns with the frontend.
Copy and adapt these to your specific ML code structure.
"""

# ============================================================================
# EXAMPLE 1: TensorFlow/Keras Model
# ============================================================================

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import numpy as np
import tensorflow as tf

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your TensorFlow model
model = tf.keras.models.load_model('path/to/your/model.h5')

def preprocess_image(image_pil):
    """Preprocess image for your TensorFlow model"""
    image_resized = image_pil.resize((224, 224))
    image_array = np.array(image_resized) / 255.0
    return np.expand_dims(image_array, axis=0)

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # Preprocess
    processed = preprocess_image(image_pil)
    
    # Predict
    prediction = model.predict(processed)[0]
    
    # Format response for frontend
    risk_levels = ['low', 'medium', 'high']
    risk_index = np.argmax(prediction)
    
    return {
        "risk_level": risk_levels[risk_index],
        "confidence": float(prediction[risk_index]),
        "all_scores": {
            "low": float(prediction[0]),
            "medium": float(prediction[1]),
            "high": float(prediction[2])
        }
    }


# ============================================================================
# EXAMPLE 2: PyTorch Model
# ============================================================================

import torch
import torchvision.transforms as transforms
from torchvision import models

# Load your PyTorch model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = torch.load('path/to/your/model.pth', map_location=device)
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # Preprocess
    input_tensor = transform(image_pil).unsqueeze(0).to(device)
    
    # Predict
    with torch.no_grad():
        output = model(input_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
    
    risk_levels = ['low', 'medium', 'high']
    risk_index = probabilities.argmax().item()
    
    return {
        "risk_level": risk_levels[risk_index],
        "confidence": float(probabilities[risk_index]),
    }


# ============================================================================
# EXAMPLE 3: Scikit-learn Model with Feature Extraction
# ============================================================================

from sklearn.ensemble import RandomForestClassifier
import joblib
import cv2

# Load your scikit-learn model
model = joblib.load('path/to/your/model.pkl')

def extract_features(image_pil):
    """Extract features from image for scikit-learn model"""
    # Convert to OpenCV format
    img_array = np.array(image_pil)
    img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    # Example feature extraction
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    features = [
        np.mean(gray),
        np.std(gray),
        # Add more features your model expects
    ]
    return np.array(features).reshape(1, -1)

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # Extract features
    features = extract_features(image_pil)
    
    # Predict
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)[0]
    
    return {
        "risk_level": "high" if prediction == 1 else "low",
        "confidence": float(max(probabilities)),
    }


# ============================================================================
# EXAMPLE 4: Multiple Models / Pipeline
# ============================================================================

class WildfirePredictionPipeline:
    def __init__(self):
        self.detector = load_detection_model()
        self.risk_assessor = load_risk_model()
        self.infrastructure_analyzer = load_infrastructure_model()
    
    def predict(self, image_pil):
        # Step 1: Detect wildfire
        detection = self.detector.detect(image_pil)
        
        # Step 2: Assess risk
        risk = self.risk_assessor.assess(image_pil, detection)
        
        # Step 3: Analyze infrastructure impact
        infra_impact = self.infrastructure_analyzer.analyze(image_pil, risk)
        
        return {
            "detection": detection,
            "risk_assessment": risk,
            "infrastructure_impact": infra_impact
        }

pipeline = WildfirePredictionPipeline()

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    result = pipeline.predict(image_pil)
    return result


# ============================================================================
# EXAMPLE 5: Custom ML Function from Separate File
# ============================================================================

# If your ML code is in a separate file: ml_functions.py
# from ml_functions import predict_wildfire_risk, preprocess_satellite_image

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # Use your existing function
    # processed = preprocess_satellite_image(image_pil)
    # result = predict_wildfire_risk(processed)
    
    # return result
    pass


# ============================================================================
# EXAMPLE 6: Image Upload with Processing
# ============================================================================

@app.post("/api/upload-image")
async def upload_image(
    image: UploadFile = File(...),
    timestamp: Optional[str] = None
):
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # Process image with your ML model
    # prediction = your_model.predict(image_pil)
    
    # Optionally save image
    # image_pil.save(f"uploads/{image.filename}")
    
    return {
        "message": "Image uploaded successfully",
        "filename": image.filename,
        "size": len(contents),
        "timestamp": timestamp,
        "prediction": {
            "risk_level": "medium",
            "confidence": 0.75,
            "recommendations": [
                "Monitor area for 24 hours",
                "Prepare evacuation routes"
            ]
        }
    }


# ============================================================================
# EXAMPLE 7: Error Handling Best Practices
# ============================================================================

from fastapi import HTTPException

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    try:
        # Validate file
        if not image.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        # Validate image format
        try:
            image_pil = Image.open(io.BytesIO(contents))
            image_pil.verify()  # Verify it's a valid image
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Reopen after verify (verify closes the image)
        image_pil = Image.open(io.BytesIO(contents))
        
        # Validate image size
        if image_pil.size[0] < 100 or image_pil.size[1] < 100:
            raise HTTPException(status_code=400, detail="Image too small")
        
        # Call ML model with error handling
        try:
            prediction = your_ml_model.predict(image_pil)
        except Exception as ml_error:
            raise HTTPException(
                status_code=500,
                detail=f"ML model error: {str(ml_error)}"
            )
        
        return prediction
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )


# ============================================================================
# EXAMPLE 8: Async Model Loading (For Large Models)
# ============================================================================

import asyncio
from functools import lru_cache

@lru_cache(maxsize=1)
def load_model():
    """Load model once and cache it"""
    print("Loading model...")
    # model = your_model_loading_function()
    print("Model loaded!")
    return model

@app.on_event("startup")
async def startup_event():
    """Load model when server starts"""
    await asyncio.to_thread(load_model)

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    model = load_model()  # Gets cached model
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # Run prediction in thread pool to avoid blocking
    prediction = await asyncio.to_thread(model.predict, image_pil)
    
    return prediction


# ============================================================================
# EXAMPLE 9: Flask Version
# ============================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Load your model
# model = load_your_model()

@app.route('/api/predict', methods=['POST'])
def predict_wildfire():
    if 'image' not in request.files:
        return jsonify({"error": "No image file"}), 400
    
    file = request.files['image']
    contents = file.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # Call your ML model
    # prediction = model.predict(image_pil)
    
    return jsonify({
        "risk_level": "high",
        "confidence": 0.85
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)



