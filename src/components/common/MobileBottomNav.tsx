import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  // Sync state with current path
  React.useEffect(() => {
    if (location.pathname.includes('/user/dashboard')) setValue(0);
    else if (location.pathname.includes('/user/transactions')) setValue(1);
    else if (location.pathname.includes('/user/wallet')) setValue(2);
    else if (location.pathname.includes('/user/account/profile')) setValue(3);
  }, [location.pathname]);

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTop: '1px solid #e0e0e0',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
            switch (newValue) {
              case 0: navigate('/user/dashboard'); break;
              case 1: navigate('/user/transactions'); break;
              case 2: navigate('/user/chat'); break; // Updated to match image
              case 3: navigate('/user/account/profile'); break;
            }
          }}
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              color: '#9e9e9e',
              minWidth: 0,
              padding: '6px 0',
            },
            '& .Mui-selected': {
              color: '#0a2558 !important',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 800,
                fontSize: '0.75rem',
                mt: 0.5
              },
              // The blue rounded square highlight for the icon
              '& .MuiBottomNavigationAction-iconOnly': {
                paddingTop: '16px',
              },
              '& .indicator': {
                backgroundColor: '#0a2558',
                color: 'white',
                borderRadius: '12px',
                padding: '4px',
                width: '40px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }
            }
          }}
        >
          <BottomNavigationAction 
            label="Home" 
            icon={<Box className={value === 0 ? "indicator" : ""}>{<HomeIcon />}</Box>} 
          />
          <BottomNavigationAction 
            label="Wallet" 
            icon={<Box className={value === 1 ? "indicator" : ""}>{<AccountBalanceWalletIcon />}</Box>} 
          />
          <BottomNavigationAction 
            label="Chat" 
            icon={<Box className={value === 2 ? "indicator" : ""}>{<HistoryIcon />}</Box>} 
          />
          <BottomNavigationAction 
            label="Profile" 
            icon={<Box className={value === 3 ? "indicator" : ""}>{<PersonIcon />}</Box>} 
          />
        </BottomNavigation>
      </Paper>
      {/* Spacer to prevent content from being hidden behind nav */}
      <Box sx={{ height: 64 }} />
    </Box>
  );
};

export default MobileBottomNav;
