import { Box, Paper, BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!isMobile) return null;

  // Determine the active tab based on the current path
  const getValue = () => {
    const path = location.pathname;
    if (path.includes('/user/dashboard')) return 0;
    if (path.includes('/user/wallet')) return 1;
    if (path.includes('/user/chat')) return 2;
    if (path.includes('/user/account/profile')) return 3;
    return 0; // Default to Dashboard if no match
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000,
      display: { xs: 'block', md: 'none' }
    }}>
      <Paper elevation={10} sx={{ borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
        <BottomNavigation
          showLabels
          value={getValue()}
          sx={{ 
            height: 70, 
            background: '#fff',
            '& .Mui-selected': {
              color: '#5f259f !important',
              '& .MuiSvgIcon-root': {
                transform: 'scale(1.2)',
                transition: 'transform 0.2s',
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.7rem',
              fontWeight: 700,
              mt: 0.5
            }
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<DashboardIcon />}
            onClick={() => navigate('/user/dashboard')}
          />
          <BottomNavigationAction
            label="Wallet"
            icon={<AccountBalanceWalletIcon />}
            onClick={() => navigate('/user/wallet')}
          />
          <BottomNavigationAction
            label="Chat"
            icon={<ChatIcon />}
            onClick={() => navigate('/user/chat')}
          />
          <BottomNavigationAction
            label="Profile"
            icon={<PersonIcon />}
            onClick={() => navigate('/user/account/profile')}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileBottomNav;
