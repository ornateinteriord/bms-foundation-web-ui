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
  Avatar,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HubIcon from '@mui/icons-material/Hub';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import BuildIcon from '@mui/icons-material/Build';
import TvIcon from '@mui/icons-material/Tv';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SpeedIcon from '@mui/icons-material/Speed';

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
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails, isLoading: isMemberLoading } = useGetMemberDetails(memberId);
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");
  const { data: dailyPayout } = useGetDailyPayout(memberId);

  const dailyROIValue = Number(dailyPayout?.[0]?.ew_credit || 0);
  const adjustedDeposit = dailyROIValue * 150;

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

  const servicesGrid = [
    { label: "SB Account", icon: <AccountBalanceWalletIcon />, color: "#3b82f6" },
    { label: "RD Account", icon: <SavingsIcon />, color: "#10b981" },
    { label: "OD Account", icon: <PriceChangeIcon />, color: "#f59e0b" },
    { label: "BMS CREDIT", icon: <CreditCardIcon />, color: "#6366f1" },
    { label: "GOLD LOAN", icon: <MonetizationOnIcon />, color: "#10b981" },
    { label: "Group LOAN", icon: <GroupsIcon />, color: "#3b82f6" },
    { label: "RD LOAN", icon: <CurrencyRupeeIcon />, color: "#ef4444" },
    { label: "OD LOAN", icon: <CurrencyRupeeIcon />, color: "#6366f1" },
    { label: "BMS PROTECT", icon: <HealthAndSafetyIcon />, color: "#10b981" },
    { label: "E Shopy Product", icon: <ShoppingCartIcon />, color: "#f59e0b" },
    { label: "Hurb Product", icon: <StoreIcon />, color: "#3b82f6" },
    { label: "TV", icon: <TvIcon />, color: "#ef4444" },
    { label: "Shoping", icon: <ShoppingCartIcon />, color: "#3b82f6" },
    { label: "Gold Saving", icon: <SavingsIcon />, color: "#f59e0b" },
    { label: "Pigmy Saving", icon: <SavingsIcon />, color: "#10b981" },
    { label: "Pigmy Loan", icon: <CurrencyRupeeIcon />, color: "#ef4444" },
    { label: "HOPETAXI", icon: <LocalTaxiIcon />, color: "#f59e0b" },
    { label: "SERVICE", icon: <BuildIcon />, color: "#3b82f6" },
  ];

  const quickAccessGroups = [
    {
      title: "ACCOUNT",
      items: [
        { label: "Profile", icon: <AccountCircleIcon />, route: "/user/account/profile", color: "#3b82f6" },
        { label: "KYC", icon: <VerifiedUserIcon />, route: "/user/account/kyc", color: "#10b981" },
        { label: "Passbook", icon: <ReceiptLongIcon />, route: "/user/transactions", color: "#f59e0b" },
        { label: "Add Deposit", icon: <InventoryIcon />, route: "/user/addon-packages", color: "#6366f1" },
      ]
    },
    {
      title: "BMS BENEFITS",
      items: [
        { label: "ROI Benefits", icon: <ShowChartIcon />, route: "/user/earnings/roi-benefits", color: "#10b981" },
        { label: "Daily ROI", icon: <TrendingUpIcon />, route: "/user/earnings/daily-payout", color: "#ef4444" },
        { label: "Level Benefits", icon: <AccountTreeIcon />, route: "/user/earnings/level-benefits", color: "#3b82f6" },
        { label: "Transactions", icon: <ReceiptLongIcon />, route: "/user/transactions", color: "#3b82f6" },
      ]
    },
    {
      title: "TEAM & TOOLS",
      items: [
        { label: "My Team", icon: <GroupsIcon />, route: "/user/team", color: "#3b82f6" },
        { label: "My Directs", icon: <PersonAddAltIcon />, route: "/user/team/direct", color: "#6366f1" },
        { label: "Tree View", icon: <HubIcon />, route: "/user/team/tree", color: "#ef4444" },
        { label: "New Regi.", icon: <PersonAddAltIcon />, route: "/user/team/new-register", color: "#10b981" },
      ]
    }
  ];

  const Header = () => (
    <Box sx={{
      position: 'relative',
      mb: 2,
      background: 'linear-gradient(135deg, #0a2558 0%, #1e3a8a 100%)',
      p: { xs: 2, md: 3 },
      borderRadius: '24px',
      color: 'white',
      boxShadow: '0 10px 40px rgba(10, 37, 88, 0.2)',
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar
          sx={{
            width: { xs: 70, md: 90 },
            height: { xs: 70, md: 90 },
            bgcolor: 'rgba(255,255,255,0.15)',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          {memberDetails?.Member_Name?.[0] || <AccountCircleIcon sx={{ fontSize: 40 }} />}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px', mb: 0.5 }}>
            {memberDetails?.Member_Name || (isMemberLoading ? "..." : "")}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
            <VerifiedUserIcon sx={{ fontSize: 18, color: '#10b981' }} />
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              ID: {memberDetails?.Member_id || memberId || ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
        <Button
          variant="contained"
          size="small"
          fullWidth={window.innerWidth < 900}
          startIcon={<NoteAddIcon sx={{ fontSize: '1rem !important' }} />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 900,
            bgcolor: 'white',
            color: '#0a2558',
            px: 1.7,
            py: 0.7,
            fontSize: '12.2px',
            '&:hover': { bgcolor: '#f1f5f9' },
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          FD BOND
        </Button>
        <Button
          variant="contained"
          size="small"
          fullWidth={window.innerWidth < 900}
          onClick={() => setShowQuickAccess(!showQuickAccess)}
          startIcon={showQuickAccess ? <ArrowBackIcon sx={{ fontSize: '1rem !important' }} /> : <SpeedIcon sx={{ fontSize: '1rem !important' }} />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 900,
            bgcolor: '#3b82f6',
            px: 1.7,
            py: 0.5,
            fontSize: '12.2px',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          {showQuickAccess ? 'BACK' : 'QUICK ACCESS'}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ pb: 10, background: '#f4f7f9', minHeight: '100vh', px: { xs: 2, md: 8, lg: 16 }, pt: 3 }}>
      {isVerifyingPayment && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>Verifying payment...</Typography>
        </Box>
      )}

      <Header />

      {!showQuickAccess ? (
        /* Page 1: Main View */
        <Box>
          <Box
            onClick={() => navigate('/user/chat')}
            sx={{
              width: '100%',
              height: { xs: '90px', md: '120px' },
              mb: 2,
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:active': { transform: 'scale(0.98)' }
            }}
          >
            <img src="/cb.png" alt="BMS Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: { xs: 2, md: 4 } }}>
            {servicesGrid.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                <Paper elevation={0} sx={{
                  width: { xs: 50, md: 70 },
                  height: { xs: 50, md: 70 },
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'white',
                  color: item.color,
                  boxShadow: `0 4px 15px ${item.color}15`,
                  '&:active': { transform: 'scale(0.95)' },
                  transition: '0.2s'
                }}>
                  {item.icon}
                </Paper>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.65rem', textAlign: 'center', color: '#1e293b', lineHeight: 1.1 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        /* Page 2: Quick Access View */
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            {quickAccessGroups.map((group, idx) => (
              <Box key={idx} sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', mb: 2, letterSpacing: '1px' }}>
                  {group.title}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
                  {group.items.map((item, i) => (
                    <Box key={i} onClick={() => navigate(item.route)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
                      <Box sx={{ width: 54, height: 54, borderRadius: '16px', bgcolor: 'white', color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        {item.icon}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', textAlign: 'center', color: '#1e293b' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            <Box sx={{ mt: 5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', mb: 2 }}>TEAM PERFORMANCE</Typography>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Total Team</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0a2558' }}>{memberDetails?.total_team || 0}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Directs</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0a2558' }}>{memberDetails?.direct_referrals?.length || 0}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', xl: '420px' }, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper elevation={0} sx={{
              p: 4,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.25)'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>Referral link</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  fullWidth
                  sx={{
                    bgcolor: 'white',
                    color: '#1e3a8a',
                    borderRadius: '16px',
                    textTransform: 'none',
                    fontWeight: 900,
                    py: 1.5
                  }}
                >
                  Share Now
                </Button>
                <IconButton
                  onClick={handleCopyReferralLink}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '16px',
                    width: 56,
                    height: 56
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Paper>

            {/* Wallet Section - Matched to 3rd Drawing */}
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0a2558', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', mb: -2 }}>
              Deposit-BOND
            </Typography>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
              <Stack spacing={4}>
                {/* 1st Section: Deposits */}
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontWeight: 800, color: '#475569' }}>MY Deposit</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>₹{adjustedDeposit.toLocaleString('en-IN')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 800, color: '#475569' }}>Total Withdrawal</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#ef4444' }}>₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-IN')}</Typography>
                  </Box>
                </Box>

                {/* 2nd Section: Wallet Summary breakdown */}
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f1f5f9', position: 'relative' }}>
                  <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 20, bgcolor: 'white', px: 1.5, py: 0.2, borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 900, color: '#0a2558', fontSize: '0.65rem' }}>
                    WALLET SUMMARY
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b' }}>BMS - Wallet</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#3b82f6' }}>₹{Number(walletOverview?.balance || 0).toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b' }}>BMS Level Benefits</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#10b981' }}>₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b' }}>BMS - Daily</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#f59e0b' }}>₹{dailyROIValue.toLocaleString('en-IN')}</Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* 3rd Section: Big Balance */}
                <Box sx={{ textAlign: 'center', pt: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#64748b', letterSpacing: '1px', mb: 1 }}>
                    WALLET BALANCE
                  </Typography>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, p: 2, px: 4, bgcolor: '#0a2558', borderRadius: '20px', color: 'white' }}>
                    <CurrencyRupeeIcon sx={{ fontSize: 28 }} />
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {Number(walletOverview?.balance || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserDashboard;
