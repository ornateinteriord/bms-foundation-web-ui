// components/UserDashboard.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import '../../Dashboard/dashboard.scss';
import DashboardTable from '../../Dashboard/DashboardTable';
import BMSLoanChart from './BMSLoanChart';

import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import DashboardCard from '../../../components/common/DashboardCard';
import { getUserDashboardTableColumns } from '../../../utils/DataTableColumnsProvider';
import TokenService from '../../../api/token/tokenService';
import {
  useCheckSponsorReward,
  useGetWalletOverview,
  useGetSponsers,
  useGetMemberDetails,
  useClimeLoan,
  useRepayLoan,
  useVerifyPayment,
  parsePaymentRedirectParams,
  useCreatePaymentOrder,
  useGetTransactionDetails
} from '../../../api/Memeber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { toast } from 'react-toastify';


const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [repaymentDialogOpen, setRepaymentDialogOpen] = useState(false);
  const [selectedRepayAmount, setSelectedRepayAmount] = useState(1);
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  // Package Selection State
  const [packageSelectionDialogOpen, setPackageSelectionDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  const memberId = TokenService.getMemberId();

  const { data: sponsorRewardData } = useCheckSponsorReward(memberId);
  useGetWalletOverview(memberId);
  const { data: sponsersData } = useGetSponsers(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails } = useGetMemberDetails(memberId);

  // Determine if user is new (no package value or 0)
  const isNewUser = !memberDetails?.package_value || memberDetails.package_value === 0;

  const { mutate: climeLoan, isPending: isClaiming } = useClimeLoan();
  const createPaymentOrder = useCreatePaymentOrder();

  // Renewal Logic
  const [renewalDays, setRenewalDays] = useState<number | undefined>(undefined);
  const [isRenewEnabled, setIsRenewEnabled] = useState(false);

  useEffect(() => {
    if (memberDetails?.Date_of_joining) {
      const joiningDate = new Date(memberDetails.Date_of_joining);
      const renewalDate = new Date(joiningDate);
      // Logic: Same date of next month
      renewalDate.setMonth(joiningDate.getMonth() + 1);

      // TESTING: Set renewal date to today found in memberDetails or just now
      // Actually simply setting it to current date makes diff ~0
      // renewalDate.setTime(new Date().getTime());

      const today = new Date();
      const diffTime = renewalDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setRenewalDays(diffDays);
      // Uncomment next line to revert to real logic after testing
      setIsRenewEnabled(diffDays <= 0);
    }
  }, [memberDetails?.Date_of_joining]);

  const handlePackagePurchase = async () => {
    if (!memberId) {
      toast.error("User not identified");
      return;
    }

    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    const packageMap: { [key: string]: number } = {
      "RD_600": 600,
      "RD_1200": 1200
    };

    const amount = packageMap[selectedPackage];
    if (!amount) return;

    try {
      console.log(`Initiating Package Purchase: ${selectedPackage} - ₹${amount}`);

      await createPaymentOrder.mutateAsync({
        amount: amount,
        currency: "INR",
        customer: {
          customer_id: memberId!,
          customer_email: memberDetails.email,
          customer_phone: memberDetails.mobileno,
          customer_name: memberDetails.Name
        },
        notes: {
          isLoanRepayment: false,
          note: `Purchase of ${selectedPackage}`,
          meta: {
            type: "package_purchase",
            package: selectedPackage,
            amount: amount
          }
        }
      });
      // setPackageSelectionDialogOpen(false); // This line is removed as per the instruction's implied change

    } catch (error) {
      console.error("Package Purchase Failed:", error);
    }
  };

  const handleRenewPackage = async () => {
    if (!memberId || !memberDetails) return;

    try {
      console.log("Initiating Package Renewal Payment...");

      await createPaymentOrder.mutateAsync({
        amount: memberDetails.package_value || 0,
        currency: "INR",
        customer: {
          customer_id: memberId!,
          customer_email: memberDetails.email,
          customer_phone: memberDetails.mobileno,
          customer_name: memberDetails.Name
        },
        notes: {
          isLoanRepayment: false,
          note: `Renewal for ${memberDetails.spackage}`,
          meta: {
            type: "package_renewal",
            package: memberDetails.spackage
          }
        }
      });

    } catch (error) {
      console.error("Renewal Payment Failed:", error);
      // Toast/Error handling is done inside the hook
    }
  };

  // Use the enhanced repay loan hook
  const { mutate: repayLoan, isPending: isRepaying } = useRepayLoan();

  // Payment verification hook
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();

  const { data: transactionsResponse, refetch: refetchTransactions } = useGetTransactionDetails("all");

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
  }, [searchParams, paymentProcessed, verifyPayment, setSearchParams, refetchTransactions]);

  const allTransactions = transactionsResponse?.data || [];
  const isRepayEnabled = transactionsResponse?.isRepayEnabled || false;
  const alreadyRepaidToday = transactionsResponse?.alreadyRepaidToday || false;

  // Loan Tiers configuration matching backend
  const LOAN_TIERS = [
    { level: 1, amount: 5000 },
    { level: 2, amount: 10000 },
    { level: 3, amount: 25000 },
    { level: 4, amount: 50000 },
    { level: 5, amount: 100000 },
  ];

  const completedLoansCount = Array.isArray(allTransactions)
    ? allTransactions.filter((t: any) =>
      t.transaction_type === "Reward Loan Request" &&
      t.status === "Approved" &&
      t.repayment_status === "Paid"
    ).length
    : 0;

  const approvedLoan = Array.isArray(allTransactions)
    ? allTransactions.find((transaction: any) =>
      transaction.status?.toLowerCase() === 'approved' &&
      transaction.repayment_status !== 'Paid' &&
      (transaction.transaction_type?.includes('Loan') || transaction.benefit_type === 'loan')
    )
    : null;

  const isLoanApproved = !!approvedLoan;

  // Determine current loan amount based on level
  const activeLoanTierIndex = completedLoansCount;
  const currentTierAmount = activeLoanTierIndex < LOAN_TIERS.length
    ? LOAN_TIERS[activeLoanTierIndex].amount
    : LOAN_TIERS[LOAN_TIERS.length - 1].amount;

  const initialLoanAmount = approvedLoan ? currentTierAmount : 0;

  // Calculate net amount for due amount fallback
  const loanNetAmount = approvedLoan?.net_amount ? parseFloat(approvedLoan.net_amount) : (approvedLoan?.ew_credit ? parseFloat(approvedLoan.ew_credit) : 0);

  // Find the last completed repayment linked to this SPECIFIC approved loan
  const lastCompletedRepayment = Array.isArray(allTransactions) && approvedLoan
    ? allTransactions
      .filter((t: any) =>
        t.is_loan_repayment &&
        t.repayment_status === "Completed" &&
        t.repayment_context?.reference_no === approvedLoan.reference_no
      )
      .sort((a: any, b: any) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())[0]
    : null;

  // Now update dueAmount
  const dueAmount = lastCompletedRepayment?.repayment_context?.new_due_amount
    ? parseFloat(lastCompletedRepayment.repayment_context.new_due_amount)
    : loanNetAmount;


  // Find the first transaction with Processing or Approved status (excluding fully paid loans)
  const processingOrApprovedTransaction = Array.isArray(allTransactions)
    ? allTransactions.find((transaction: any) =>
      transaction.status &&
      (transaction.status.toLowerCase() === 'processing' ||
        (transaction.status.toLowerCase() === 'approved' && transaction.repayment_status !== 'Paid'))
    )
    : null;

  const getStatusButtonText = () => {
    if (processingOrApprovedTransaction) {
      return processingOrApprovedTransaction.status;
    }
    return null;
  };

  const statusButtonText = getStatusButtonText();
  const hasProcessingOrApprovedStatus = !!statusButtonText;

  // Determine next loan amount
  const nextLoanTierIndex = completedLoansCount;
  const nextLoanAmount = nextLoanTierIndex < LOAN_TIERS.length
    ? LOAN_TIERS[nextLoanTierIndex].amount
    : LOAN_TIERS[LOAN_TIERS.length - 1].amount;


  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleClaimReward = () => {
    setClaimDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setClaimDialogOpen(false);
  };

  const handleConfirmClaim = () => {
    if (!memberId) {
      toast.error("Member ID not found!");
      return;
    }
    const payload = {
      note: "Requesting reward loan",
    };

    climeLoan(
      { memberId, data: payload },
      {
        onSuccess: () => {
          setClaimDialogOpen(false);
          toast.success('Loan request submitted successfully!');
          refetchTransactions();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to submit loan request");
        }
      }
    );
  };

  // Enhanced repayment handler
  const handleRepayment = () => {
    if (!memberId) {
      toast.error("Member ID not found");
      return;
    }

    if (selectedRepayAmount <= 0) {
      toast.error("Please select a valid repayment amount");
      return;
    }

    if (selectedRepayAmount > dueAmount) {
      toast.error(`Repayment amount cannot exceed due amount of ₹${dueAmount}`);
      return;
    }

    console.log("💰 Starting repayment process:", {
      memberId,
      amount: selectedRepayAmount,
      dueAmount
    });

    repayLoan({
      memberId,
      amount: selectedRepayAmount,
      memberDetails
    }, {
      onSuccess: (data) => {
        console.log("✅ Repayment initiated successfully:", data);
        setRepaymentDialogOpen(false);
        // The actual payment flow will redirect to Cashfree
      },
      onError: (error: any) => {
        console.error("❌ Failed to create repayment order:", error);
        toast.error("Failed to initialize payment. Please try again.");
      }
    });
  };

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

  // const levelBenefitsAmount = walletOverview?.levelBenefits || 0;
  // const directBenefitsAmount = walletOverview?.directBenefits || 0;
  // const totalEarningsAmount = walletOverview?.totalBenefits || 0;
  // const totalWithdrawsAmount = walletOverview?.totalWithdrawal || 0;
  // const walletBalanceAmount = walletOverview?.balance || 0;

  const tableData = [
    {
      title: "Today's Registration",
      direct: sponsersData?.sponsoredUsers?.filter((user: any) => user.status === 'active')?.length || 0,
      indirect: 0,
      total: sponsersData?.sponsoredUsers?.filter((user: any) => user.status === 'active')?.length || 0,
    },
    {
      title: "Today's Activation",
      direct: sponsersData?.sponsoredUsers?.filter((user: any) =>
        user.status === 'active' &&
        user.activationDate?.toDateString() === new Date().toDateString()
      )?.length || 0,
      indirect: 0,
      total: sponsersData?.sponsoredUsers?.filter((user: any) =>
        user.status === 'active' &&
        user.activationDate?.toDateString() === new Date().toDateString()
      )?.length || 0,
    },
    {
      title: 'Total Registration',
      direct: memberDetails?.direct_referrals?.filter((ref: any) => ref.status === 'active')?.length || 0,
      indirect: (memberDetails?.total_team || 0) - (memberDetails?.direct_referrals?.filter((ref: any) => ref.status === 'active')?.length || 0),
      total: memberDetails?.total_team || 0,
    },
    {
      title: 'Total Activation',
      direct: memberDetails?.direct_referrals?.filter((ref: any) => ref.status === 'active')?.length || 0,
      indirect: (memberDetails?.total_team || 0) - (memberDetails?.direct_referrals?.filter((ref: any) => ref.status === 'active')?.length || 0),
      total: memberDetails?.total_team || 0,
    },
    {
      title: 'Current Month Activation',
      direct: memberDetails?.direct_referrals?.filter((ref: any) =>
        ref.status === 'active' &&
        new Date(ref.activationDate).getMonth() === new Date().getMonth() &&
        new Date(ref.activationDate).getFullYear() === new Date().getFullYear()
      )?.length || 0,
      indirect: 0,
      total: memberDetails?.direct_referrals?.filter((ref: any) =>
        ref.status === 'active' &&
        new Date(ref.activationDate).getMonth() === new Date().getMonth() &&
        new Date(ref.activationDate).getFullYear() === new Date().getFullYear()
      )?.length || 0,
    },
  ];

  const handleRepayClick = () => {
    if (isRepayEnabled) {
      setRepaymentDialogOpen(true);
    } else if (alreadyRepaidToday) {
      toast.info('You have already made a repayment today. Only one repayment allowed per Saturday.');
    } else {
      toast.warning('Repayment is only available on Saturdays.');
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
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>person</span> Direct
            </Typography>
          </Box>
          <Box sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', p: 2, borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', minWidth: '100px' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mb: 0.5 }}>
              {memberDetails ? `${memberDetails.total_team || 0}` : '—'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>groups</span> Team
            </Typography>
          </Box>
        </Box>
      </Box>


      {/* BMS Loan Chart */}
      <BMSLoanChart />

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
            amount={initialLoanAmount > 0 ? initialLoanAmount : "0.00"}
            title="Loan Amount"
            onClaim={handleClaimReward}
            isClaimEligible={sponsorRewardData?.isEligibleForReward && !hasProcessingOrApprovedStatus}
            loanStatus={statusButtonText}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            amount={
              memberDetails?.package_value
                ? `₹${memberDetails.package_value}`
                : "0.00"
            }
            title="RD Deposit"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardCard
            amount={
              memberDetails?.package_value
                ? `₹${memberDetails.package_value}`
                : "0.00"
            }
            title="RD Deposits"
            type="renewal"
            renewalDays={renewalDays}
            onRenew={isNewUser ? () => setPackageSelectionDialogOpen(true) : handleRenewPackage}
            isRenewEnabled={isNewUser || isRenewEnabled}
            isNewUser={isNewUser}
          />
        </Grid>

        {isLoanApproved && (
          <Grid item xs={12} sm={6} md={4}>
            <DashboardCard
              amount={initialLoanAmount}
              dueAmount={dueAmount}
              title="Loan Repayment"
              type="loan"
              onRepay={handleRepayClick}
              isRepayEnabled={isRepayEnabled}
              alreadyRepaidToday={alreadyRepaidToday}
            />
          </Grid>
        )}
      </Grid>

      <Grid
        container
        spacing={{ xs: 2, sm: 3 }}
        sx={{
          mx: { xs: 1, sm: 2 },
          my: 2,
          pr: 7,
          width: 'auto',
          '& .MuiGrid-item': {
            display: 'flex',
          }
        }}
      >
        {/* BMS FOUNDATION */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(77, 42, 190, 0.5) 0%, rgba(17, 27, 49, 0.6) 100%)',
              backdropFilter: 'blur(5px)',
              color: '#fff',
              borderRadius: '10px',
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 3,
              width: '100%',
              minHeight: '120px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem', mb: 2 }}>
              BMS FOUNDATION
            </Typography>
            <Button
              variant="contained"
              href="https://bmsfoundations.com/auth"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                background: 'linear-gradient(135deg, #FFC000 0%, #E6A800 100%)',
                color: '#000',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFC700 0%, #FF9500 100%)',
                },
                px: 3,
                py: 0.5,
                borderRadius: '20px',
                minWidth: '120px'
              }}
            >
              Click Here
            </Button>
          </Box>
        </Grid>

        {/* PIGMY Open Account */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(77, 42, 190, 0.5) 0%, rgba(17, 27, 49, 0.6) 100%)',
              backdropFilter: 'blur(5px)',
              color: '#fff',
              borderRadius: '10px',
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: 3,
              width: '100%',
              minHeight: '120px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem', mb: 2 }}>
              PIGMY Open Account
            </Typography>
            <Button
              variant="contained"
              href="https://www.manipalsociety.in/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                background: 'linear-gradient(135deg, #FFC000 0%, #E6A800 100%)',
                color: '#000',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFC700 0%, #FF9500 100%)',
                },
                px: 3,
                py: 0.5,
                borderRadius: '20px',
                minWidth: '120px'
              }}
            >
              Click Here
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Claim Reward Dialog */}
      <Dialog
        open={claimDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="claim-reward-dialog-title"
        aria-describedby="claim-reward-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
            minWidth: { xs: '300px', sm: '400px' }
          }
        }}
      >
        <DialogTitle
          id="claim-reward-dialog-title"
          sx={{
            textAlign: 'center',
            color: '#0a2558',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            pb: 1
          }}
        >
          🎉 Congratulations!
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="claim-reward-dialog-description"
            sx={{
              textAlign: 'center',
              color: '#4b5563',
              fontSize: '1.1rem',
              mb: 2
            }}
          >
            <p>
              You are eligible for a reward loan of{" "}
              <span style={{ color: "gold", fontWeight: "bold" }}>₹{nextLoanAmount}</span>!
            </p>
          </DialogContentText>

          <DialogContentText
            sx={{
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '0.9rem'
            }}
          >
            Submit your loan request and our admin team will review and approve the appropriate amount based on your eligibility.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              textTransform: 'capitalize',
              borderColor: '#6b7280',
              color: '#6b7280',
              '&:hover': {
                borderColor: '#4b5563',
                backgroundColor: '#f3f4f6',
              },
              fontWeight: 'bold',
              px: 4,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClaim}
            variant="contained"
            autoFocus
            disabled={isClaiming}
            sx={{
              textTransform: 'capitalize',
              backgroundColor: '#DDAC17',
              '&:hover': { backgroundColor: '#Ecc440' },
              fontWeight: 'bold',
              px: 4,
            }}
          >
            {isClaiming ? 'Processing...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Package Selection Dialog */}
      <Dialog
        open={packageSelectionDialogOpen}
        onClose={() => setPackageSelectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#0a2558', fontSize: '1.5rem' }}>
          Select Package
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="package-select-label">Select Package</InputLabel>
            <Select
              labelId="package-select-label"
              id="package-select"
              value={selectedPackage}
              label="Select Package"
              onChange={(e) => setSelectedPackage(e.target.value)}
              sx={{
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a2558',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a2558',
                }
              }}
            >
              <MenuItem value="RD_600">RD Scheme ₹600</MenuItem>
              <MenuItem value="RD_1200">RD Scheme ₹1200</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button onClick={() => setPackageSelectionDialogOpen(false)} sx={{ color: '#6b7280' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePackagePurchase}
            disabled={!selectedPackage}
            sx={{
              backgroundColor: '#0a2558',
              '&:hover': {
                backgroundColor: '#113278'
              }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Repayment Dialog */}
      <Dialog
        open={repaymentDialogOpen}
        onClose={() => !isRepaying && setRepaymentDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: { xs: '320px', sm: '400px' },
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            color: '#0a2558',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            pb: 1
          }}
        >
          Loan Repayment
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              textAlign: 'center',
              mb: 3,
              fontSize: '1rem',
              color: '#4b5563',
              lineHeight: 1.6,
            }}
          >
            Choose the repayment amount and confirm to proceed.
          </DialogContentText>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#6b7280',
                mb: 1.5,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Loan Summary
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Typography sx={{ color: '#64748b' }}>Total Loan</Typography>
                <Typography sx={{ fontWeight: 600 }}>₹{initialLoanAmount.toFixed(2)}</Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#f0fdf4',
                borderRadius: 2,
                border: '1px solid #bbf7d0'
              }}>
                <Typography sx={{ color: '#64748b' }}>Amount Paid</Typography>
                <Typography sx={{ fontWeight: 600, color: '#059669' }}>
                  ₹{(initialLoanAmount - dueAmount).toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                p: 1.5,
                backgroundColor: '#fef2f2',
                borderRadius: 2,
                border: '1px solid #fecaca'
              }}>
                <Typography sx={{ color: '#64748b' }}>Due Amount</Typography>
                <Typography sx={{ fontWeight: 700, color: '#dc2626' }}>
                  ₹{dueAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <FormControl fullWidth size="medium" sx={{ mt: 2 }}>
            <InputLabel sx={{ fontWeight: 500 }}>Repayment Amount</InputLabel>
            <Select
              value={selectedRepayAmount}
              label="Repayment Amount"
              onChange={(e) => setSelectedRepayAmount(Number(e.target.value))}
              disabled={isRepaying}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#d1d5db',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#0a2558',
                },
              }}
            >
              {[
                1, // Testing amount
                activeLoanTierIndex === 0 ? 500 : // Level 1
                  activeLoanTierIndex >= 1 && activeLoanTierIndex <= 3 ? 1000 : // Level 2, 3, 4
                    activeLoanTierIndex === 4 ? 2000 : 1000 // Level 5 (default to 1000 if undefined)
              ]
                .filter(amount => amount <= dueAmount || amount === 1) // Only show options less than due amount, except 1 which is for testing
                .concat(dueAmount) // Always include full due amount
                .sort((a, b) => a - b)
                .reduce((unique, item) => unique.includes(item) ? unique : [...unique, item], [] as number[])
                .map((amount) => (
                  <MenuItem
                    key={amount}
                    value={amount}
                    sx={{ fontWeight: amount === dueAmount ? 600 : 400 }}
                  >
                    ₹{amount} {amount === dueAmount && '(Full Payment)'}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {isRepaying && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <CircularProgress size={20} sx={{ color: '#0a2558' }} />
              <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                Initializing payment...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          justifyContent: 'center',
          pb: 2,
          pt: 1,
          gap: 1,
        }}>
          <Button
            onClick={() => setRepaymentDialogOpen(false)}
            variant="outlined"
            disabled={isRepaying}
            sx={{
              borderColor: '#d1d5db',
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'capitalize',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                backgroundColor: '#f3f4f6',
                borderColor: '#9ca3af',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRepayment}
            variant="contained"
            disabled={isRepaying || selectedRepayAmount === 0}
            sx={{
              background: 'linear-gradient(135deg, #0a2558 0%, #a855f7 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #581c87 0%, #9333ea 100%)',
                boxShadow: '0 4px 12px rgba(107, 33, 168, 0.3)',
              },
              textTransform: 'capitalize',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
            }}
          >
            {isRepaying ? 'Processing...' : 'Pay now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Member Statistics */}
      <div className='mt-10 p-4 rounded shadow' style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(5px)' }}>
        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6" style={{ fontWeight: 'bold', color: '#0a2558' }}>Member Statistics</Typography>
              <MuiDatePicker
                date={selectedDate}
                setDate={handleDateChange}
                label="Filter by Date"
              />
            </div>

            <DashboardTable data={tableData} columns={getUserDashboardTableColumns()} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default UserDashboard;
