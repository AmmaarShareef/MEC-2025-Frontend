"""
Backend API Endpoints for Fire Map Integration

Add these endpoints to your existing backend API server.
These endpoints provide wildfire location data for the map visualization.
"""

from fastapi import FastAPI, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel

# ============================================================================
# Data Models
# ============================================================================

class WildfireLocation(BaseModel):
    """Wildfire location and intensity data"""
    id: int
    lat: float
    lng: float
    intensity: str  # 'low', 'medium', 'high', 'critical'
    confidence: float  # 0.0 to 1.0
    area: Optional[str] = None
    detected_at: str  # ISO format timestamp
    status: str  # 'active', 'monitoring', 'contained'
    affected_infrastructure: Optional[List[str]] = None

class WildfireResponse(BaseModel):
    """Response model for wildfire queries"""
    wildfires: List[WildfireLocation]
    total: int
    radius_km: Optional[float] = None
    center_lat: Optional[float] = None
    center_lng: Optional[float] = None

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/api/wildfires/nearby", response_model=WildfireResponse)
async def get_wildfires_nearby(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(50, description="Radius in kilometers")
):
    """
    Get wildfires near a specific location
    
    This endpoint should query your database or ML analysis results
    to find wildfires within the specified radius.
    """
    try:
        # TODO: Query your database/ML results for wildfires near this location
        # Example:
        # wildfires = db.query_wildfires_near_location(lat, lng, radius)
        # or
        # wildfires = your_ml_system.get_detected_fires_in_radius(lat, lng, radius)
        
        # For now, return example data structure
        # Replace this with actual database/ML query
        wildfires = [
            {
                "id": 1,
                "lat": lat + 0.05,  # Example: 5.5km north
                "lng": lng + 0.05,  # Example: 5.5km east
                "intensity": "high",
                "confidence": 0.85,
                "area": "North Region",
                "detected_at": "2024-01-01T12:00:00Z",
                "status": "active",
                "affected_infrastructure": ["power_lines", "water_supply"]
            },
            {
                "id": 2,
                "lat": lat - 0.03,
                "lng": lng + 0.08,
                "intensity": "medium",
                "confidence": 0.72,
                "area": "East Region",
                "detected_at": "2024-01-01T11:30:00Z",
                "status": "active",
                "affected_infrastructure": ["transportation"]
            }
        ]
        
        return {
            "wildfires": wildfires,
            "total": len(wildfires),
            "radius_km": radius,
            "center_lat": lat,
            "center_lng": lng
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/wildfires/active", response_model=WildfireResponse)
async def get_all_active_wildfires():
    """
    Get all active wildfires
    
    Returns all currently active wildfires from your system.
    """
    try:
        # TODO: Query your database for all active wildfires
        # Example:
        # wildfires = db.get_active_wildfires()
        # or
        # wildfires = your_ml_system.get_all_active_detections()
        
        # For now, return example data
        wildfires = [
            {
                "id": 1,
                "lat": 37.7749,
                "lng": -122.4194,
                "intensity": "high",
                "confidence": 0.85,
                "area": "San Francisco Bay Area",
                "detected_at": "2024-01-01T12:00:00Z",
                "status": "active"
            }
        ]
        
        return {
            "wildfires": wildfires,
            "total": len(wildfires)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-image")
async def upload_image_with_location(
    image: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    timestamp: Optional[str] = Form(None)
):
    """
    Upload image with location data
    
    When frontend sends location, store it with the image analysis.
    After ML analysis, you can add the detected fire to your database
    with the location information.
    """
    try:
        contents = await image.read()
        image_pil = Image.open(io.BytesIO(contents))
        
        # TODO: Process image with your ML model
        # prediction = your_ml_model.predict(image_pil)
        
        # TODO: If fire is detected, store it in database with location
        # if prediction.risk_level in ['high', 'critical']:
        #     fire_data = {
        #         "lat": latitude,
        #         "lng": longitude,
        #         "intensity": prediction.risk_level,
        #         "confidence": prediction.confidence,
        #         "detected_at": timestamp or datetime.now().isoformat(),
        #         "image_id": saved_image_id
        #     }
        #     db.add_wildfire(fire_data)
        
        return {
            "message": "Image uploaded successfully",
            "filename": image.filename,
            "location": {
                "lat": latitude,
                "lng": longitude
            } if latitude and longitude else None,
            "prediction": {
                "risk_level": "medium",
                "confidence": 0.75
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# Database Integration Example
# ============================================================================

"""
Example database schema for storing wildfire detections:

CREATE TABLE wildfires (
    id SERIAL PRIMARY KEY,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    intensity VARCHAR(20) NOT NULL,
    confidence DECIMAL(3, 2) NOT NULL,
    area VARCHAR(255),
    detected_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    image_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Example query function:

def get_wildfires_near_location(lat, lng, radius_km):
    # Calculate bounding box (approximate)
    # 1 degree latitude ≈ 111 km
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / (111.0 * abs(math.cos(math.radians(lat))))
    
    query = """
    SELECT * FROM wildfires
    WHERE lat BETWEEN :min_lat AND :max_lat
    AND lng BETWEEN :min_lng AND :max_lng
    AND status = 'active'
    ORDER BY detected_at DESC
    """
    
    return db.execute(query, {
        'min_lat': lat - lat_delta,
        'max_lat': lat + lat_delta,
        'min_lng': lng - lng_delta,
        'max_lng': lng + lng_delta
    })
"""

# ============================================================================
# ML Integration Example
# ============================================================================

"""
Example: After ML analysis, add detected fires to database

async def process_image_and_store_fire(image, lat, lng):
    # Run ML prediction
    prediction = your_ml_model.predict(image)
    
    # If fire detected, store location
    if prediction.risk_level in ['high', 'critical']:
        fire_data = {
            'lat': lat,
            'lng': lng,
            'intensity': prediction.risk_level,
            'confidence': prediction.confidence,
            'detected_at': datetime.now().isoformat(),
            'status': 'active'
        }
        
        # Store in database
        fire_id = db.insert_wildfire(fire_data)
        
        return {
            'fire_detected': True,
            'fire_id': fire_id,
            'prediction': prediction
        }
    
    return {
        'fire_detected': False,
        'prediction': prediction
    }
"""



