# Backend Connection Guide

## What the Frontend Sends to Backend

### 1. Chat Messages
**Endpoint:** `POST /api/chat`

**Request Body:**
```json
{
  "message": "What are the wildfire risks in my area?"
}
```

**Expected Response:**
```json
{
  "response": "Based on current conditions, the wildfire risk in your area is moderate...",
  "message": "response text here"  // Alternative field name
}
```

**OR** just a string:
```json
"Based on current conditions, the wildfire risk..."
```

### 2. Image Upload
**Endpoint:** `POST /api/upload-image`

**Request (Form Data):**
- `image`: File (image file)
- `latitude`: float (optional, if location available)
- `longitude`: float (optional, if location available)
- `timestamp`: string (optional, ISO format)

**Expected Response:**
```json
{
  "message": "Image uploaded successfully",
  "filename": "image.jpg",
  "analysis": "**Fire Risk Indicators:**\n- Moderate dry vegetation...\n\n**Infrastructure Assessment:**\n...",
  "prediction": {
    "risk_level": "medium",
    "confidence": 0.75,
    "recommendations": [
      "Monitor area for 24 hours",
      "Prepare evacuation routes"
    ]
  }
}
```

**OR** if you return just prediction:
```json
{
  "message": "Image uploaded successfully",
  "prediction": {
    "risk_level": "high",
    "confidence": 0.85,
    "recommendations": {
      "infrastructure": ["Secure power lines"],
      "evacuation": ["Route 1: Clear"]
    }
  }
}
```

The frontend will automatically format the prediction into the analysis display.

---

## Backend Implementation Examples

### FastAPI Example

```python
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat")
async def chat(message: dict):
    """
    Handle chat messages from frontend
    
    Expected: {"message": "user message here"}
    Returns: {"response": "AI response here"}
    """
    user_message = message.get("message", "")
    
    # TODO: Process with your chatbot/ML model
    # response = your_chatbot_model.respond(user_message)
    
    # For now, return a simple response
    return {
        "response": f"You said: {user_message}. This is a placeholder response from backend."
    }

@app.post("/api/upload-image")
async def upload_image(
    image: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    timestamp: Optional[str] = Form(None)
):
    """
    Handle image uploads from frontend
    
    Returns analysis text that will replace demo data
    """
    contents = await image.read()
    image_pil = Image.open(io.BytesIO(contents))
    
    # TODO: Run your ML model
    # prediction = your_ml_model.predict(image_pil)
    # analysis = your_ml_model.analyze(image_pil)
    
    # Example response - replace with your actual model output
    analysis_text = """**Fire Risk Indicators:**
- High dry vegetation density detected in northern regions
- Visible smoke plumes in eastern quadrant
- Weather conditions show high wind patterns
- Multiple areas show signs of previous burn scars

**Infrastructure Assessment:**
- Residential structures at moderate risk in central area
- Primary road network may be compromised
- Power transmission lines detected in high-risk zone
- Water sources accessible but may be affected

**Terrain Analysis:**
- Steep topography increases fire spread risk
- Dense forest coverage in 60% of area
- Limited natural firebreaks
- Potential fire spread: Rapid north-to-south progression

**Risk Assessment:**
- Overall Fire Risk Level: **High**
- Confidence Level: 87%
- Areas of Concern: Northern forest, eastern valley, central residential
- Time-Sensitive Risks: Immediate threat within 12-24 hours

**Recommendations:**
- Issue evacuation warnings for eastern valley
- Deploy fire suppression resources to northern region
- Secure power infrastructure immediately
- Prepare water supply systems for increased demand
- Alert all infrastructure maintenance teams"""
    
    return {
        "message": "Image uploaded successfully",
        "filename": image.filename,
        "analysis": analysis_text,  # This will replace demo data
        "prediction": {
            "risk_level": "high",
            "confidence": 0.87
        }
    }
```

### Flask Example

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import io

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    # TODO: Process with your chatbot
    # response = your_chatbot.respond(user_message)
    
    return jsonify({
        "response": f"Backend received: {user_message}"
    })

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image"}), 400
    
    file = request.files['image']
    latitude = request.form.get('latitude', type=float)
    longitude = request.form.get('longitude', type=float)
    
    # TODO: Process with your ML model
    # prediction = your_model.predict(file)
    
    analysis_text = """**Fire Risk Indicators:**
- Analysis from your ML model here
..."""
    
    return jsonify({
        "message": "Image uploaded successfully",
        "analysis": analysis_text,
        "prediction": {
            "risk_level": "medium",
            "confidence": 0.75
        }
    })
```

---

## Response Format Options

### For Chat (`/api/chat`)

**Option 1:** Object with `response` field
```json
{"response": "Your AI response here"}
```

**Option 2:** Object with `message` field
```json
{"message": "Your AI response here"}
```

**Option 3:** Just a string
```json
"Your AI response here"
```

The frontend handles all three formats.

### For Image Upload (`/api/upload-image`)

**Option 1:** Return `analysis` field (formatted text)
```json
{
  "analysis": "**Fire Risk Indicators:**\n- Your analysis here..."
}
```

**Option 2:** Return `prediction` object (will be formatted automatically)
```json
{
  "prediction": {
    "risk_level": "high",
    "confidence": 0.85,
    "recommendations": ["action 1", "action 2"]
  }
}
```

**Option 3:** Both (analysis takes priority)
```json
{
  "analysis": "Full formatted analysis...",
  "prediction": {...}
}
```

---

## How Frontend Handles Responses

### Chat Messages
1. Frontend sends message to `/api/chat`
2. If backend responds → displays backend response
3. If backend fails → falls back to Gemini API
4. Response appears in chat messages

### Image Analysis
1. User uploads image → sent to `/api/upload-image`
2. If backend returns `analysis` → replaces demo data immediately
3. If backend returns `prediction` → formats it as analysis
4. If backend fails → shows demo data (with "Demo Data" chip)

---

## Testing Your Backend

### Test Chat Endpoint
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

Expected: `{"response": "..."}`

### Test Image Upload
```bash
curl -X POST http://localhost:8000/api/upload-image \
  -F "image=@test_image.jpg" \
  -F "latitude=37.7749" \
  -F "longitude=-122.4194"
```

Expected: JSON with `analysis` or `prediction` field

---

## Quick Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] CORS enabled for `http://localhost:3000`
- [ ] `/api/chat` endpoint returns `{"response": "..."}`
- [ ] `/api/upload-image` returns `{"analysis": "..."}` or `{"prediction": {...}}`
- [ ] Test with frontend - chat messages should come from backend
- [ ] Test image upload - analysis should replace demo data

---

## Troubleshooting

**Chat not using backend:**
- Check backend is running
- Check `/api/chat` endpoint exists
- Check response format matches expected
- Check browser console for errors

**Image analysis not updating:**
- Check `/api/upload-image` returns `analysis` or `prediction`
- Check response format is correct
- Check browser console for errors
- Demo data will show if backend fails

**CORS errors:**
- Make sure CORS middleware is configured
- Check `allow_origins` includes `http://localhost:3000`


