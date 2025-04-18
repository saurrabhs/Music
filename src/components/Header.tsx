import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography } from '@mui/material';

export default function Header() {
  const { currentUser } = useAuth();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: { xs: 0, sm: 240 }, // Adjust left based on drawer width
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        bgcolor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        zIndex: 1,
        borderBottom: '1px solid #282828',
        '& + *': { // Add margin to the next element
          marginTop: '64px'
        }
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.5rem'
        }}
      >
      
      </Typography>
      {currentUser && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#b3b3b3',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          Welcome back!
        </Typography>
      )}
    </Box>
  );
}
