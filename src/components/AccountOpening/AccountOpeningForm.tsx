import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { toast } from 'react-toastify';
import {
  useGetAccountGroups,
  useGetInterestsByAccountGroup,
  useGetMemberById,
  useCreateAccount,
  useGetAllAgents,
  useGetAgentById,
} from '../../queries/admin';

export type AccountType = 'SB' | 'CA' | 'RD' | 'FD' | 'PIGMY' | 'MIS' | string;

interface Props {
  defaultAccountType?: AccountType;
  title?: string;
}

// Modern Input Styles - Blue Theme (Member Section)
const memberInputStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: 2,
    fontWeight: 500,
    '& fieldset': {
      borderColor: 'rgba(26, 35, 126, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#1a237e',
      borderWidth: '1.5px',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a237e',
      borderWidth: '2.5px',
      boxShadow: '0 0 0 3px rgba(26, 35, 126, 0.1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#1a237e',
      fontWeight: 600,
    },
  },
};

// Read-only Input Style
const readOnlyInputStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#f8fafc',
    borderRadius: 2,
    '& fieldset': {
      borderColor: 'rgba(26, 35, 126, 0.15)',
      borderWidth: '1.5px',
      borderStyle: 'dashed',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: 'rgba(0,0,0,0.5)',
  },
};

// Modern Input Styles - Green Theme (Account Section)
const accountInputStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: 2,
    fontWeight: 500,
    '& fieldset': {
      borderColor: 'rgba(22, 101, 52, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#166534',
      borderWidth: '1.5px',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#166534',
      borderWidth: '2.5px',
      boxShadow: '0 0 0 3px rgba(22, 101, 52, 0.1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#166534',
      fontWeight: 600,
    },
  },
};

