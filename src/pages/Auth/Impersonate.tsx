import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

const Impersonate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Set the token in sessionStorage to avoid affecting the admin's localStorage session
      sessionStorage.setItem('token', token);

      // Small delay to ensure storage is updated before redirect
      const timer = setTimeout(() => {
        navigate('/user/dashboard');
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // If no token, redirect to login
      navigate('/login');
    }
  }, [token, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ color: '#0a2558' }} />
      <Typography variant="h6" sx={{ color: '#0a2558', fontWeight: 600 }}>
        Accessing User Dashboard...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we authenticate your session.
      </Typography>
    </Box>
  );
};

export default Impersonate;
