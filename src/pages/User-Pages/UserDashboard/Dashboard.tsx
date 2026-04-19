// components/UserDashboard.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Button,
  Stack,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HubIcon from '@mui/icons-material/Hub';

import TokenService from '../../../api/token/tokenService';
import {
  useVerifyPayment,
  parsePaymentRedirectParams,
  useGetTransactionDetails,
  useGetWalletOverview,
  useGetMemberDetails,
  useGetDailyPayout
} from '../../../api/Memeber';
import { toast } from 'react-toastify';



const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails } = useGetMemberDetails(memberId);

  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");
  const { data: dailyPayout } = useGetDailyPayout(memberId);

  // Custom calculations requested by user
  const latestDailyROI = Number(dailyPayout?.[0]?.ew_credit || 0);
  const dailyROIValue = latestDailyROI;
  const adjustedDeposit = dailyROIValue * 150;
  const totalIncome = Number(walletOverview?.totalIncome || 0);
  const adjustedBonus = totalIncome + adjustedDeposit;

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

  const menuSections = [
    {
      title: "QUICK ACCESS",
      items: [
        { label: "Profile", icon: <AccountCircleIcon />, route: "/user/account/profile", color: "#3b82f6" },
        { label: "KYC", icon: <VerifiedUserIcon />, route: "/user/account/kyc", color: "#10b981" },
        { label: "Password", icon: <VpnKeyIcon />, route: "/user/account/change-password", color: "#f59e0b" },
        { label: "Add Deposit", icon: <InventoryIcon />, route: "/user/addon-packages", color: "#6366f1" },
        { label: "ROI Benefits", icon: <ShowChartIcon />, route: "/user/earnings/roi-benefits", color: "#10b981" },
        { label: "Daily ROI", icon: <TrendingUpIcon />, route: "/user/earnings/daily-payout", color: "#ef4444" },
        { label: "Level Benefits", icon: <AccountTreeIcon />, route: "/user/earnings/level-benefits", color: "#3b82f6" },
        { label: "Transactions", icon: <ReceiptLongIcon />, route: "/user/transactions", color: "#3b82f6" },
        { label: "My Team", icon: <GroupsIcon />, route: "/user/team", color: "#3b82f6" },
        { label: "My Directs", icon: <PersonAddAltIcon />, route: "/user/team/direct", color: "#6366f1" },
        { label: "Tree View", icon: <HubIcon />, route: "/user/team/tree", color: "#ef4444" },
        { label: "New Register", icon: <PersonAddAltIcon />, route: "/user/team/new-register", color: "#10b981" },
      ]
    }
  ];

  return (
    <Box sx={{ pb: 10, background: '#f8fafc', minHeight: '100vh' }}>
      {/* Verification Overlay */}
      {isVerifyingPayment && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>Verifying payment...</Typography>
        </Box>
      )}

      {/* Main Content below Navbar */}
      <Box sx={{ 
        px: { xs: 2, md: 8, lg: 16 }, 
        mt: 4, 
        maxWidth: '1800px', 
        mx: 'auto' 
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 0, md: 4 },
          alignItems: 'flex-start'
        }}>
          {/* Left Column: Banner, Menu, Team */}
          <Box sx={{ flex: 1, width: '100%' }}>
            <Box
              sx={{
                width: '100%',
                height: { xs: '120px', md: '160px' },
                mb: 4,
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
                cursor: 'pointer',
                position: 'relative',
                '&:hover img': { transform: 'scale(1.05)' }
              }}
              onClick={() => navigate('/user/chat')}
            >
            {/* Custom Banner Image */}
              <img
                src="/cb.png"
                alt="BMS Banner"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
              />
            </Box>

            {/* Menu Grid - Matched to QUICK ACCESS style */}
            {menuSections.map((section, idx) => (
              <Box key={idx} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <Box sx={{ width: 4, height: 18, bgcolor: '#0a2558', borderRadius: '2px' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                    {section.title}
                  </Typography>
                </Box>

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(5, 1fr)', lg: 'repeat(6, 1fr)' },
                  gap: { xs: 2.5, md: 3.5 },
                  px: 0.5
                }}>
                  {section.items.map((item, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate(item.route)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.2,
                        cursor: 'pointer',
                        '&:active': { transform: 'scale(0.95)' },
                        transition: 'transform 0.1s'
                      }}
                    >
                      <Box sx={{
                        width: { xs: 54, md: 64 },
                        height: { xs: 54, md: 64 },
                        borderRadius: '16px', // Modern squircle
                        bgcolor: 'white',
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 25px ${item.color}20`,
                        border: `1px solid ${item.color}10`,
                        position: 'relative',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 12px 30px ${item.color}30`,
                        }
                      }}>
                        {item.icon}
                      </Box>
                      <Typography variant="caption" sx={{ 
                        fontWeight: 900, 
                        fontSize: { xs: '0.7rem', md: '0.8rem' }, 
                        textAlign: 'center', 
                        color: '#1e293b', // Darker text
                        lineHeight: 1.2,
                        mt: 0.5
                      }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            {/* TEAM PERFORMANCE Section */}
            <Box sx={{ mt: 5, mb: { xs: 4, md: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                <Box sx={{ width: 4, height: 18, bgcolor: '#3b82f6', borderRadius: '2px' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', letterSpacing: '0.5px', fontSize: '0.85rem' }}>
                  TEAM PERFORMANCE
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem' }}>Total Team</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0a2558', mt: 0.5 }}>
                      {memberDetails?.total_team || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.75rem' }}>Directs</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0a2558', mt: 0.5 }}>
                      {memberDetails?.direct_referrals?.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Right Column: Referral and Wallet Summary */}
          <Box sx={{ 
            width: { xs: '100%', md: '380px' }, 
            position: { md: 'sticky' }, 
            top: { md: '80px' },
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}>
            {/* Referral Card - Top Right */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1, letterSpacing: '0.5px' }}>Referral link</Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  fullWidth
                  sx={{
                    bgcolor: 'white',
                    color: '#1e3a8a',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 900,
                    py: 1.2,
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  Share Now
                </Button>
                <IconButton
                  onClick={handleCopyReferralLink}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    borderRadius: '12px',
                    width: 48,
                    height: 48
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Paper>

            {/* WALLET SUMMARY Section - Below Referral */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <Box sx={{ width: 4, height: 18, bgcolor: '#10b981', borderRadius: '2px' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '1px', fontSize: '0.9rem' }}>
                  WALLET SUMMARY
                </Typography>
              </Box>

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: '24px', 
                  bgcolor: 'white', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  overflow: 'hidden'
                }}
              >
                <Stack spacing={2.2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>MY DEPOSIT</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#3b82f6' }}>₹{adjustedDeposit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>MY BONUS</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#10b981' }}>₹{adjustedBonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>MY WITHDRAWAL</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#ef4444' }}>₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>MY LEVEL BENEFITS</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#6366f1' }}>₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>MY ROI BENEFITS</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#10b981' }}>₹{Number(walletOverview?.roiBenefits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>DAILY ROI</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#f59e0b' }}>₹{dailyROIValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#0a2558', fontSize: '0.85rem' }}>WALLET BALANCE</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#0a2558', fontSize: '1.1rem' }}>₹{Number(walletOverview?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                </Stack>
              </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
  );
};

export default UserDashboard;
