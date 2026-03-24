// components/UserDashboard.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import '../../Dashboard/dashboard.scss';

import DashboardCard from '../../../components/common/DashboardCard';
import TokenService from '../../../api/token/tokenService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import {
  useVerifyPayment,
  parsePaymentRedirectParams,
  useGetTransactionDetails,
  useGetlevelbenifits,
  useGetDailyPayout,
  useGetWalletOverview,
  useGetMemberDetails
} from '../../../api/Memeber';
import { toast } from 'react-toastify';


const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const memberId = TokenService.getMemberId();

  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails } = useGetMemberDetails(memberId);
  const { data: levelBenefitsData } = useGetlevelbenifits(memberId);
  const { data: dailyPayoutData } = useGetDailyPayout(memberId);


  // Payment verification hook
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();

  const { refetch: refetchTransactions } = useGetTransactionDetails("all");

  // Handle payment redirect from Cashfree
  useEffect(() => {
    const paymentParams = parsePaymentRedirectParams(searchParams);

    if (paymentParams.order_id && paymentParams.payment_status && !paymentProcessed) {
      console.log("🔄 Processing payment redirect:", paymentParams);
      setPaymentProcessed(true);

      // Verify the payment with backend
      verifyPayment(paymentParams.order_id, {
        onSuccess: () => {
          // Clear URL params after processing
          setSearchParams({});
          // Refresh transactions to show updated data
          refetchTransactions();
          refetchMemberDetails();
        },
        onError: () => {
          // Still clear URL params even on error
          setSearchParams({});
        }
      });
    }
  }, [searchParams, paymentProcessed, verifyPayment, setSearchParams, refetchTransactions, refetchMemberDetails]);


  const handleCopyReferralLink = () => {
    if (!memberDetails?.Member_id) return;

    const referralLink = `${window.location.origin}/register?ref=${memberDetails.Member_id}`;

    navigator.clipboard.writeText(referralLink)
      .then(() => {
        toast.success('Referral link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy referral link');
      });
  };

  const handleShareReferralLink = () => {
    if (!memberDetails?.Member_id) return;

    const referralLink = `${window.location.origin}/register?ref=${memberDetails.Member_id}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join me!',
        text: 'Check out this amazing platform and join using my referral link!',
        url: referralLink,
      })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      handleCopyReferralLink();
    }
  };



  return (
    <>
      {/* Payment verification loading overlay */}
      {isVerifyingPayment && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            Verifying your payment...
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          mx: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 8, md: 12 }, // Increased top margin as requested
          mb: 3,
          p: { xs: 3, md: 4 },
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #0a2558 0%, #153b93 100%)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(10, 37, 88, 0.4)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3
        }}
      >
        {/* Abstract Gold Glow inside Header */}
        <Box sx={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,192,0,0.2) 0%, rgba(255,192,0,0) 70%)', borderRadius: '50%', filter: 'blur(30px)', zIndex: 0 }} />
        <Box sx={{ position: 'absolute', bottom: '-80px', right: '-20px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0) 70%)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#fff', fontSize: { xs: '1.8rem', md: '2.5rem' }, letterSpacing: '-0.5px', mb: 0.5 }}>
            Welcome to Dashboard
          </Typography>
          <Typography variant="body1" sx={{ color: '#cbd5e1', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>
            Manage your foundation network and track your success
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, position: 'relative', zIndex: 1 }}>
          <Box sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', p: 2, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: '100px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFC000', mb: 0.5 }}>
              {memberDetails ? `${memberDetails.direct_referrals?.length || 0}` : '—'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              My Referrals
            </Typography>
          </Box>
          <Box sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', p: 2, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: '100px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mb: 0.5 }}>
              {memberDetails ? `${memberDetails.total_team || 0}` : '—'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              My Team
            </Typography>
          </Box>
        </Box>
      </Box>



      <Typography
        variant="h6"
        sx={{
          mx: { xs: 2, sm: 3, md: 4 },
          color: '#0a2558',
          fontWeight: 800,
          mb: 1.5,
          fontSize: { xs: '1.1rem', md: '1.3rem' }
        }}
      >
        Quick Actions & Overview
      </Typography>

      {/* Referral Link Box */}
      <Box
        sx={{
          mx: { xs: 2, sm: 3, md: 4 },
          mb: 3,
          p: { xs: 2, md: 3 },
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          transition: 'transform 0.3s ease',
          '&:hover': {
            boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: 2,
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Typography variant="body1" sx={{ color: '#0a2558', fontWeight: 800, mb: 1 }}>
              <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '6px', color: '#FFC000' }}>link</span>
              Your Referral Link
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                p: 1.5,
                width: '100%',
                overflow: 'hidden'
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#475569',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%'
                }}
              >
                {memberDetails?.Member_id ?
                  <a
                    href={`${window.location.origin}/register?ref=${memberDetails.Member_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0a2558', textDecoration: 'underline' }}
                  >
                    {`${window.location.origin}/register?ref=${memberDetails.Member_id}`}
                  </a> :
                  'Loading referral link...'
                }
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'row', sm: 'row' },
              width: { xs: '100%', md: 'auto' },
              mt: { xs: 1, md: 0 },
              alignItems: 'flex-end',
              height: '100%',
              pt: { xs: 0, md: 4 }
            }}
          >
            <Button
              variant="contained"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyReferralLink}
              disabled={!memberDetails?.Member_id}
              sx={{
                background: 'linear-gradient(135deg, #0a2558 0%, #153b93 100%)',
                color: '#fff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #153b93 0%, #0a2558 100%)',
                  transform: 'translateY(-2px)'
                },
                fontWeight: 700,
                textTransform: 'none',
                flexGrow: 1,
                borderRadius: '8px',
                py: 1.2,
                boxShadow: '0 4px 12px rgba(10, 37, 88, 0.2)'
              }}
            >
              Copy Link
            </Button>

            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareReferralLink}
              disabled={!memberDetails?.Member_id}
              sx={{
                borderColor: '#e2e8f0',
                color: '#0a2558',
                backgroundColor: '#f8fafc',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  borderColor: '#cbd5e1',
                  transform: 'translateY(-2px)'
                },
                fontWeight: 700,
                textTransform: 'none',
                flexGrow: 1,
                borderRadius: '8px',
                py: 1.2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              Share Link
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dashboard Cards Grid */}
      <Grid
        container
        spacing={{ xs: 2, sm: 3 }}
        sx={{
          mx: { xs: 1, sm: 2 },
          my: 2,
          pt: 1,
          pr: 7,
          width: 'auto',
          '& .MuiGrid-item': {
            display: 'flex',
          }
        }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            amount={levelBenefitsData?.total_benefits ? `₹${Number(levelBenefitsData.total_benefits).toFixed(2)}` : "₹0.00"}
            title="Level Benefits"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            amount={Array.isArray(dailyPayoutData)
              ? `₹${Number(dailyPayoutData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)).toFixed(2)}`
              : "₹0.00"}
            title="Daily ROI"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            amount={walletOverview?.balance ? `₹${Number(walletOverview.balance).toFixed(2)}` : "₹0.00"}
            title="Wallet Balance"
          />
        </Grid>
      </Grid>



    </>
  );
}

export default UserDashboard;
