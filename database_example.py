"""
Simple Database Example for Phoenix AID
SQLite + Local File Storage - Simplest Option

Install: pip install sqlalchemy pillow
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import json

Base = declarative_base()

class WildfireImage(Base):
    """Store uploaded images and their analysis"""
    __tablename__ = 'wildfire_images'
    
    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Path to saved image
    original_filename = Column(String)
    file_size = Column(Integer)  # Size in bytes
    latitude = Column(Float)
    longitude = Column(Float)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    analysis_result = Column(Text)  # JSON string of analysis
    risk_level = Column(String)  # low, medium, high, critical
    confidence = Column(Float)
    status = Column(String, default='pending')  # pending, analyzed, processed

class WildfireDetection(Base):
    """Store detected wildfires from image analysis"""
    __tablename__ = 'wildfire_detections'
    
    id = Column(Integer, primary_key=True)
    image_id = Column(Integer)  # Reference to wildfire_images
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    intensity = Column(String, nullable=False)  # low, medium, high, critical
    confidence = Column(Float, nullable=False)
    area = Column(String)
    detected_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default='active')  # active, monitoring, contained

# Initialize database
def init_db():
    """Create database and tables if they don't exist"""
    # Create images directory
    os.makedirs('uploads/images', exist_ok=True)
    
    # Create database (SQLite file)
    engine = create_engine('sqlite:///wildfire_data.db', echo=False)
    Base.metadata.create_all(engine)
    
    return engine

# Get database session
def get_session():
    """Get a new database session"""
    engine = init_db()
    Session = sessionmaker(bind=engine)
    return Session()

# Example usage in your API endpoint:
"""
from database import get_session, WildfireImage, WildfireDetection
from PIL import Image
import io

@app.post("/api/upload-image")
async def upload_image(image: UploadFile = File(...), latitude: Optional[float] = Form(None)):
    contents = await image.read()
    
    # Save image to disk
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{image.filename}"
    file_path = f"uploads/images/{filename}"
    
    with open(file_path, 'wb') as f:
        f.write(contents)
    
    # Run your ML model
    image_pil = Image.open(io.BytesIO(contents))
    prediction = your_ml_model.predict(image_pil)
    
    # Save to database
    db = get_session()
    try:
        db_image = WildfireImage(
            filename=filename,
            file_path=file_path,
            original_filename=image.filename,
            file_size=len(contents),
            latitude=latitude,
            longitude=longitude,
            analysis_result=json.dumps(prediction),
            risk_level=prediction.get('risk_level'),
            confidence=prediction.get('confidence')
        )
        db.add(db_image)
        db.commit()
        
        # If fire detected, add to detections
        if prediction.get('risk_level') in ['high', 'critical']:
            detection = WildfireDetection(
                image_id=db_image.id,
                lat=latitude,
                lng=longitude,
                intensity=prediction.get('risk_level'),
                confidence=prediction.get('confidence')
            )
            db.add(detection)
            db.commit()
        
        return {"message": "Image saved", "id": db_image.id}
    finally:
        db.close()
"""



