import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file');
}

// Initialize Gemini AI
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Get the generative model
export const getGeminiModel = () => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }
  // Try gemini-1.5-flash first (faster, free tier), fallback to gemini-1.5-pro
  try {
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (e) {
    try {
      return genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    } catch (e2) {
      // Fallback to older model name
      return genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }
};

// Send a chat message to Gemini
export const sendGeminiMessage = async (message, chatHistory = []) => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const model = getGeminiModel();
    
    // Build context for wildfire prediction system
    const systemContext = `You are an AI assistant for Phoenix AID, a wildfire prediction and management system for city infrastructure. 
    You help city officials and emergency responders with:
    - Wildfire risk assessment
    - Satellite imagery analysis
    - Infrastructure protection recommendations
    - Emergency response coordination
    - Real-time wildfire monitoring
    
    Provide clear, actionable advice focused on protecting city infrastructure and public safety.`;

    // Build full prompt with context and history
    let fullPrompt = systemContext;
    
    // Add conversation history if available
    if (chatHistory.length > 0) {
      fullPrompt += '\n\nPrevious conversation:\n';
      chatHistory.forEach(msg => {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    // Add current message
    fullPrompt += `\n\nUser: ${message}\nAssistant:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    // Provide more helpful error messages
    if (error.message?.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check your .env file.');
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error.message?.includes('model')) {
      throw new Error('Model not available. Please check your API key has access to Gemini models.');
    }
    throw new Error(error.message || 'Failed to get response from Gemini API. Please check your API key and try again.');
  }
};

// Send image to Gemini for analysis
export const analyzeImageWithGemini = async (imageFile) => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    // Convert image file to base64 or use file directly
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analyze this satellite or aerial image for wildfire risk indicators and provide a comprehensive analysis.

    Analyze and report on:
    1. **Fire Risk Indicators:**
       - Dry vegetation patterns and density
       - Weather conditions visible (clouds, smoke, haze)
       - Visible fire or smoke plumes
       - Burn scars or previous fire areas
    
    2. **Infrastructure Assessment:**
       - Buildings and structures visible
       - Roads and transportation routes
       - Power lines or electrical infrastructure
       - Water sources (rivers, lakes, reservoirs)
       - Proximity of infrastructure to risk zones
    
    3. **Terrain Analysis:**
       - Topography (hills, valleys, slopes)
       - Vegetation types and coverage
       - Natural firebreaks or barriers
       - Potential fire spread patterns
    
    4. **Risk Assessment:**
       - Overall fire risk level (Low/Medium/High/Critical)
       - Confidence level in assessment
       - Specific areas of concern
       - Time-sensitive risks
    
    5. **Recommendations:**
       - Immediate actions needed
       - Infrastructure protection measures
       - Evacuation route recommendations
       - Resource deployment suggestions
    
    Format your response in a clear, structured manner with sections for each category above.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini image analysis error:', error);
    throw error;
  }
};

// Helper function to convert file to Gemini format
const fileToGenerativePart = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inlineData: {
          data: reader.result.split(',')[1], // Remove data:image/...;base64, prefix
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