const AccountOpeningForm: React.FC<Props> = ({ defaultAccountType = 'SB', title }) => {
  const [memberId, setMemberId] = useState('');
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [accountGroupId, setAccountGroupId] = useState<string>('');

  // State for introducer auto-population
  const [introducerCode, setIntroducerCode] = useState<string>('');
  const [shouldFetchAgent, setShouldFetchAgent] = useState<boolean>(false);
  const [agentError, setAgentError] = useState<boolean>(false);

  const [form, setForm] = useState<any>({
    accountType: defaultAccountType,
    accountOperation: 'Single',
    openingDate: new Date().toISOString().split('T')[0],
    interestSlab: '',
    interestRate: '',
    duration: '',
    amount: '',
    maturityDate: '',
    maturityValue: '',
    introducer: '',
    introducerName: '',
    agent: '',
    jointMember: '',
  });

  // Fetch account groups
  const { data: accountGroupsData } = useGetAccountGroups();

  // Fetch all agents for dropdown
  const { data: agentsData, isLoading: loadingAgents } = useGetAllAgents();

  // Fetch member info when requested
  const { isLoading: loadingMember, refetch: fetchMember } = useGetMemberById(
    memberId,
    false // Don't auto-fetch
  );

  // Fetch interests based on account group ID
  const { data: interestsData, isLoading: loadingInterests } = useGetInterestsByAccountGroup(
    accountGroupId,
    !!accountGroupId
  );
  console.log("intrestttt", interestsData);

  // Fetch agent data when introducer code is entered and onBlur triggered
  const { data: agentData, isLoading: isLoadingAgent, isError: isAgentError } = useGetAgentById(
    introducerCode,
    shouldFetchAgent && !!introducerCode && introducerCode.length > 0
  );

  // Create account mutation
  const createAccountMutation = useCreateAccount();

  // Map account type name to account_group_id
  useEffect(() => {
    if (accountGroupsData?.data) {
      const matchingGroup = accountGroupsData.data.find(
        (group: any) => group.account_group_name === defaultAccountType
      );
      if (matchingGroup) {
        setAccountGroupId(matchingGroup.account_group_id);
      }
    }
  }, [accountGroupsData, defaultAccountType]);

  // Auto-populate introducer name when agent data is fetched
  useEffect(() => {
    if (agentData?.data?.name) {
      setForm((prev: any) => ({
        ...prev,
        introducerName: agentData.data.name || ''
      }));
      setAgentError(false);
      // Reset fetch trigger after successful fetch
      setShouldFetchAgent(false);
    } else if (isAgentError && shouldFetchAgent) {
      // Agent not found
      setAgentError(true);
      setForm((prev: any) => ({
        ...prev,
        introducerName: ''
      }));
      setShouldFetchAgent(false);
    }
  }, [agentData, isAgentError, shouldFetchAgent]);

  // Handle member info fetch
  const handleGetInfo = async () => {
    if (!memberId) {
      toast.error('Please enter a member ID');
      return;
    }

    try {
      const result = await fetchMember();
      if (result.data?.success && result.data.data) {
        const member = result.data.data;
        setMemberInfo(member);

        // Auto-populate fields from member data
        setForm((prev: any) => ({
          ...prev,
          introducer: member.introducer || '',
          introducerName: member.introducer_name || '',
        }));

        toast.success('Member information loaded successfully');
      } else {
        toast.error('Member not found');
        setMemberInfo(null);
      }
    } catch (error) {
      toast.error('Failed to fetch member information');
      setMemberInfo(null);
    }
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));

    // If introducer code is changed, update the introducer code state
    if (field === 'introducer') {
      setIntroducerCode(value);
      setAgentError(false); // Clear error when user types
      // Clear introducer name and stop fetching if code is cleared
      if (!value) {
        setShouldFetchAgent(false);
        setForm((prev: any) => ({
          ...prev,
          introducerName: ''
        }));
      }
    }
  };

  // Handle onBlur for introducer field to trigger API call
  const handleIntroducerBlur = () => {
    if (form.introducer && form.introducer.trim().length > 0) {
      setIntroducerCode(form.introducer.trim());
      setShouldFetchAgent(true);
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string | Date): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if member is senior citizen (60+ years)
  const isSeniorCitizen = memberInfo?.dob ? calculateAge(memberInfo.dob) >= 60 : false;

  // Handle interest slab selection
  const handleInterestSlabChange = (interestId: string) => {
    setForm((prev: any) => ({ ...prev, interestSlab: interestId }));

    if (interestsData?.data) {
      const interest = interestsData.data.find((i: any) => i.interest_id === interestId);
      if (interest) {

        // Auto-select rate based on member age (Senior Citizen if 60+ years)
        const interestRate = isSeniorCitizen
          ? (interest.interest_rate_senior || interest.interest_rate_general || interest.interest_rate || 0)
          : (interest.interest_rate_general || interest.interest_rate || 0);
        const duration = interest.duration || 0;

        // Calculate maturity date (opening date + duration months)
        let maturityDate = '';
        if (form.openingDate && duration > 0) {
          const openDate = new Date(form.openingDate);
          openDate.setMonth(openDate.getMonth() + duration);
          maturityDate = openDate.toISOString().split('T')[0];
        }

        setForm((prev: any) => ({
          ...prev,
          interestRate: interestRate.toString(),
          duration: duration.toString(),
          maturityDate,
          isSeniorCitizen: isSeniorCitizen, // Store for reference
          maturityValue: '', // Placeholder for now
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!memberInfo) {
      toast.error('Please fetch member information first');
      return;
    }

    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (form.accountOperation === 'Any two' && !form.jointMember) {
      toast.error('Please enter joint member details');
      return;
    }

    try {
      const accountData = {
        branch_id: memberInfo.branch_id,
        date_of_opening: form.openingDate,
        member_id: memberId,
        account_type: accountGroupId, // Send account_group_id
        account_operation: form.accountOperation,
        introducer: form.introducer,
        entered_by: memberInfo.entered_by || '', // From logged-in user
        ref_id: form.interestSlab, // interest_id
        interest_rate: parseFloat(form.interestRate) || 0,
        duration: parseInt(form.duration) || 0,
        date_of_maturity: form.maturityDate || null,
        assigned_to: form.agent,
        account_amount: parseFloat(form.amount),
        joint_member: form.accountOperation === 'Any two' ? form.jointMember : null,
      };

      const result = await createAccountMutation.mutateAsync(accountData);

      if (result?.success) {
        toast.success('Account created successfully!');
        // Reset form
        setMemberId('');
        setMemberInfo(null);
        setForm({
          accountType: defaultAccountType,
          accountOperation: 'Single',
          openingDate: new Date().toISOString().split('T')[0],
          interestSlab: '',
          interestRate: '',
          duration: '',
          amount: '',
          maturityDate: '',
          maturityValue: '',
          introducer: '',
          introducerName: '',
          agent: '',
          jointMember: '',
        });
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create account');
    }
  };

  const showInterestFields = ['SB', 'RD', 'FD', 'PIGMY', 'MIS'].includes(form.accountType);
  const interests = interestsData?.data || [];
  const agents = agentsData?.data || [];

  return (
    <Box sx={{ mt: 2, px: { xs: 1.5, sm: 2, md: 3 }, pb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#1a237e',
          mb: 3,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
        }}
      >
        {title ?? `${form.accountType} Account Opening`}
      </Typography>
      <Card sx={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        borderRadius: '16px',
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Grid container spacing={4}>
            {/* Member Information Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                bgcolor: '#f0f7ff',
                p: 3,
                borderRadius: 2,
                border: '1px solid #e3f2fd',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <PersonIcon sx={{ color: '#6366f1', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Member Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      placeholder="Member ID"
                      size="small"
                      fullWidth
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      label="Member ID"
                      sx={memberInputStyle}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      size="medium"
                      fullWidth
                      onClick={handleGetInfo}
                      disabled={loadingMember || !memberId}
                      sx={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                        fontWeight: 600,
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
                          boxShadow: '0 6px 16px rgba(79, 70, 229, 0.4)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {loadingMember ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Get Info'}
                    </Button>
                  </Grid>

                  {/* Display member info when loaded */}
                  {memberInfo && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Member Name"
                          fullWidth
                          size="small"
                          value={memberInfo.name || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Gender"
                          fullWidth
                          size="small"
                          value={memberInfo.gender || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Date Of Birth"
                          fullWidth
                          size="small"
                          value={memberInfo.dob ? new Date(memberInfo.dob).toLocaleDateString('en-GB') : ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Email ID"
                          fullWidth
                          size="small"
                          value={memberInfo.emailid || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Contact No"
                          fullWidth
                          size="small"
                          value={memberInfo.contactno || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Address"
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          value={memberInfo.address || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Pan No"
                          fullWidth
                          size="small"
                          value={memberInfo.pan_no || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Aadharcard No"
                          fullWidth
                          size="small"
                          value={memberInfo.aadharcard_no || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Branch Code"
                          fullWidth
                          size="small"
                          value={memberInfo.branch_id || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Receipt No"
                          fullWidth
                          size="small"
                          value={memberInfo.receipt_no || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Nominee"
                          fullWidth
                          size="small"
                          value={memberInfo.nominee || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Relation"
                          fullWidth
                          size="small"
                          value={memberInfo.relation || ''}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>

            {/* Account Information Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                bgcolor: '#f0fdf4',
                p: 3,
                borderRadius: 2,
                border: '1px solid #dcfce7',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AccountBalanceIcon sx={{ color: '#10b981', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    Account Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={readOnlyInputStyle}>
                      <InputLabel id="account-type-label">Account Type</InputLabel>
                      <Select
                        labelId="account-type-label"
                        label="Account Type"
                        value={form.accountType}
                        readOnly // Account type is non-editable but looks normal
                        inputProps={{ readOnly: true }}
                      >
                        <MenuItem value="SB">SB</MenuItem>
                        <MenuItem value="CA">CA</MenuItem>
                        <MenuItem value="RD">RD</MenuItem>
                        <MenuItem value="FD">FD</MenuItem>
                        <MenuItem value="PIGMY">PIGMY</MenuItem>
                        <MenuItem value="MIS">MIS</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={accountInputStyle}>
                      <InputLabel id="account-op-label">Account Operation</InputLabel>
                      <Select
                        labelId="account-op-label"
                        label="Account Operation"
                        value={form.accountOperation}
                        onChange={(e) => handleChange('accountOperation', e.target.value)}
                      >
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Any two">Any two</MenuItem>
                        <MenuItem value="Anyone">Anyone</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Conditional Joint Member Field */}
                  {form.accountOperation === 'Any two' && (
                    <Grid item xs={12}>
                      <TextField
                        label="Joint Member"
                        fullWidth
                        size="small"
                        value={form.jointMember}
                        onChange={(e) => handleChange('jointMember', e.target.value)}
                        placeholder="Joint member"
                        sx={accountInputStyle}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Opening Date"
                      type="date"
                      fullWidth
                      size="small"
                      value={form.openingDate}
                      onChange={(e) => handleChange('openingDate', e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      sx={accountInputStyle}
                    />
                  </Grid>

                  {showInterestFields && (
                    <>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small" sx={accountInputStyle}>
                          <InputLabel id="interest-slab-label">Interest Slab</InputLabel>
                          <Select
                            labelId="interest-slab-label"
                            label="Interest Slab"
                            value={form.interestSlab}
                            onChange={(e) => handleInterestSlabChange(e.target.value)}
                            disabled={loadingInterests || interests.length === 0}
                          >
                            <MenuItem value="">Select Interest Slab</MenuItem>
                            {interests.map((interest: any) => (
                              <MenuItem key={interest.interest_id} value={interest.interest_id}>
                                {interest.interest_name || `${interest.duration} Months`} - Gen: {interest.interest_rate_general || interest.interest_rate}% | Sr: {interest.interest_rate_senior || '-'}%
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Interest Rate (General)"
                          fullWidth
                          size="small"
                          value={form.interestRate}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Duration"
                          fullWidth
                          size="small"
                          value={form.duration}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Amount"
                      fullWidth
                      size="small"
                      type="number"
                      value={form.amount}
                      onChange={(e) => handleChange('amount', e.target.value)}
                      sx={accountInputStyle}
                    />
                  </Grid>

                  {showInterestFields && (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Maturity Date"
                          type="date"
                          fullWidth
                          size="small"
                          value={form.maturityDate}
                          InputProps={{ readOnly: true }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Maturity Value"
                          fullWidth
                          size="small"
                          value={form.maturityValue}
                          InputProps={{ readOnly: true }}
                          sx={readOnlyInputStyle}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Introducer"
                      fullWidth
                      size="small"
                      value={form.introducer}
                      onChange={(e) => handleChange('introducer', e.target.value)}
                      onBlur={handleIntroducerBlur}
                      error={agentError}
                      helperText={agentError ? 'Agent not found' : ''}
                      InputProps={{
                        endAdornment: isLoadingAgent ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={accountInputStyle}
                    />

                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Introducer Name"
                      fullWidth
                      size="small"
                      value={form.introducerName}
                      InputProps={{ readOnly: true }}
                      sx={readOnlyInputStyle}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small" sx={accountInputStyle}>
                      <InputLabel id="agent-label">Agent</InputLabel>
                      <Select
                        labelId="agent-label"
                        label="Agent"
                        value={form.agent}
                        onChange={(e) => handleChange('agent', e.target.value)}
                        disabled={loadingAgents}
                      >
                        <MenuItem value="">Select Agent (Optional)</MenuItem>
                        {agents.map((agent: any) => (
                          <MenuItem key={agent.agent_id} value={agent.agent_id}>
                            {agent.name} ({agent.agent_id})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        disabled={!memberInfo || createAccountMutation.isPending}
                        sx={{
                          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                          px: 4,
                          py: 1.5,
                          fontWeight: 600,
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                            boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                          },
                        }}
                      >
                        {createAccountMutation.isPending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Create Account'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box >
  );
};

export default AccountOpeningForm;
