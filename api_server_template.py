"""
Phoenix AID API Server Template

Copy this file and customize it to integrate with your ML models.
Replace the TODO sections with your actual ML code.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pydantic import BaseModel
import uvicorn
from PIL import Image
import io

# ============================================================================
# TODO: Import your ML model files here
# ============================================================================
# Examples:
# from your_ml_module import predict_wildfire, process_image
# from ml_models.wildfire_model import WildfireModel
# import your_ml_functions as ml
# from your_model import load_model

# ============================================================================
# TODO: Initialize your ML models here (load once, not per request)
# ============================================================================
# Examples:
# model = WildfireModel()
# model.load_model('path/to/model.h5')
# predictor = load_model('path/to/model.pkl')

app = FastAPI(title="Phoenix AID API")

# CORS Configuration - REQUIRED for frontend to work
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Add production frontend URL here when deploying
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
async def get_status():
    """Get system status - called by frontend on load"""
    return {
        "status": "operational",
        "active_wildfires": 0,
        "risk_level": "low",
        "last_update": "2024-01-01T00:00:00Z"
    }

@app.post("/api/upload-image")
async def upload_image(
    image: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    timestamp: Optional[str] = Form(None)
):
    """
    Upload and process image with your ML model
    
    Frontend sends: multipart/form-data with:
    - 'image' file
    - 'latitude' (optional, if location is available)
    - 'longitude' (optional, if location is available)
    - 'timestamp' (optional)
    """
    try:
        # Read image bytes from request
        contents = await image.read()
        
        # Convert to PIL Image
        image_pil = Image.open(io.BytesIO(contents))
        
        # ====================================================================
        # TODO: Call your ML model here
        # ====================================================================
        # If latitude/longitude are provided, you can:
        # 1. Store location with the image analysis
        # 2. If fire is detected, add it to your wildfire database with location
        # 3. Use location for geospatial analysis
        # Examples:
        # 
        # Option 1: If you have a function
        # prediction = your_ml_function(image_pil)
        #
        # Option 2: If you have a class-based model
        # prediction = model.predict(image_pil)
        #
        # Option 3: If you need to preprocess first
        # processed = preprocess_image(image_pil)
        # prediction = model.predict(processed)
        #
        # Option 4: If your model expects numpy array
        # import numpy as np
        # image_array = np.array(image_pil)
        # prediction = model.predict(image_array)
        
        # Placeholder response - REPLACE THIS with actual ML prediction
        prediction = {
            "risk_level": "medium",
            "confidence": 0.75,
            "recommendations": [
                "Monitor area for 24 hours",
                "Prepare evacuation routes",
                "Alert nearby infrastructure"
            ]
        }
        
        response = {
            "message": "Image uploaded successfully",
            "filename": image.filename,
            "size": len(contents),
            "timestamp": timestamp,
            "prediction": prediction
        }
        
        # Include location if provided
        if latitude and longitude:
            response["location"] = {
                "lat": latitude,
                "lng": longitude
            }
            # TODO: If fire detected, store in wildfire database
            # if prediction.get("risk_level") in ["high", "critical"]:
            #     store_wildfire_location(latitude, longitude, prediction)
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
async def predict_wildfire(image: UploadFile = File(...)):
    """
    Get wildfire prediction from image using your ML model
    
    Frontend sends: multipart/form-data with 'image' file
    """
    try:
        contents = await image.read()
        image_pil = Image.open(io.BytesIO(contents))
        
        # ====================================================================
        # TODO: Call your prediction model here
        # ====================================================================
        # prediction = your_ml_model.predict(image_pil)
        # or
        # prediction = your_prediction_function(contents)
        
        # Placeholder response - REPLACE THIS with actual ML prediction
        prediction = {
            "risk_level": "high",  # low, medium, or high
            "confidence": 0.85,     # 0.0 to 1.0
            "affected_areas": ["Area A", "Area B"],
            "recommendations": {
                "infrastructure": [
                    "Secure power lines in affected zone",
                    "Prepare water supply systems",
                    "Alert transportation department"
                ],
                "evacuation": [
                    "Route 1: Clear",
                    "Route 2: Monitor"
                ]
            }
        }
        
        return prediction
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/infrastructure/recommendations")
async def get_infrastructure_recommendations(wildfire_data: dict):
    """
    Get infrastructure protection recommendations
    
    Frontend sends: JSON body with wildfire data
    Expected format:
    {
        "wildfire_id": "string",
        "location": {"lat": float, "lng": float},
        "severity": "low|medium|high",
        "affected_infrastructure": ["power_lines", "water_supply", ...]
    }
    """
    try:
        # ====================================================================
        # TODO: Call your recommendation logic here
        # ====================================================================
        # recommendations = your_recommendation_model.get_recommendations(wildfire_data)
        
        # Placeholder response - REPLACE THIS with actual recommendations
        return {
            "recommendations": [
                {
                    "infrastructure_type": "power_lines",
                    "action": "De-energize affected lines",
                    "priority": "high",
                    "estimated_time": "2 hours"
                },
                {
                    "infrastructure_type": "water_supply",
                    "action": "Increase water pressure in fire zones",
                    "priority": "high",
                    "estimated_time": "30 minutes"
                }
            ],
            "evacuation_routes": {
                "status": "clear",
                "alternate_routes": ["Route A", "Route B"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Map Endpoints - Add these for Fire Map functionality
# ============================================================================

@app.get("/api/wildfires/nearby")
async def get_wildfires_nearby(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(50, description="Radius in kilometers")
):
    """
    Get wildfires near a location for map display
    
    TODO: Query your database/ML results for wildfires in this area
    """
    try:
        # TODO: Query your wildfire database
        # wildfires = db.get_wildfires_near_location(lat, lng, radius)
        
        # Placeholder - replace with actual data
        return {
            "wildfires": [],
            "total": 0,
            "radius_km": radius
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/wildfires/active")
async def get_all_active_wildfires():
    """
    Get all active wildfires for map display
    
    TODO: Query your database for all active wildfires
    """
    try:
        # TODO: Query your wildfire database
        # wildfires = db.get_active_wildfires()
        
        # Placeholder - replace with actual data
        return {
            "wildfires": [],
            "total": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Run the server
    # Access API docs at: http://localhost:8000/docs
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

