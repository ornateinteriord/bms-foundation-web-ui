import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface DashboardItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  bgColor?: string;
  iconColor?: string;
}

const DashboardItem: React.FC<DashboardItemProps> = ({
  icon,
  label,
  onClick,
  bgColor = '#fff',
  iconColor = '#0a2558' // Changed from purple to project blue
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        '&:active': {
          transform: 'scale(0.95)',
        },
        width: '100%',
        gap: 1
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: { xs: 56, sm: 64 },
          height: { xs: 56, sm: 64 },
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          color: iconColor,
          '& svg': {
            fontSize: { xs: 28, sm: 32 },
          }
        }}
      >
        {icon}
      </Paper>
      <Typography
        variant="caption"
        sx={{
          textAlign: 'center',
          fontWeight: 600,
          color: '#333',
          fontSize: { xs: '0.65rem', sm: '0.75rem' },
          lineHeight: 1.2,
          maxWidth: '80px'
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default DashboardItem;
