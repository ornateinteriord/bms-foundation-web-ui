import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';
import { useNavigate } from 'react-router-dom';

const InterestCard: React.FC = () => {
    const navigate = useNavigate();
    
    const handleNavigate = () => {
        navigate('/banking/interestrate');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                px: 4,
                py: 3,
                mb: 3,
                border: '1px solid #e2e8f0',
            }}
        >
            {/* Left side - Text */}
            <Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        letterSpacing: 0.5,
                    }}
                >
                    EXPLORE THE POWER OF OUR ADMIN TEMPLATE
                </Typography>
            </Box>

            {/* Right side - Button */}
            <Button
                variant="contained"
                startIcon={<PercentIcon />}
                onClick={handleNavigate}
                sx={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    px: 3,
                    py: 1,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                        backgroundColor: '#b91c1c',
                    }
                }}
            >
                INTEREST RATE
            </Button>
        </Box>
    );
};

export default InterestCard;
