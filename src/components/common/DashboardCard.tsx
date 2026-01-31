import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

interface DashboardCardProps {
  amount: string | number;
  title: string;
  subTitle?: string;
  IconComponent?: React.ElementType;
  type?: 'default' | 'loan' | 'renewal';
  dueAmount?: string | number;
  onRepay?: () => void;
  isRepayEnabled?: boolean;
  alreadyRepaidToday?: boolean;
  renewalDays?: number;
  isNewUser?: boolean;
  onRenew?: () => void;
  isRenewEnabled?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  amount,
  title,
  subTitle,
  IconComponent,
  type = 'default',
  dueAmount = 0,
  onRepay,
  isRepayEnabled = false,
  alreadyRepaidToday = false,
  renewalDays,
  isNewUser = false,
  onRenew,
  isRenewEnabled = false
}) => {

  const getRepayButtonText = () => {
    if (isRepayEnabled) return 'Repay Now';
    if (alreadyRepaidToday) return 'Already Repaid Today';
    return 'Available Saturday';
  };

  if (type === 'loan') {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(77, 42, 190, 0.5) 0%, rgba(17, 27, 49, 0.6) 100%)',
          backdropFilter: 'blur(5px)',
          color: '#fff',
          borderRadius: '10px',
          padding: { xs: '6px', sm: '8px' },
          display: 'flex',
          alignItems: 'center',
          boxShadow: 3,
          height: '100%',
          minHeight: { xs: '120px', sm: '160px' },
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <CardContent sx={{
          textAlign: 'center',
          p: { xs: '8px', sm: '12px' },
          width: '100%',
          '&:last-child': { paddingBottom: { xs: '8px', sm: '12px' } }
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              mb: 1.5,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            {title}
          </Typography>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            mb: 2
          }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ₹{amount}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                  mb: 0.5,
                  opacity: 0.9
                }}
              >
                Due Amount
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                ₹{dueAmount}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={onRepay}
            disabled={!isRepayEnabled}
            sx={{
              background: isRepayEnabled
                ? 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                background: isRepayEnabled
                  ? 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isRepayEnabled
                  ? '0 4px 12px rgba(107, 33, 168, 0.3)'
                  : 'none',
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
              },
              fontWeight: 'bold',
              textTransform: 'none',
              px: { xs: 2, sm: 3 },
              py: 0.8,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              minWidth: '120px'
            }}
          >
            {getRepayButtonText()}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (type === 'renewal') {
    return (
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(94, 59, 214, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
          backdropFilter: 'blur(5px)',
          color: '#fff',
          borderRadius: '10px',
          padding: { xs: '6px', sm: '8px' },
          display: 'flex',
          alignItems: 'center',
          boxShadow: 3,
          height: '100%',
          minHeight: { xs: '120px', sm: '160px' },
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <CardContent sx={{
          textAlign: 'center',
          p: { xs: '8px', sm: '12px' },
          width: '100%',
          '&:last-child': { paddingBottom: { xs: '8px', sm: '12px' } }
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1.5,
            mb: 2
          }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', sm: '1.3rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {amount}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            {isNewUser ? (
              <Typography
                variant="body2"
                sx={{
                  color: '#fbbf24', // Amber/Yellow for action needed
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  background: 'rgba(255,255,255,0.1)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'inline-block'
                }}
              >
                Select RD Package
              </Typography>
            ) : renewalDays !== undefined && renewalDays > 0 ? (
              <Typography
                variant="body2"
                sx={{
                  color: '#d1d5db',
                  fontWeight: 'medium',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  background: 'rgba(0,0,0,0.2)',
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 1,
                  display: 'inline-block'
                }}
              >
                Next RD Deposit in {renewalDays} days
              </Typography>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: '#ef4444',
                  fontWeight: 'bold',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  background: 'rgba(255,255,255,0.1)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'inline-block'
                }}
              >
                Renewal Due
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            onClick={onRenew}
            disabled={!isRenewEnabled}
            sx={{
              background: isRenewEnabled
                ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' // Green for renew
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                background: isRenewEnabled
                  ? 'linear-gradient(135deg, #15803d 0%, #166534 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                boxShadow: isRenewEnabled
                  ? '0 4px 12px rgba(22, 163, 74, 0.3)'
                  : 'none',
              },
              '&:disabled': {
                color: 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
              },
              fontWeight: 'bold',
              textTransform: 'none',
              px: { xs: 2, sm: 3 },
              py: 0.8,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              minWidth: '120px'
            }}
          >
            {isNewUser ? 'Select RD Package' : 'Deposit Amount'}
          </Button>
        </CardContent>
      </Card >
    );
  }

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(94, 59, 214, 0.5) 0%, rgba(15, 23, 42, 0.6) 100%)',
        backdropFilter: 'blur(5px)',
        color: '#fff',
        borderRadius: '10px',
        padding: { xs: '12px', sm: '16px' },
        display: 'flex',
        alignItems: 'center',
        boxShadow: 3,
        height: '100%',
        minHeight: { xs: '120px', sm: '160px' },
        width: '100%',
        flexDirection: { xs: 'row', sm: 'row' },
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', sm: '120px' },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          mb: { xs: 1, sm: 0 },
        }}
      >
        {IconComponent ? <IconComponent sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} /> : <CurrencyRupeeIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} />}
      </Box>
      <CardContent
        sx={{
          padding: { xs: '8px', sm: '16px' },
          width: '100%',
          '&:last-child': { paddingBottom: { xs: '8px', sm: '16px' } }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '5px',
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          {amount}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            fontWeight: '500',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {title}
        </Typography>
        {subTitle && (
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              fontWeight: '400',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              marginTop: '4px'
            }}
          >
            {subTitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
