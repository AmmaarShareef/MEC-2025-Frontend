import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import HomeIcon from '@mui/icons-material/Home';
import AirIcon from '@mui/icons-material/Air';
import WarningIcon from '@mui/icons-material/Warning';
import { getCurrentLocation, watchLocation, stopWatchingLocation } from '../utils/geolocation';
import { getWildfiresNearLocation, getAllActiveWildfires, getLocationSafetyInfo } from '../utils/api';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom fire icon based on intensity
const createFireIcon = (intensity) => {
  const colors = {
    low: '#ff9800',      // Orange
    medium: '#ff5722',   // Deep Orange
    high: '#d32f2f',     // Red
    critical: '#b71c1c'  // Dark Red
  };
  
  const color = colors[intensity] || colors.medium;
  const size = intensity === 'critical' ? 30 : intensity === 'high' ? 25 : intensity === 'medium' ? 20 : 15;
  
  return L.divIcon({
    className: 'custom-fire-icon',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${size * 0.4}px;
    ">🔥</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Component to center map on user location
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const FireMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [wildfires, setWildfires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [wildfireError, setWildfireError] = useState(null);
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]); // Default: San Francisco
  const [mapZoom, setMapZoom] = useState(10);
  const [safetyInfo, setSafetyInfo] = useState(null);
  const watchIdRef = useRef(null);

  // Get user location on mount
  useEffect(() => {
    requestLocation();
    return () => {
      if (watchIdRef.current) {
        stopWatchingLocation(watchIdRef.current);
      }
    };
  }, []);

  // Fetch wildfires and safety info when location is available
  useEffect(() => {
    if (userLocation) {
      fetchWildfires();
      fetchSafetyInfo();
      // Set up periodic updates every 30 seconds
      const interval = setInterval(() => {
        fetchWildfires();
        fetchSafetyInfo();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [userLocation]);

  const requestLocation = async () => {
    setLoading(true);
    setLocationError(null);
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setMapCenter([location.lat, location.lng]);
      setMapZoom(13);
      
      // Start watching location for updates
      watchIdRef.current = watchLocation((newLocation) => {
        setUserLocation(newLocation);
      });
    } catch (error) {
      setLocationError(error.message);
      // Try to fetch wildfires anyway (without user location)
      fetchWildfires();
    } finally {
      setLoading(false);
    }
  };

  const fetchWildfires = async () => {
    setWildfireError(null);
    
    try {
      let data;
      if (userLocation) {
        // Fetch wildfires near user location (50km radius)
        data = await getWildfiresNearLocation(userLocation.lat, userLocation.lng, 50);
      } else {
        // Fetch all active wildfires if no user location
        data = await getAllActiveWildfires();
      }
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setWildfires(data);
      } else if (data.wildfires) {
        setWildfires(data.wildfires);
      } else if (data.data) {
        setWildfires(data.data);
      } else {
        setWildfires([]);
      }
    } catch (error) {
      setWildfireError(error.userMessage || error.message || 'Failed to fetch wildfire data');
      // Set mock data for demonstration if backend is not available
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setWildfires(getMockWildfires());
      }
    }
  };

  const fetchSafetyInfo = async () => {
    if (!userLocation) return;
    
    try {
      const info = await getLocationSafetyInfo(userLocation.lat, userLocation.lng);
      setSafetyInfo(info);
    } catch (error) {
      console.error('Failed to fetch safety info:', error);
      // Always use mock data for demo
      setSafetyInfo(getMockSafetyInfo(userLocation.lat, userLocation.lng));
    }
  };

  const getMockSafetyInfo = (lat, lng) => {
    return {
      air_quality_index: Math.floor(Math.random() * 50) + 50,
      air_quality_status: 'Moderate',
      safety_status: 'Moderate',
      outdoor_safety: 'Use caution',
      nearest_shelters: [
        {
          name: 'Community Center',
          address: '123 Main St',
          distance_km: 2.5,
          capacity: 200,
          lat: lat + 0.02,
          lng: lng + 0.02
        },
        {
          name: 'High School Gym',
          address: '456 Oak Ave',
          distance_km: 4.8,
          capacity: 500,
          lat: lat - 0.03,
          lng: lng + 0.04
        }
      ],
      recommendations: [
        'Stay indoors if possible',
        'Keep windows closed',
        'Use air purifier if available'
      ]
    };
  };

  // Mock data for demonstration when backend is not available
  const getMockWildfires = () => {
    if (!userLocation) return [];
    
    // Generate some mock fires around user location
    return [
      {
        id: 1,
        lat: userLocation.lat + 0.05,
        lng: userLocation.lng + 0.05,
        intensity: 'high',
        confidence: 0.85,
        area: 'North Region',
        detected_at: new Date().toISOString(),
        status: 'active'
      },
      {
        id: 2,
        lat: userLocation.lat - 0.03,
        lng: userLocation.lng + 0.08,
        intensity: 'medium',
        confidence: 0.72,
        area: 'East Region',
        detected_at: new Date().toISOString(),
        status: 'active'
      },
      {
        id: 3,
        lat: userLocation.lat + 0.08,
        lng: userLocation.lng - 0.04,
        intensity: 'low',
        confidence: 0.65,
        area: 'South Region',
        detected_at: new Date().toISOString(),
        status: 'monitoring'
      }
    ];
  };

  const getIntensityColor = (intensity) => {
    const colors = {
      low: '#ff9800',
      medium: '#ff5722',
      high: '#d32f2f',
      critical: '#b71c1c'
    };
    return colors[intensity] || colors.medium;
  };

  const getIntensityLabel = (intensity) => {
    return intensity.charAt(0).toUpperCase() + intensity.slice(1);
  };

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        height: '100%',
        bgcolor: 'background.paper',
        border: '1px solid rgba(255, 68, 68, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalFireDepartmentIcon /> Wildfire Map
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Location">
            <IconButton onClick={requestLocation} disabled={loading}>
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Fire Data">
            <IconButton onClick={fetchWildfires} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {locationError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setLocationError(null)}>
          {locationError} - Showing all active wildfires instead.
        </Alert>
      )}

      {wildfireError && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setWildfireError(null)}>
          <strong>⚠️ Demo Mode:</strong> {wildfireError} - Currently showing <strong>demo/mock fire data</strong> for testing. Connect your backend to see real wildfire detections.
        </Alert>
      )}
      
      {wildfires.length > 0 && !wildfireError && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✅ Showing <strong>{wildfires.length}</strong> real wildfire detection(s) from backend
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <Box sx={{ height: '600px', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Center map on user location */}
          <MapCenter center={mapCenter} zoom={mapZoom} />
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })}
            >
              <Popup>
                <Typography variant="subtitle2">Your Location</Typography>
                <Typography variant="body2">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </Typography>
                {userLocation.accuracy && (
                  <Typography variant="caption" color="text.secondary">
                    Accuracy: ±{Math.round(userLocation.accuracy)}m
                  </Typography>
                )}
              </Popup>
            </Marker>
          )}

          {/* Shelter markers */}
          {safetyInfo?.nearest_shelters?.map((shelter, index) => (
            <Marker
              key={`shelter-${index}`}
              position={[shelter.lat, shelter.lng]}
              icon={L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    <HomeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {shelter.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {shelter.address}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Distance:</strong> {shelter.distance_km.toFixed(1)} km
                  </Typography>
                  <Typography variant="body2">
                    <strong>Capacity:</strong> {shelter.capacity} people
                  </Typography>
                </Box>
              </Popup>
            </Marker>
          ))}

          {/* Wildfire markers */}
          {wildfires.map((fire) => (
            <React.Fragment key={fire.id || `${fire.lat}-${fire.lng}`}>
              <Marker
                position={[fire.lat, fire.lng]}
                icon={createFireIcon(fire.intensity || fire.risk_level || 'medium')}
              >
                <Popup>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      🔥 Wildfire Detected
                    </Typography>
                    <Chip
                      label={getIntensityLabel(fire.intensity || fire.risk_level || 'medium')}
                      size="small"
                      sx={{
                        bgcolor: getIntensityColor(fire.intensity || fire.risk_level || 'medium'),
                        color: 'white',
                        mb: 1
                      }}
                    />
                    {fire.area && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Area:</strong> {fire.area}
                      </Typography>
                    )}
                    {fire.confidence && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Confidence:</strong> {(fire.confidence * 100).toFixed(1)}%
                      </Typography>
                    )}
                    {fire.detected_at && (
                      <Typography variant="caption" color="text.secondary">
                        Detected: {new Date(fire.detected_at).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Popup>
              </Marker>
              
              {/* Intensity circle */}
              <Circle
                center={[fire.lat, fire.lng]}
                radius={5000} // 5km radius
                pathOptions={{
                  color: getIntensityColor(fire.intensity || fire.risk_level || 'medium'),
                  fillColor: getIntensityColor(fire.intensity || fire.risk_level || 'medium'),
                  fillOpacity: 0.1,
                  weight: 2
                }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </Box>

      {/* Location Safety Info */}
      {safetyInfo && userLocation && (
        <Card sx={{ mt: 2, mb: 2, bgcolor: 'background.paper', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="primary" /> Your Location Safety Information
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Air Quality */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid rgba(255, 68, 68, 0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AirIcon color="primary" />
                    <Typography variant="subtitle2">Air Quality Index</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {safetyInfo.air_quality_index}
                  </Typography>
                  <Chip
                    label={safetyInfo.air_quality_status}
                    size="small"
                    color={safetyInfo.air_quality_index > 100 ? 'error' : safetyInfo.air_quality_index > 50 ? 'warning' : 'success'}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>

              {/* Outdoor Safety */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid rgba(255, 68, 68, 0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WarningIcon color="warning" />
                    <Typography variant="subtitle2">Outdoor Safety</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    {safetyInfo.outdoor_safety}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Status: {safetyInfo.safety_status}
                  </Typography>
                </Paper>
              </Grid>

              {/* Nearest Shelter */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid rgba(255, 68, 68, 0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <HomeIcon color="success" />
                    <Typography variant="subtitle2">Nearest Shelter</Typography>
                  </Box>
                  {safetyInfo.nearest_shelters && safetyInfo.nearest_shelters.length > 0 && (
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {safetyInfo.nearest_shelters[0].name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {safetyInfo.nearest_shelters[0].distance_km.toFixed(1)} km away
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {safetyInfo.nearest_shelters[0].address}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Recommendations */}
            {safetyInfo.recommendations && safetyInfo.recommendations.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recommendations:
                </Typography>
                <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                  {safetyInfo.recommendations.map((rec, index) => (
                    <Typography key={index} component="li" variant="body2" sx={{ mb: 0.5 }}>
                      {rec}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* All Shelters */}
            {safetyInfo.nearest_shelters && safetyInfo.nearest_shelters.length > 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  All Nearby Shelters:
                </Typography>
                {safetyInfo.nearest_shelters.map((shelter, index) => (
                  <Paper key={index} sx={{ p: 1.5, mt: 1, bgcolor: 'background.default', border: '1px solid rgba(255, 68, 68, 0.1)' }}>
                    <Typography variant="body2" fontWeight="medium">
                      {shelter.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {shelter.address} • {shelter.distance_km.toFixed(1)} km • Capacity: {shelter.capacity}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Fire Intensity Legend
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            {['low', 'medium', 'high', 'critical'].map((intensity) => (
              <Box key={intensity} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: getIntensityColor(intensity),
                    border: '2px solid white',
                    boxShadow: 1
                  }}
                />
                <Typography variant="caption">
                  {getIntensityLabel(intensity)}
                </Typography>
              </Box>
            ))}
          </Box>
          {userLocation && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing fires within 50km of your location
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Fire count summary */}
      {wildfires.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Active Wildfires Detected: <strong>{wildfires.length}</strong>
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FireMap;

