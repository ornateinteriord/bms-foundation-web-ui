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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
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
import LockIcon from '@mui/icons-material/Lock';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import TokenService from '../../../api/token/tokenService';
import {
  useVerifyPayment,
  useGetTransactionDetails,
  useGetWalletOverview,
  useGetMemberDetails,
  useGetDailyPayout
} from '../../../api/Memeber';
import { toast } from 'react-toastify';
import React from 'react';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const showQuickAccess = searchParams.get('view') === 'od';

  const setShowQuickAccess = (show: boolean) => {
    if (show) {
      setSearchParams({ view: 'od' });
    } else {
      setSearchParams({});
    }
  };

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails, isLoading: isMemberLoading } = useGetMemberDetails(memberId);
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");
  useGetDailyPayout(memberId);

  const totalPrincipal = Number(walletOverview?.totalPackages || 0);
  const totalRoiPaidValue = Number(walletOverview?.roiBenefits || 0);
  const roiLevelBenefits = Number(walletOverview?.roiLevelBenefits || 0);

  // Wallet starts at Total Principal and decreases as ROI is paid.
  const displayWallet = Math.max(0, totalPrincipal - totalRoiPaidValue);

  // Once ROI exceeds Total Principal, the Deposit itself starts to "decrease" visually.
  const extraROI = Math.max(0, totalRoiPaidValue - totalPrincipal);
  const displayDeposit = Math.max(0, totalPrincipal - extraROI);

  const isUserActive = memberDetails?.status === 'active';
  const isPackageActive = memberDetails?.upgrade_status === 'Active';

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const orderStatus = searchParams.get('order_status');

    if (orderId && orderStatus && !paymentProcessed) {
      setPaymentProcessed(true);
      
      let normalizedStatus = (orderStatus || '').toUpperCase();
      // Handle case where Cashfree didn't replace the placeholder
      if (normalizedStatus === '{ORDER_STATUS}') {
        normalizedStatus = 'PENDING';
      }
      console.log("💳 Dashboard Payment Redirect Status:", normalizedStatus);

      if (['PAID', 'SUCCESS', 'PENDING', 'ACTIVE'].includes(normalizedStatus)) {
        toast.info("Verifying payment status...");
        verifyPayment(orderId, {
          onSuccess: (data: any) => {
            const status = data?.payment_status || data?.status;
            if (status === 'PAID' || status === 'SUCCESS' || status === 'Completed') {
              toast.success("Payment successful!");
              refetchTransactions();
              refetchMemberDetails();
            } else {
              toast.info(`Payment status: ${status}`);
            }
            setSearchParams({});
          },
          onError: (error: any) => {
            console.error("❌ Verification error:", error);
            toast.error("Payment verification failed.");
            setSearchParams({});
          }
        });
      } else if (normalizedStatus === 'CANCELLED') {
        toast.warning("Payment was cancelled.");
        setSearchParams({});
      } else {
        toast.error(`Payment ${orderStatus}. Please try again.`);
        setSearchParams({});
      }
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
    { label: "SB Account", icon: <AccountBalanceWalletIcon />, color: "#3b82f6", type: "sb" },
    { label: "RD Account", icon: <AutorenewIcon />, color: "#10b981", type: "rd" },
    { label: "FD Account", icon: <NoteAddIcon />, color: "#f59e0b", type: "fd" },
    { label: "CA Account", icon: <AccountBalanceIcon />, color: "#6366f1", type: "ca" },
    { label: "Pigmy Account", icon: <SavingsIcon />, color: "#10b981", type: "pigmy" },
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
        { label: "Password", icon: <LockIcon />, route: "/user/account/change-password", color: "#f59e0b" },
        ...(isPackageActive ? [{ label: "Add Deposit", icon: <InventoryIcon />, route: "/user/addon-packages?view=addon", color: "#3b82f6" }] : []),
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
      mb: 2,
      mt: { xs: 2, md: 3 },
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', // Indigo/Purple deep gradient
      p: { xs: 2.5, md: 4 },
      borderRadius: '24px',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      '&::before': { // Decorative glowing orb
        content: '""',
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%',
        zIndex: 0,
        pointerEvents: 'none',
      }
    }}>
      {/* Row 1: Avatar + (Name/ID/Wallet Column) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 3, position: 'relative', zIndex: 1 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: { xs: 70, md: 90 },
            height: { xs: 70, md: 90 },
            borderRadius: '18px',
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            flexShrink: 0,
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }
          }}
          src={memberDetails?.profile_image || ""}
        >
          {!memberDetails?.profile_image && (memberDetails?.Name?.[0] || <AccountCircleIcon sx={{ fontSize: 40 }} />)}
        </Avatar>

        {/* Name + ID + Wallet Info Column */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.3px', lineHeight: 1.2, fontSize: { xs: '1.3rem', md: '1.7rem' }, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {memberDetails?.Name || (isMemberLoading ? '...' : '')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, opacity: 0.9 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(16, 185, 129, 0.2)', borderRadius: '6px', p: 0.3 }}>
               <VerifiedUserIcon sx={{ fontSize: 14, color: '#34d399' }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '1px', color: '#cbd5e1' }}>
              ID: {memberDetails?.Member_id || memberId || ''}
            </Typography>
          </Box>

          {/* Wallet Badge */}
          {isPackageActive && isUserActive && (
            <Box
              onClick={() => navigate('/user/wallet')}
              sx={{
                display: 'inline-flex',
                width: 'fit-content',
                alignItems: 'center',
                gap: 1,
                mt: 1,
                bgcolor: 'rgba(0, 0, 0, 0.2)',
                px: 2,
                py: 0.8,
                borderRadius: '12px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.3)', transform: 'translateY(-2px)', borderColor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 18, color: '#fbbf24' }} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', color: '#fef3c7' }}>
                ₹{Number(walletOverview?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Row 2: Buttons */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', position: 'relative', zIndex: 1 }}>
        {/* FD BOND */}
        {isUserActive && (
          <Button
            variant="contained"
            onClick={() => navigate('/user/addon-packages?view=fd')}
            startIcon={<NoteAddIcon sx={{ fontSize: '1.2rem !important' }} />}
            sx={{
              flex: 1,
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 800,
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#e2e8f0',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              py: 1.2,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minWidth: 0,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' },
              boxShadow: 'none'
            }}
          >
            FD BOND
          </Button>
        )}

        {/* OVER DRAFT */}
        {isUserActive && isPackageActive && (
          <Button
            variant="contained"
            onClick={() => {
              if (isPackageActive) {
                setShowQuickAccess(!showQuickAccess);
              } else {
                navigate('/user/overdraft');
              }
            }}
            startIcon={(isPackageActive && showQuickAccess) ? <ArrowBackIcon sx={{ fontSize: '1.3rem !important' }} /> : <SpeedIcon sx={{ fontSize: '1.3rem !important' }} />}
            sx={{
              flex: 1,
              borderRadius: '16px',
              textTransform: 'none',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              py: 1.2,
              minWidth: 0,
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 15px rgba(234, 88, 12, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #fcd34d 0%, #f97316 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 20px rgba(234, 88, 12, 0.4)',
              }
            }}
          >
            {(isPackageActive && showQuickAccess) ? 'BACK' : 'OVER DRAFT'}
          </Button>
        )}
      </Box>
    </Box>
  );

  const handleAccountClick = (item: any) => {
    if (['SB Account', 'RD Account', 'FD Account', 'CA Account', 'Pigmy Account'].includes(item.label)) {
      navigate(`/user/account-opening/${item.type}`);
    }
  };

  return (
    <Box sx={{
      pb: 6,
      background: '#0f172a',
      minHeight: '100vh',
      px: { xs: 2.5, md: 5, lg: 10, xl: 16 },
      pt: { xs: 1.5, md: 4 }, // Reduced top gap for mobile, more balanced for desktop
      maxWidth: '1800px',
      margin: '0 auto'
    }}>
      {isVerifyingPayment && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>Verifying payment...</Typography>
        </Box>
      )}

      <Header />

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 4, md: 5 },
        alignItems: 'flex-start'
      }}>
        {/* Left Column (Main/Services) */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: { xs: showQuickAccess ? 'none' : 'block', md: 'block' }
        }}>
          {/* CB Banner - Desktop only (mobile version is inside the header) */}
          <Box
            onClick={() => navigate('/user/chat')}
            sx={{
              display: { xs: 'none', md: 'block' },
              width: '100%',
              height: '160px',
              mb: 4,
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(23, 16, 16, 0.12)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 45px rgba(0,0,0,0.18)' },

            }}
          >
            <img src="/cb.png" alt="BMS Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>

          {/* Quick Services Grid */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', letterSpacing: '0.5px' }}>
                QUICK SERVICES
              </Typography>
              <Box
                onClick={() => navigate('/user/chat')}
                sx={{
                  cursor: 'pointer',
                  width: 90,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '14px',
                  bgcolor: '#1e293b',
                  border: '1px solid rgba(249, 115, 22, 0.2)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  transition: 'all 0.25s',
                  '&:hover': { transform: 'scale(1.08)', boxShadow: '0 8px 24px rgba(249, 115, 22, 0.15)' },
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                <img src="/cb.png" alt="BMS Chat" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.4)' }} />
              </Box>
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(4, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' },
              gap: { xs: 2, md: 4 }
            }}>
              {servicesGrid.map((item, i) => (
                <Box 
                  key={i} 
                  onClick={() => handleAccountClick(item)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                >
                  <Paper elevation={0} sx={{
                    width: { xs: 54, md: 74 },
                    height: { xs: 54, md: 74 },
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#1e293b',
                    color: item.color,
                    boxShadow: `0 6px 20px ${item.color}15`,
                    border: '1px solid rgba(255,255,255,0.05)',
                    '&:hover': { transform: 'translateY(-5px) scale(1.05)', boxShadow: `0 10px 30px ${item.color}40`, borderColor: item.color },
                    transition: 'all 0.3s'
                  }}>
                    {React.cloneElement(item.icon as React.ReactElement, { sx: { fontSize: { xs: 24, md: 32 } } })}
                  </Paper>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', textAlign: 'center', color: '#cbd5e1', lineHeight: 1.2 }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Team Performance - In Left Column on Desktop */}
          <Box sx={{ mt: 6, display: { xs: 'none', md: 'block' } }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', mb: 3 }}>TEAM PERFORMANCE</Typography>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '28px', bgcolor: '#1e293b', border: '1px solid #334155', boxShadow: 'none' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Team</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#f8fafc', mt: 1 }}>{memberDetails?.total_team || 0}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', borderLeft: '1px solid #334155' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Directs</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#f8fafc', mt: 1 }}>{memberDetails?.direct_referrals?.length || 0}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
        {/* Right Column / Mobile Conditional View */}
        <Box sx={{
          width: { xs: '100%', md: '380px', lg: '440px' },
          display: { xs: showQuickAccess ? 'flex' : 'none', md: (isUserActive && isPackageActive) ? 'flex' : 'none' },
          flexDirection: 'column',
          gap: 4,
          position: { md: 'sticky' },
          top: { md: '80px' }
        }}>
          {/* Mobile Only: Quick Access Header */}
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', mb: 1, display: { xs: 'block', md: 'none' } }}>
            OVER DRAFT
          </Typography>

          <Box sx={{ flex: 1 }}>
            {quickAccessGroups.map((group, idx) => (
              <Box key={idx} sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#f8fafc', mb: 2, letterSpacing: '1px' }}>
                  {group.title}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
                  {group.items.map((item, i) => (
                    <Box key={i} onClick={() => navigate(item.route)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        bgcolor: '#1e293b',
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none',
                        border: '1px solid #334155',
                        '&:hover': { transform: 'scale(1.1)', bgcolor: '#334155' },
                        transition: '0.2s'
                      }}>
                        {item.icon}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', textAlign: 'center', color: '#cbd5e1' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            {/* Team Performance - Mobile Only inside Quick Access */}
            <Box sx={{ mt: 2, display: { xs: 'block', md: 'none' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#f8fafc', mb: 2 }}>TEAM PERFORMANCE</Typography>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: '#1e293b', border: '1px solid #334155' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>Total Team</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc' }}>{memberDetails?.total_team || 0}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>Directs</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#f8fafc' }}>{memberDetails?.direct_referrals?.length || 0}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', xl: '420px' }, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper elevation={0} sx={{
              p: 4,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
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
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#f8fafc', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', mb: -2, mt: { xs: 2, md: 3 } }}>
              Deposit-BOND
            </Typography>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', bgcolor: '#1e293b', border: '1px solid #334155', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', mt: 1 }}>
              <Stack spacing={4}>
                {/* 1st Section: Deposits */}
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#0f172a', border: '1px dashed #334155' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontWeight: 800, color: '#94a3b8' }}>MY Deposit</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#f8fafc' }}>₹{displayDeposit.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 800, color: '#94a3b8' }}>Total Withdrawal</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#ef4444' }}>₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-IN')}</Typography>
                  </Box>
                </Box>

                {/* 2nd Section: Wallet Summary breakdown */}
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#0f172a', position: 'relative' }}>
                  <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 20, bgcolor: '#f97316', px: 1.5, py: 0.2, borderRadius: '10px', fontWeight: 900, color: '#020617', fontSize: '0.65rem' }}>
                    WALLET SUMMARY
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#94a3b8' }}>Daily ROI</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#d97706' }}>₹{totalRoiPaidValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#94a3b8' }}>BMS ROI Benefits</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#10b981' }}>₹{roiLevelBenefits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#94a3b8' }}>BMS Level Benefits</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#10b981' }}>₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-IN')}</Typography>
                    </Box>
                    {isUserActive && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#94a3b8' }}>BMS - Wallet</Typography>
                        <Typography sx={{ fontWeight: 900, color: '#3b82f6' }}>₹{displayWallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* 3rd Section: Big Balance — Hidden if Inactive ROI or User */}
                {isUserActive && isPackageActive && (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#94a3b8', letterSpacing: '1px', mb: 1 }}>
                      WALLET BALANCE
                    </Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, p: 2, px: 4, bgcolor: '#020617', borderRadius: '20px', color: '#f8fafc', border: '1px solid #334155' }}>
                      <CurrencyRupeeIcon sx={{ fontSize: 28, color: '#38bdf8' }} />
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {Number(walletOverview?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
