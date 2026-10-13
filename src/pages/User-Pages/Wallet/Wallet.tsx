import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import { useMediaQuery } from "@mui/material";
import {
  DASHBOARD_CUTSOM_STYLE,
  getWalletColumns,
} from "../../../utils/DataTableColumnsProvider";
import TokenService from "../../../api/token/tokenService";
import { useGetWalletOverview, useWalletWithdraw } from "../../../api/Memeber";
import { toast } from "react-toastify";

const Wallet = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [amount, setAmount] = useState("");
  const [tds, setTds] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [optimisticBalance, setOptimisticBalance] = useState<number | null>(null);
  const [isWithdrawalAllowed, setIsWithdrawalAllowed] = useState<boolean>(true);
  // Default to 'monthly' as required
  const [withdrawalType, setWithdrawalType] = useState<"monthly" | "monday_to_friday">("monthly");

  const memberId = TokenService.getMemberId();

  const {
    data: walletData,
    isLoading,
    refetch,
  } = useGetWalletOverview(memberId);

  const withdrawMutation = useWalletWithdraw(memberId);

  useEffect(() => {
    if (walletData?.data?.balance) {
      const balance = parseFloat(walletData.data.balance);
      setOptimisticBalance(balance);
    }

    // Check withdrawal allowance from API response
    if (walletData?.loanStatus) {
      setIsWithdrawalAllowed(walletData.loanStatus.isWithdrawalAllowed);
    }
  }, [walletData?.data?.balance, walletData?.loanStatus]);

  // Date and timing validations
  const now = new Date();
  const currentDayOfMonth = now.getDate();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat

  // Rule 1: Monthly Window is 1st to 5th
  const isDateInMonthlyWindow = currentDayOfMonth >= 1 && currentDayOfMonth <= 5;

  // Rule 2: Monthly is once per month
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const alreadyWithdrawnThisMonth = (walletData?.transactions || []).some((tx: any) => {
    const isWithdrawal =
      tx.transaction_type?.toLowerCase() === "withdrawal" ||
      tx.description?.toLowerCase().includes("withdrawal");
    const isNotRejected = tx.status !== "Rejected" && tx.status !== "Failed";
    if (!isWithdrawal || !isNotRejected) return false;

    const txDate = new Date(tx.createdAt || tx.transaction_date);
    return (
      !isNaN(txDate.getTime()) &&
      txDate.getFullYear() === currentYear &&
      txDate.getMonth() === currentMonth
    );
  });

  // Rule 3: Monday to Friday
  const isWeekday = currentDayOfWeek >= 1 && currentDayOfWeek <= 5;

  // Rule 4: Monday to Friday is once per day
  const todayDateStr = now.toDateString();
  const alreadyWithdrawnToday = (walletData?.transactions || []).some((tx: any) => {
    const isWithdrawal =
      tx.transaction_type?.toLowerCase() === "withdrawal" ||
      tx.description?.toLowerCase().includes("withdrawal");
    const isNotRejected = tx.status !== "Rejected" && tx.status !== "Failed";
    if (!isWithdrawal || !isNotRejected) return false;

    const txDate = new Date(tx.createdAt || tx.transaction_date);
    return !isNaN(txDate.getTime()) && txDate.toDateString() === todayDateStr;
  });

  const getOrdinalSuffix = (d: number) => {
    if (d > 3 && d < 21) return `${d}th`;
    switch (d % 10) {
      case 1:  return `${d}st`;
      case 2:  return `${d}nd`;
      case 3:  return `${d}rd`;
      default: return `${d}th`;
    }
  };

  let isWindowAllowed = true;
  let windowRestrictionMessage = "";

  if (withdrawalType === "monthly") {
    if (!isDateInMonthlyWindow) {
      isWindowAllowed = false;
      windowRestrictionMessage = `Monthly withdrawals are only permitted from the 1st to 5th of each month. (Today is the ${getOrdinalSuffix(currentDayOfMonth)})`;
    } else if (alreadyWithdrawnThisMonth) {
      isWindowAllowed = false;
      windowRestrictionMessage = `You have already submitted a monthly withdrawal for ${now.toLocaleString("default", { month: "long" })}. Monthly withdrawals can only be made once per month.`;
    }
  } else {
    if (!isWeekday) {
      isWindowAllowed = false;
      windowRestrictionMessage = "Withdrawals are only allowed from Monday to Friday.";
    } else if (alreadyWithdrawnToday) {
      isWindowAllowed = false;
      windowRestrictionMessage = "You have already made a withdrawal today. One withdrawal per day is allowed.";
    }
  }

  const canWithdraw = isWithdrawalAllowed && isWindowAllowed;

  const handleAmountChange = (e: any) => {
    const value = e.target.value;
    // Allow only numeric input
    if (value !== "" && !/^\d*$/.test(value)) return;

    setAmount(value);

    if (value && value !== "0") {
      const withdrawalAmount = parseFloat(value);
      const tdsAmount = withdrawalAmount * 0.05; // 5% TDS
      const calculatedNetAmount = withdrawalAmount - tdsAmount;

      setTds(tdsAmount);
      setNetAmount(calculatedNetAmount);
    } else {
      setTds(0);
      setNetAmount(0);
    }
  };

  const handleWithdraw = () => {
    if (!amount || amount === "0") {
      return;
    }

    if (!memberId) {
      return;
    }

    if (!isWithdrawalAllowed) {
      toast.error("Withdrawal disabled due to unpaid loan from last Saturday");
      return;
    }

    if (!isWindowAllowed) {
      toast.error(windowRestrictionMessage);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);

    if (withdrawalAmount > currentBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (withdrawalAmount < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }

    const newBalance = currentBalance - withdrawalAmount;
    setOptimisticBalance(newBalance);

    withdrawMutation.mutate(
      { memberId: memberId, amount: amount, withdrawalType },
      {
        onSuccess: () => {
          setAmount("");
          setTds(0);
          setNetAmount(0);
          refetch();
        },
        onError: () => {
          // Revert optimistic update on error
          setOptimisticBalance(parseFloat(walletData?.balance || 0));
        }
      }
    );
  };

  const displayBalance = Math.max(0, optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0));

  if (isLoading) {
    return (
      <Card
        sx={{
          margin: isMobile ? "1rem" : "2rem",
          mt: 1, // Further reduced top margin
          textAlign: "center",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#0a2558" }} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        margin: isMobile ? "0.5rem" : "1rem",
        backgroundColor: "#fff",
        mt: 1, // Further reduced top margin
      }}
    >
      <CardContent sx={{ padding: isMobile ? "12px" : "24px" }}>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionDetails>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    border: `2px solid ${isWithdrawalAllowed ? "#0a2558" : "#ff9800"}`,
                    position: "relative",
                    opacity: isWithdrawalAllowed ? 1 : 0.7,
                  }}
                >
                  {withdrawMutation.isPending && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <CircularProgress size={20} sx={{ color: "#0a2558" }} />
                    </Box>
                  )}
                  <Typography variant="subtitle1" color="textSecondary">
                    Available Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: isWithdrawalAllowed ? "#0a2558" : "#ff9800",
                      mt: 1,
                      fontWeight: "bold"
                    }}
                  >
                    ₹{displayBalance.toFixed(2)}
                  </Typography>
                  {!isWithdrawalAllowed && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ff9800",
                        mt: 1,
                        display: "block",
                        fontWeight: "bold"
                      }}
                    >
                      Withdrawal Disabled
                    </Typography>
                  )}
                  {withdrawMutation.isPending && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#0a2558", mt: 1, display: "block" }}
                    >
                      Updating...
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    opacity: isWithdrawalAllowed ? 1 : 0.7,
                  }}
                >
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Income
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#0a2558", mt: 1, fontWeight: "bold" }}
                  >
                    {walletData?.totalIncome ? `₹${walletData?.totalIncome}` : "₹0.00"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    opacity: isWithdrawalAllowed ? 1 : 0.7,
                  }}
                >
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Withdrawal
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#0a2558", mt: 1, fontWeight: "bold" }}
                  >
                    {walletData?.totalWithdrawal ? `₹${walletData?.totalWithdrawal}` : "₹0.00"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Withdrawal Section */}
        <Accordion
          defaultExpanded
          sx={{
            mt: isMobile ? 2 : 4,
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: canWithdraw ? "#0a2558" : (isWithdrawalAllowed ? "#1e293b" : "#ff9800"),
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: isMobile ? "48px" : "64px",
            }}
          >
            Withdrawal Request {!canWithdraw && (isWithdrawalAllowed ? `(${withdrawalType === 'monthly' ? 'Monthly Window 1st-5th' : 'Weekday Window'})` : "(Temporarily Disabled)")}
          </AccordionSummary>
          <AccordionDetails>
            {/* Top Bar with Title and Top-Right Dropdown */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 2.5,
                pb: 1.5,
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#0a2558" }}>
                  Withdrawal Schedule
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b" }}>
                  {withdrawalType === "monthly"
                    ? "Monthly Schedule: 1st to 5th date of each month (Once per month)"
                    : "Standard Schedule: Monday to Friday (Once per day)"}
                </Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 220 }}>
                <InputLabel id="withdrawal-type-select-label" sx={{ color: "#0a2558", fontWeight: 600 }}>
                  Withdrawal Type
                </InputLabel>
                <Select
                  labelId="withdrawal-type-select-label"
                  id="withdrawal-type-select"
                  value={withdrawalType}
                  label="Withdrawal Type"
                  onChange={(e) => setWithdrawalType(e.target.value as "monthly" | "monday_to_friday")}
                  sx={{
                    fontWeight: 600,
                    color: "#0a2558",
                    backgroundColor: "#f8fafc",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cbd5e1",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0a2558",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#0a2558",
                    },
                  }}
                >
                  <MenuItem value="monthly" sx={{ fontWeight: 500 }}>
                    1. Monthly
                  </MenuItem>
                  <MenuItem value="monday_to_friday" sx={{ fontWeight: 500 }}>
                    2. Monday to Friday
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Informational Alert for current status */}
            {!canWithdraw && (
              <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2 }}>
                {!isWithdrawalAllowed
                  ? "Withdrawal disabled due to unpaid loan from last Saturday"
                  : windowRestrictionMessage}
              </Alert>
            )}

            <form
              style={{
                marginTop: 2,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <TextField
                label="Available Balance"
                value={`₹${displayBalance.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <TextField
                label="Withdrawal Amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                size="medium"
                placeholder="Enter amount (Min ₹100)"
                disabled={withdrawMutation.isPending || !canWithdraw}
                error={parseFloat(amount) > displayBalance}
                helperText={parseFloat(amount) > displayBalance ? "Insufficient Balance" : ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <TextField
                label="TDS (5%)"
                value={`₹${tds.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <TextField
                label="Net Amount Received"
                value={`₹${netAmount.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: canWithdraw ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Terms & Conditions ({withdrawalType === "monthly" ? "Monthly Policy" : "Monday to Friday Policy"}):</strong>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 4, flexDirection: isMobile ? "column" : "row" }}>
                    <Box>
                      {withdrawalType === "monthly" ? (
                        <>
                          <Typography variant="body2">• Monthly withdrawals are only allowed from the 1st to 5th date of each month</Typography>
                          <Typography variant="body2">• Allowed once per month</Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2">• Withdrawals only allowed from Monday to Friday</Typography>
                          <Typography variant="body2">• One withdrawal per day allowed</Typography>
                        </>
                      )}
                      <Typography variant="body2">• 5% TDS applied</Typography>
                      <Typography variant="body2">• Minimum withdrawal: ₹100</Typography>
                    </Box>
                  </Box>
                  {!isWithdrawalAllowed && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ff9800",
                        fontWeight: "bold",
                        mt: 1
                      }}
                    >
                      • Withdrawal disabled due to unpaid loan from last Saturday
                    </Typography>
                  )}
                  {isWithdrawalAllowed && !isWindowAllowed && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#d97706",
                        fontWeight: "bold",
                        mt: 1
                      }}
                    >
                      • {windowRestrictionMessage}
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  onClick={handleWithdraw}
                  disabled={
                    withdrawMutation.isPending ||
                    !amount ||
                    amount === "0" ||
                    parseFloat(amount) > displayBalance ||
                    !canWithdraw
                  }
                  sx={{
                    backgroundColor: canWithdraw ? "#0a2558" : "#94a3b8",
                    minWidth: "150px",
                    "&:hover": {
                      backgroundColor: canWithdraw ? "#581c87" : "#94a3b8"
                    },
                    "&:disabled": { backgroundColor: "#cccccc" },
                  }}
                >
                  {withdrawMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : canWithdraw ? (
                    "Withdraw"
                  ) : (
                    "Withdrawal Closed"
                  )}
                </Button>
              </Box>
            </form>
          </AccordionDetails>
        </Accordion>

        {/* Transaction History */}
        <Accordion
          defaultExpanded
          sx={{
            mt: isMobile ? 2 : 4,
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#0a2558",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: isMobile ? "48px" : "64px",
            }}
          >
            Transaction History
          </AccordionSummary>
          <AccordionDetails>
            {walletData?.transactions && walletData.transactions.length > 0 ? (
              <DataTable
                columns={getWalletColumns()}
                data={walletData?.transactions}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={isMobile ? 10 : 25}
                paginationRowsPerPageOptions={
                  isMobile ? [10, 20, 50] : [25, 50, 100]
                }
                highlightOnHover
                responsive
              />
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No transactions found
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Your transaction history will appear here
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Wallet;