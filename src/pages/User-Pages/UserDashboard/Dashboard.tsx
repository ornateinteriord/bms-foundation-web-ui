import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Avatar,
  IconButton,
  Paper,
  alpha
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import InventoryIcon from '@mui/icons-material/Inventory';

import TokenService from '../../../api/token/tokenService';
import {
  useVerifyPayment,
  parsePaymentRedirectParams,
  useGetTransactionDetails,
  useGetWalletOverview,
  useGetMemberDetails
} from '../../../api/Memeber';
import { toast } from 'react-toastify';

// Modern Circular Menu Item Component
const CircularMenuItem = ({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:active': { transform: 'scale(0.95)' }
    }}
  >
    <Box sx={{
      width: 52,
      height: 52,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: alpha(color, 0.1),
      color: color,
      boxShadow: `0 4px 12px ${alpha(color, 0.15)}`,
      border: `1px solid ${alpha(color, 0.1)}`
    }}>
      {icon}
    </Box>
    <Typography variant="caption" sx={{
      fontWeight: 600,
      color: '#444',
      textAlign: 'center',
      fontSize: '0.7rem',
      lineHeight: 1.1,
      maxWidth: '64px'
    }}>
      {label}
    </Typography>
  </Box>
);

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails } = useGetMemberDetails(memberId);

  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");

  useEffect(() => {
    const paymentParams = parsePaymentRedirectParams(searchParams);
    if (paymentParams.order_id && paymentParams.payment_status && !paymentProcessed) {
      setPaymentProcessed(true);
      verifyPayment(paymentParams.order_id, {
        onSuccess: () => {
          setSearchParams({});
          refetchTransactions();
          refetchMemberDetails();
        },
        onError: () => setSearchParams({})
      });
    }
  }, [searchParams, paymentProcessed, verifyPayment, setSearchParams, refetchTransactions, refetchMemberDetails]);

  const handleCopyReferralLink = () => {
    if (!memberDetails?.Member_id) return;
    const referralLink = `${window.location.origin}/register?ref=${memberDetails.Member_id}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => toast.success('Referral link copied!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleShareReferralLink = () => {
    if (!memberDetails?.Member_id) return;
    const referralLink = `${window.location.origin}/register?ref=${memberDetails.Member_id}`;
    if (navigator.share) {
      navigator.share({ title: 'Join me!', text: 'Check out this platform!', url: referralLink })
        .catch(console.error);
    } else {
      handleCopyReferralLink();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <Box sx={{
      pb: { xs: 12, md: 4 },
      background: '#f8f9fa',
      minHeight: '100vh',
      width: '100%',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Payment Overlay */}
      {isVerifyingPayment && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <CircularProgress size={60} sx={{ color: '#fff', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#fff' }}>Verifying your payment...</Typography>
        </Box>
      )}

      {/* Header Bar - Full Width within container */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        background: '#5f259f', // PhonePe Purple
        color: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            bgcolor: '#fff',
            color: '#5f259f',
            fontWeight: 800,
            width: 38,
            height: 38,
            fontSize: '0.9rem',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {getInitials(memberDetails?.Full_name)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '0.9rem' }}>
              {memberDetails?.Full_name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
              ID: {memberDetails?.Member_id || '—'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: '#fff' }}><QrCodeScannerIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ color: '#fff' }}><NotificationsNoneIcon fontSize="small" /></IconButton>
          <IconButton size="small" sx={{ color: '#fff' }}><HelpOutlineIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ px: { xs: 0, md: 2 } }}>

        {/* LEFT COLUMN: Main Actions & Services */}
        <Grid item xs={12} md={7} lg={8}>

          {/* CB PHOTO BANNER */}
          <Box sx={{ px: { xs: 2, md: 0 }, mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Box
              onClick={() => navigate('/user/chat')}
              component="img"
              src="/cb.png"
              sx={{
                width: { xs: '100%', sm: '75%', md: '60%' },
                maxWidth: '500px',
                maxHeight: { xs: '140px', md: '160px' },
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.07)',
                display: 'block',
                '&:hover': { 
                  transform: 'scale(1.015) translateY(-3px)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
                },
                '&:active': { transform: 'scale(0.98)' }
              }}
            />
          </Box>

          {/* Quick Access Menu Grid */}
          <Box sx={{ mt: 1, px: { xs: 2, md: 0 } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 3, color: '#333', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#5f259f', borderRadius: 2 }} />
              QUICK ACCESS
            </Typography>

            <Grid container spacing={2} sx={{ mb: 5 }}>
              {[
                { icon: <AccountCircleIcon />, label: "Profile", path: "/user/account/profile", color: "#3b82f6" },
                { icon: <VerifiedUserIcon />, label: "KYC", path: "/user/account/kyc", color: "#10b981" },
                { icon: <LockIcon />, label: "Password", path: "/user/account/change-password", color: "#f59e0b" },
                { icon: <InventoryIcon />, label: "Add Deposit", path: "/user/addon-packages", color: "#8b5cf6" },
                { icon: <ShowChartIcon />, label: "ROI Benefits", path: "/user/earnings/roi-benefits", color: "#84cc16" },
                { icon: <PaymentsIcon />, label: "Daily ROI", path: "/user/earnings/daily-payout", color: "#f43f5e" },
                { icon: <TrendingUpIcon />, label: "Level Benefits", path: "/user/earnings/level-benefits", color: "#0ea5e9" },
                { icon: <AccountBalanceWalletIcon />, label: "Transactions", path: "/user/transactions", color: "#6366f1" },
                { icon: <GroupIcon />, label: "My Team", path: "/user/team", color: "#4f46e5" },
                { icon: <PeopleIcon />, label: "My Directs", path: "/user/team/direct", color: "#d946ef" },
                { icon: <AccountTreeIcon />, label: "Tree View", path: "/user/team/tree", color: "#ec4899" },
                { icon: <PersonAddIcon />, label: "New Register", path: "/user/team/new-register", color: "#14b8a6" }
              ].map((item, idx) => (
                <Grid item xs={3} sm={2.4} key={idx}>
                  <CircularMenuItem
                    icon={item.icon}
                    label={item.label}
                    onClick={() => navigate(item.path)}
                    color={item.color}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Referral Banner */}
            <Box sx={{ mb: 4 }}>
              <Paper elevation={0} sx={{
                p: { xs: 3, md: 4 },
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 12px 30px rgba(30, 58, 138, 0.2)'
              }}>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Referral link</Typography>
                {/* <Typography variant="body2" sx={{ opacity: 0.85, mb: 3, maxWidth: '80%', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Grow your network and earn exclusive rewards by sharing your unique link.
                </Typography> */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleShareReferralLink}
                    startIcon={<ShareIcon />}
                    sx={{
                      bgcolor: '#fff',
                      color: '#1e3a8a',
                      fontWeight: 900,
                      px: 4,
                      borderRadius: '14px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#f0f0f0' }
                    }}
                  >
                    Share Now
                  </Button>
                  <IconButton
                    onClick={handleCopyReferralLink}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      borderRadius: '14px',
                      width: 54,
                      height: 54,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                    }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Box>
                <Box sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 150,
                  height: 150,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }} />
              </Paper>
            </Box>
          </Box>
        </Grid>

        {/* RIGHT COLUMN: Stats & Wallet Details */}
        <Grid item xs={12} md={5} lg={4}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 80 }, mb: 4, px: { xs: 2, md: 0 } }}>

            {/* Stats Summary Card */}
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2.5, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#2563eb', borderRadius: 2 }} />
              TEAM PERFORMANCE
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #f0f0f0', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 700, mb: 0.5, display: 'block' }}>Total Team</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#111' }}>{memberDetails?.total_team || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', bgcolor: '#fff', border: '1px solid #f0f0f0', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <Typography variant="caption" sx={{ color: '#666', fontWeight: 700, mb: 0.5, display: 'block' }}>My Directs</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#111' }}>{memberDetails?.direct_referrals?.length || 0}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Wallet Details List */}
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 2.5, color: '#333', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#10b981', borderRadius: 2 }} />
              WALLET SUMMARY
            </Typography>
            <Paper elevation={0} sx={{
              borderRadius: '24px',
              bgcolor: '#fff',
              border: '1px solid #f0f0f0',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
            }}>
              {[
                { label: 'MY DEPOSIT', value: Number(walletOverview?.roiBenefits || 0) * 150, color: '#3b82f6', path: '/user/transactions' },
                { label: 'MY BONUS', value: Number(walletOverview?.roiBenefits || 0) * 150, color: '#10b981', path: '/user/earnings/level-benefits' },
                { label: 'MY WITHDRAWAL', value: walletOverview?.totalWithdrawal || '0.00', color: '#ef4444', path: '/user/wallet' },
                { label: 'MY LEVEL BENEFITS', value: walletOverview?.levelBenefits || '0.00', color: '#8b5cf6', path: '/user/earnings/level-benefits' },
                { label: 'DAILY ROI', value: walletOverview?.roiBenefits || '0.00', color: '#f59e0b', path: '/user/earnings/daily-payout' },
                { label: 'ROI BENEFITS', value: walletOverview?.roiLevelBenefits || '0.00', color: '#ec4899', path: '/user/earnings/roi-benefits' },
                { label: 'WALLET BALANCE', value: walletOverview?.balance || '0.00', color: '#5f259f', path: '/user/wallet' },
              ].map((item, index) => (
                <Box
                  key={index}
                  onClick={() => navigate(item.path)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2.5,
                    cursor: 'pointer',
                    borderBottom: index !== 5 ? '1px solid #f8f9fa' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': { bgcolor: '#fbfbff', pl: 3 },
                    '&:active': { bgcolor: '#f0f0ff' }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#555', fontSize: '0.8rem', letterSpacing: 0.5 }}>
                    {item.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" sx={{ fontWeight: 900, color: item.color }}>
                        ₹{Number(item.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                      {(item.label === 'MY DEPOSIT' || item.label === 'MY BONUS') && (
                        <Typography variant="caption" sx={{ color: '#999', fontSize: '0.6rem', display: 'block', fontWeight: 700 }}>
                          (Total ROI × 150)
                        </Typography>
                      )}
                    </Box>
                    <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#ccc' }} />
                  </Box>
                </Box>
              ))}
            </Paper>

            {/* Help Section */}
            <Box sx={{ mt: 3, p: 2, borderRadius: '16px', bgcolor: alpha('#5f259f', 0.05), border: `1px dashed ${alpha('#5f259f', 0.2)}` }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <SupportAgentIcon sx={{ color: '#5f259f' }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#5f259f', display: 'block' }}>Need Support?</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#666' }}>We're here to help you 24/7.</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard;
