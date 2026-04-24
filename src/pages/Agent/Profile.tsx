import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Avatar,
  Box,
  CircularProgress,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import { toast } from 'react-toastify';
import TokenService from '../../queries/token/tokenService';
import { useGetAgentById } from '../../queries/Agent';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const AgentProfile: React.FC = () => {
  const userId = TokenService.getMemberId();
  const { data: agentData, isLoading, } = useGetAgentById(userId || '');

  const [form, setForm] = useState<any>({
    agent_id: '',
    name: '',
    gender: 'Male',
    dob: '',
    emailid: '',
    mobile: '',
    address: '',
    designation: '',
    pan_no: '',
    aadharcard_no: '',
    branch_id: '',
    introducer: '',
    date_of_joining: '',
    agent_image: '',
  });

  useEffect(() => {
    if (agentData?.data) {
      const agent = agentData.data;
      setForm({
        agent_id: agent.agent_id || '',
        name: agent.name || '',
        gender: agent.gender || 'Male',
        dob: agent.dob ? new Date(agent.dob).toISOString().split('T')[0] : '',
        emailid: agent.emailid || '',
        mobile: agent.mobile || '',
        address: agent.address || '',
        designation: agent.designation || '',
        pan_no: agent.pan_no || '',
        aadharcard_no: agent.aadharcard_no || '',
        branch_id: agent.branch_id || '',
        introducer: agent.introducer || '',
        date_of_joining: agent.date_of_joining ? new Date(agent.date_of_joining).toISOString().split('T')[0] : '',
        agent_image: agent.agent_image || '',
      });
    }
  }, [agentData]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      const url = URL.createObjectURL(f);
      setForm((prev: any) => ({ ...prev, agent_image: url }));
    }
  };

  const [saving, setSaving] = useState(false);
  const handleSubmit = async () => {
    if (!userId) {
      toast.error('Agent ID not found');
      return;
    }

    try {
      setSaving(true);
      // TODO: Add actual profile update mutation when backend endpoint is available
      await new Promise((res) => setTimeout(res, 600));
      setSaving(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      setSaving(false);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update profile');
    }
  };

  if (isLoading && userId) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress size={60} sx={{ color: '#667EEA' }} />
    </Box>
  );

  // if (isError && userId) return (
  //   <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
  //     <Typography color="error" variant="h6">Error loading profile: {(error as any)?.message}</Typography>
  //   </Box>
  // );

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 }, mt: { xs: 7, sm: 7 }, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#667EEA', mb: 1 }}>
          Agent Profile
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Manage your professional information
        </Typography>
      </Box>

      {/* Profile Image Section */}
      <Paper sx={{
        p: 4,
        mb: 3,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #667EEA 0%, #818CF8 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={form.agent_image || ''}
            sx={{
              width: { xs: 80, sm: 100, md: 120 },
              height: { xs: 80, sm: 100, md: 120 },
              border: '4px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              bgcolor: '#5B21B6',
            }}
          >
            <WorkIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {form.name || 'Agent Name'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Agent ID: {form.agent_id}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {form.designation || 'Designation'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            component="label"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            Upload Photo
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>
        </Box>
      </Paper>

      {/* Personal Information */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AccountCircleIcon sx={{ color: '#667EEA', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Personal Information
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Full Name"
                fullWidth
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Gender</Typography>
                <RadioGroup
                  row
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <FormControlLabel value="Male" control={<Radio sx={{ '&.Mui-checked': { color: '#667EEA' } }} />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio sx={{ '&.Mui-checked': { color: '#667EEA' } }} />} label="Female" />
                  <FormControlLabel value="Other" control={<Radio sx={{ '&.Mui-checked': { color: '#667EEA' } }} />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Designation</InputLabel>
                <Select
                  label="Designation"
                  value={form.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                >
                  <MenuItem value="Director">Director</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Agent">Agent</MenuItem>
                  <MenuItem value="Senior Agent">Senior Agent</MenuItem>
                  <MenuItem value="Junior Agent">Junior Agent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <HomeIcon sx={{ color: '#667EEA', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Contact Information
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email ID"
                fullWidth
                value={form.emailid}
                disabled
                variant="outlined"
                helperText="Email cannot be changed"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                    cursor: 'not-allowed',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Mobile Number"
                fullWidth
                value={form.mobile}
                disabled
                variant="outlined"
                helperText="Mobile number cannot be changed"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                    cursor: 'not-allowed',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Address"
                multiline
                rows={4}
                fullWidth
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Identity Documents */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <BadgeIcon sx={{ color: '#667EEA', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Identity Documents
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="PAN Number"
                fullWidth
                value={form.pan_no}
                onChange={(e) => handleChange('pan_no', e.target.value)}
                variant="outlined"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Aadhar Card Number"
                fullWidth
                value={form.aadharcard_no}
                onChange={(e) => handleChange('aadharcard_no', e.target.value)}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Organization Details */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <WorkIcon sx={{ color: '#667EEA', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Organization Details
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Branch ID"
                fullWidth
                value={form.branch_id}
                disabled
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Date of Joining"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.date_of_joining}
                disabled
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Introducer"
                fullWidth
                value={form.introducer}
                disabled
                variant="outlined"
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                  }
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="large"
          sx={{
            borderRadius: '12px',
            px: 4,
            borderColor: '#667EEA',
            color: '#667EEA',
            '&:hover': {
              borderColor: '#5B21B6',
              backgroundColor: 'rgba(102, 126, 234, 0.04)',
            }
          }}
          onClick={() => window.location.reload()}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            borderRadius: '12px',
            px: 4,
            background: 'linear-gradient(135deg, #667EEA 0%, #818CF8 100%)',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5B21B6 0%, #667EEA 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}
        </Button>
      </Box>
    </Box>
  );
};

export default AgentProfile;
