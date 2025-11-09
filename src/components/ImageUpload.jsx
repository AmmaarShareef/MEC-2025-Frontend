import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { uploadImage, uploadImageWithLocation } from '../utils/api';
import { getCurrentLocation } from '../utils/geolocation';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showDemoAnalysis, setShowDemoAnalysis] = useState(false);

  // Demo analysis data
  const getDemoAnalysis = () => {
    return `**Fire Risk Indicators:**
- Moderate dry vegetation density detected in northern regions
- No visible smoke plumes or active fires
- Clear weather conditions with minimal cloud cover
- Some areas show signs of previous burn scars

**Infrastructure Assessment:**
- Multiple residential structures visible in the central area
- Primary road network appears accessible
- Power transmission lines detected running east-west
- Water reservoir visible in the southwest quadrant
- Infrastructure appears to be at moderate distance from high-risk vegetation zones

**Terrain Analysis:**
- Mixed topography with rolling hills and valleys
- Dense forest coverage in northern and eastern regions
- Natural firebreaks present (rivers, cleared areas)
- Potential fire spread pattern: North to South, following wind patterns

**Risk Assessment:**
- Overall Fire Risk Level: **Medium**
- Confidence Level: 75%
- Areas of Concern: Northern forested regions, eastern valley
- Time-Sensitive Risks: Low immediate threat, but conditions could worsen with dry weather

**Recommendations:**
- Monitor northern regions for 48-72 hours
- Prepare evacuation routes for eastern valley communities
- Ensure water supply systems are operational
- Alert infrastructure maintenance teams to check power line clearances
- Deploy monitoring resources to high-risk zones`;
  };

  // Format backend prediction as analysis text
  const formatPredictionAsAnalysis = (prediction) => {
    if (typeof prediction === 'string') {
      return prediction;
    }
    
    let analysis = `**Risk Assessment:**\n`;
    analysis += `- Overall Fire Risk Level: **${prediction.risk_level || 'Unknown'}**\n`;
    if (prediction.confidence) {
      analysis += `- Confidence Level: ${(prediction.confidence * 100).toFixed(0)}%\n`;
    }
    
    if (prediction.recommendations) {
      analysis += `\n**Recommendations:**\n`;
      if (Array.isArray(prediction.recommendations)) {
        prediction.recommendations.forEach(rec => {
          analysis += `- ${rec}\n`;
        });
      } else if (typeof prediction.recommendations === 'object') {
        if (prediction.recommendations.infrastructure) {
          analysis += `\nInfrastructure:\n`;
          prediction.recommendations.infrastructure.forEach(rec => {
            analysis += `- ${rec}\n`;
          });
        }
        if (prediction.recommendations.evacuation) {
          analysis += `\nEvacuation:\n`;
          prediction.recommendations.evacuation.forEach(rec => {
            analysis += `- ${rec}\n`;
          });
        }
      }
    }
    
    return analysis;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      setResult(null);
      setAnalysis(null);
      setShowDemoAnalysis(true); // Show demo analysis automatically

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get user location when component mounts or when location is enabled
  useEffect(() => {
    if (locationEnabled && !userLocation) {
      getLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationEnabled]);

  const getLocation = async () => {
    setGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.warn('Could not get location:', error.message);
      setLocationEnabled(false);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      let uploadResponse;
      
      // Upload with location if available and enabled
      if (locationEnabled && userLocation) {
        uploadResponse = await uploadImageWithLocation(
          selectedFile,
          userLocation,
          {
            timestamp: new Date().toISOString(),
          }
        );
      } else {
        // Upload without location
        uploadResponse = await uploadImage(selectedFile, {
          timestamp: new Date().toISOString(),
        });
      }

      setResult({
        upload: uploadResponse,
        message: 'Image uploaded successfully',
      });

      // Replace demo analysis with backend response if available
      if (uploadResponse.analysis) {
        setAnalysis(uploadResponse.analysis);
        setShowDemoAnalysis(false);
      } else if (uploadResponse.prediction) {
        // If backend returns prediction, format it as analysis
        const formattedAnalysis = formatPredictionAsAnalysis(uploadResponse.prediction);
        setAnalysis(formattedAnalysis);
        setShowDemoAnalysis(false);
      }
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || err.message || 'Failed to upload image. Please check your backend connection.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setAnalysis(null);
    setError(null);
    setShowDemoAnalysis(false);
  };

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid rgba(255, 68, 68, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ImageIcon /> Satellite Image Upload & Analysis
        </Typography>
        {locationEnabled && userLocation && (
          <Chip
            icon={<LocationOnIcon />}
            label={`Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
            color="primary"
            size="small"
          />
        )}
        {gettingLocation && (
          <Chip
            icon={<CircularProgress size={16} />}
            label="Getting location..."
            size="small"
          />
        )}
      </Box>

      {/* Upload Area */}
      <Box sx={{ mb: 3 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="image-upload-input"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="image-upload-input">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUploadIcon />}
            fullWidth
            sx={{ py: 2, borderStyle: 'dashed' }}
          >
            {selectedFile ? 'Change Image' : 'Select Satellite/Aerial Image'}
          </Button>
        </label>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {selectedFile && (
        <Grid container spacing={3}>
          {/* Preview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={preview}
                alt="Selected image"
                sx={{ objectFit: 'contain', bgcolor: '#f5f5f5' }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    fullWidth
                    size="large"
                  >
                    {uploading ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button variant="text" onClick={handleClear} color="error" fullWidth>
                    Clear
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Results */}
          <Grid item xs={12} md={6}>
            <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
              {result && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd' }}>
                  <Typography variant="h6" gutterBottom>
                    Upload Result
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {result.message}
                  </Typography>
                  {result.prediction && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Prediction:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {typeof result.prediction === 'object'
                          ? JSON.stringify(result.prediction, null, 2)
                          : result.prediction}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}

              {(analysis || showDemoAnalysis) && (
                <Box sx={{ mb: 2 }}>
                  <Accordion defaultExpanded={false} sx={{ boxShadow: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: '#f3e5f5',
                        '&:hover': {
                          bgcolor: '#e8d5e8',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <ImageIcon color="primary" />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          Detailed Image Analysis
                        </Typography>
                        {showDemoAnalysis && !analysis && (
                          <Chip label="Demo Data" size="small" color="info" />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'white', pt: 3 }}>
                      <Box
                        sx={{
                          '& > *': { mb: 2 },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.8,
                            '& strong': {
                              color: 'primary.main',
                              fontWeight: 600,
                            },
                          }}
                          component="div"
                          dangerouslySetInnerHTML={{
                            __html: (analysis || getDemoAnalysis())
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n\n/g, '<br/><br/>')
                              .replace(/\n/g, '<br/>')
                          }}
                        />
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}

              {!result && !analysis && !showDemoAnalysis && (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fafafa' }}>
                  <Typography variant="body2" color="text.secondary">
                    Upload an image and click "Submit" to see results
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      )}

      {!selectedFile && (
        <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fafafa', borderRadius: 1 }}>
          <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Select a satellite or aerial image to begin analysis
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ImageUpload;

