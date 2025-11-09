import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { sendChatMessage } from '../utils/api';

const Chatbot = ({ inputValue = '', onMessageSent, onExit, sendTrigger = 0 }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your Phoenix AID assistant. I can help you with wildfire risk assessment, infrastructure protection recommendations, and emergency response coordination. How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatHistoryRef = useRef([]);
  const pendingMessageRef = useRef(null);
  const lastSendTriggerRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageToSend = null) => {
    const message = messageToSend || input.trim();
    if (!message || loading) return;

    const userMessage = message.trim();
    
    // Handle exit command - send to backend first, then close
    if (userMessage.toLowerCase() === 'exit') {
      try {
        // Try to send exit message to backend
        try {
          await sendChatMessage('exit');
        } catch (e) {
          // Backend might not be available, that's okay
          console.log('Backend not available for exit message');
        }
      } finally {
        // Close the panel
        if (onExit) {
          onExit();
        }
      }
      return;
    }

    setInput('');
    setLoading(true);
    pendingMessageRef.current = null;

    // Add user message to UI
    const newUserMessage = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);

    // Update chat history
    chatHistoryRef.current = [...chatHistoryRef.current, newUserMessage];

    try {
      // Send message to backend
      const backendResponse = await sendChatMessage(userMessage);
      const response = typeof backendResponse === 'string' 
        ? backendResponse 
        : (backendResponse.response || backendResponse.message || JSON.stringify(backendResponse));
      
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update chat history
      chatHistoryRef.current = [...chatHistoryRef.current, assistantMessage];
    } catch (err) {
      // Instead of showing error, show "message received!" response
      const assistantMessage = { 
        role: 'assistant', 
        content: 'Message received! I\'m processing your request. Please ensure the backend is connected for full functionality.' 
      };
      setMessages(prev => [...prev, assistantMessage]);
      chatHistoryRef.current = [...chatHistoryRef.current, assistantMessage];
      console.error('Chatbot error:', err);
    } finally {
      setLoading(false);
      if (onMessageSent) {
        onMessageSent();
      }
    }
  };

  // Handle message from floating input - only when sendTrigger changes (not on every keystroke)
  useEffect(() => {
    // Only process when sendTrigger changes, meaning a message was explicitly sent
    if (sendTrigger > lastSendTriggerRef.current && inputValue && inputValue.trim()) {
      lastSendTriggerRef.current = sendTrigger;
      const messageToSend = inputValue.trim();
      if (messageToSend !== pendingMessageRef.current) {
        pendingMessageRef.current = messageToSend;
        handleSend(messageToSend);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendTrigger, inputValue]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'background.default',
          minHeight: 0, // Important for flex scrolling
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                p: 1.5,
                borderRadius: 2,
                bgcolor: message.role === 'user' ? 'primary.main' : 'background.paper',
                color: message.role === 'user' ? 'white' : 'text.primary',
                border: message.role === 'assistant' ? '1px solid rgba(255, 68, 68, 0.2)' : 'none',
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </Typography>
            </Box>
          </Box>
        ))}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1px solid rgba(255, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2">Thinking...</Typography>
            </Box>
          </Box>
        )}
        
        
        <div ref={messagesEndRef} />
      </Box>
    </Box>
  );
};

export default Chatbot;

