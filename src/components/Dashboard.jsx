import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MapIcon from '@mui/icons-material/Map';
import FloatingChatbot from './FloatingChatbot';
import ImageUpload from './ImageUpload';
import FireMap from './FireMap';
import FireSparks from './FireSparks';
import { getWildfireStatus } from '../utils/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [sparkTrigger, setSparkTrigger] = useState(0);
  const [tabBounds, setTabBounds] = useState(null);
  const tabsRef = React.useRef(null);

  useEffect(() => {
    // Fetch wildfire status on mount
    fetchStatus();
    
    // Set up periodic status updates (every 30 seconds)
    const interval = setInterval(fetchStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await getWildfireStatus();
      setStatus(data);
      setStatusError(null);
    } catch (err) {
      // Don't show error if backend is not available yet
      if (err.code !== 'ECONNREFUSED') {
        setStatusError('Unable to fetch wildfire status');
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    if (newValue !== activeTab) {
      // Get tab bounds for sparks
      if (tabsRef.current) {
        const rect = tabsRef.current.getBoundingClientRect();
        setTabBounds({
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        });
      }
      setSparkTrigger(prev => prev + 1);
      setActiveTab(newValue);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}>
      {/* Fire Sparks Effect */}
      <FireSparks trigger={sparkTrigger} tabBounds={tabBounds} />
      
      {/* App Bar */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <LocalFireDepartmentIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Phoenix AID - Wildfire Prediction & Management System
          </Typography>
          {status && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                System Status: {status.status || 'Operational'}
              </Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 20, pb: 4 }}>
        {/* Status Alert */}
        {statusError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {statusError} - Backend may not be running. Some features may be limited.
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Paper 
          ref={tabsRef}
          elevation={4} 
          sx={{ 
            mb: 3,
            bgcolor: 'background.paper',
            border: '1px solid rgba(255, 68, 68, 0.42)',
            borderRadius: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Tab label="Image Analysis" />
            <Tab label="Fire Map" icon={<MapIcon />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Grid container spacing={3}>
          {activeTab === 0 && (
            <Grid item xs={12}>
              <ImageUpload />
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid item xs={12}>
              <FireMap />
            </Grid>
          )}
        </Grid>

        {/* Footer Info */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Phoenix AID - City Infrastructure Wildfire Management System
          </Typography>
        </Box>
      </Container>

      {/* Floating Chatbot Button */}
      <FloatingChatbot />
    </Box>
  );
};

export default Dashboard;

