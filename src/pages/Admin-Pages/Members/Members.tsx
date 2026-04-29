import DataTable from 'react-data-table-component';
import {
  Card, CardContent, Accordion, AccordionSummary, AccordionDetails,
  TextField, Typography, Button, Grid, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Divider, Autocomplete,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CheckCircle, WarningAmber } from '@mui/icons-material';
import { DASHBOARD_CUTSOM_STYLE, getMembersColumns, getPendingMembersColumns, getPermissionsColumns } from '../../../utils/DataTableColumnsProvider';
import './Members.scss'
import { MuiDatePicker } from '../../../components/common/DateFilterComponent';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useGetAllMembersDetails, useUpdateMemberStatus } from '../../../api/Admin';
import { useNavigate } from 'react-router-dom';
import useSearch from '../../../hooks/SearchQuery';
import { useActivatePackage } from '../../../api/Memeber';

interface MemberTableProps {
  title: string;
  summaryTitle: string;
  data: any[];
  showEdit?: boolean;
  showView?: boolean;
  showActivate?: boolean;
  isLoading?: boolean;
  onActivate?: (member: any) => void;
  isActivating?: boolean;
}

const MemberTable = ({
  title,
  summaryTitle,
  data,
  showEdit = false,
  showView = false,
  showActivate = false,
  isLoading = false,
  onActivate,
  isActivating = false
}: MemberTableProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const { searchQuery, setSearchQuery, filteredData } = useSearch(data)

  const navigate = useNavigate()

  const handleEditClick = (memberId: string) => {
    setIsEdit(true);
    setSelectedMemberId(memberId);
  };

  const handleViewClick = (memberId: string) => {
    navigate(`/admin/members/${memberId}`);
  };

  const handleActivateClick = (member: any) => {
    if (onActivate) {
      onActivate(member);
    }
  };

  useEffect(() => {
    if (isEdit) {
      navigate(`/admin/members/${selectedMemberId}`)
    }
  }, [isEdit])

  // Determine which columns to use based on props
  const getColumns = () => {
    if (showActivate && onActivate) {
      return getPendingMembersColumns(handleActivateClick, isActivating);
    } else {
      return getMembersColumns(showEdit, handleEditClick, showView ? handleViewClick : undefined);
    }
  };

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 2 }}>
        <Typography variant="h4">
          {title}
        </Typography>
        <Grid className="filter-actions" >
          <MuiDatePicker date={fromDate} setDate={setFromDate} label="From Date" />
          <MuiDatePicker date={toDate} setDate={setToDate} label="To Date" />
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#0a2558',
              '&:hover': { backgroundColor: '#0a2558' }
            }}
          >
            Search
          </Button>
        </Grid>
      </Grid>
      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#0a2558',
                color: '#fff',
                '& .MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              {summaryTitle}
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <TextField
                  size="small"
                  placeholder="Search..."
                  sx={{ minWidth: 200 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DataTable
                columns={getColumns()}
                data={filteredData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                progressPending={isLoading}
                progressComponent={
                  <CircularProgress size={"4rem"} sx={{ color: "#0a2558" }} />
                }
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
};

interface Member {
  Member_id: string;
  Date_of_joining: string;
  password: string;
  Sponsor_name: number | string;
  spackage: number | string;
  mobileno: number | string;
  status: string;
  Name: string;
  package_value?: number | string;
}

type status = "All" | "active" | "Inactive" | "Pending";

const useMembers = (status: status) => {
  const { data: members, isLoading, isError, error } = useGetAllMembersDetails()

  useEffect(() => {
    if (isError) {
      const err = error as any;
      toast.error(
        err?.response.data.message || "Failed to fetch Transaction details"
      );
    }
  }, [isError, error]);

  const memberdata = Array.isArray(members)
    ? members.filter((member: Member) => (status === "All" ? true : member.status === status)).map((member: Member, index) => ({
      ...member,
      sNo: index + 1,
    }))
    : [];

  return { memberdata, isLoading };
};

export const Members = () => {
  const { memberdata, isLoading } = useMembers("All");
  return (
    <MemberTable
      title="Members"
      summaryTitle="List of All Members"
      showEdit
      showView
      data={memberdata}
      isLoading={isLoading}
    />
  );
};

export const ActiveMembers = () => {
  const { memberdata, isLoading } = useMembers("active")
  return (
    <MemberTable
      title="Active Members"
      summaryTitle="List of Active Members"
      showView
      data={memberdata}
      isLoading={isLoading}
    />
  )
}

export const InActiveMembers = () => {
  const { memberdata, isLoading } = useMembers("Inactive")
  return (
    <MemberTable
      title="Inactive Members"
      summaryTitle="List of Inactive Members"
      showView
      data={memberdata}
      isLoading={isLoading}
    />
  )
}

export const PendingMembers = () => {
  const { memberdata, isLoading } = useMembers("Pending");
  const { mutate: activatePackage, isPending: isActivating } = useActivatePackage();

  const packageOptions = [
    { label: 'None (No Package)', value: 'NONE' },
    { label: '1000 Package', value: '1000' },
    { label: '2000 Package', value: '2000' },
    { label: '5000 Package', value: '5000' },
    { label: '10000 Package', value: '10000' },
    { label: '25000 Package', value: '25000' },
    { label: '50000 Package', value: '50000' },
    { label: '100000 Package', value: '100000' },
    { label: '250000 Package', value: '250000' },
    { label: '500000 Package', value: '500000' },
    { label: '1000000 Package', value: '1000000' },
    { label: '2500000 Package', value: '2500000' },
  ];

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [packageAmount, setPackageAmount] = useState<string>('');
  const [activationType, setActivationType] = useState<'with' | 'without'>('with');

  const handleActivateClick = (member: any) => {
    setSelectedMember(member);
    // Don't pre-fill package amount to ensure "Select Package" is shown
    setPackageAmount('');
    setActivationType('with');
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedMember) return;

    if (activationType === 'without') {
      activatePackage(
        { memberId: selectedMember.Member_id, packageType: 'NONE' },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setSelectedMember(null);
            setPackageAmount('');
            toast.success(`${selectedMember.Name} activated successfully without a package.`);
          },
          onError: () => {
            setDialogOpen(false);
          },
        }
      );
      return;
    }

    const amt = Number(packageAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid package amount or select None.');
      return;
    }

    const packageType = `BMS_${amt}`;

    activatePackage(
      { memberId: selectedMember.Member_id, packageType },
      {
        onSuccess: () => {
          // if (response.success) {
          //   toast.success(`${selectedMember.Name} activated successfully!`);
          // }
          setDialogOpen(false);
          setSelectedMember(null);
          setPackageAmount('');
        },
        onError: () => {
          setDialogOpen(false);
        },
      }
    );
  };

  const primaryColor = '#0a2558';

  return (
    <>
      <MemberTable
        title="Pending Members"
        summaryTitle="List of Pending Members"
        data={memberdata}
        showActivate={true}
        isLoading={isLoading}
        onActivate={handleActivateClick}
        isActivating={isActivating}
      />

      {/* ── Activation Confirmation Dialog ── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !isActivating && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: primaryColor, color: '#fff', fontWeight: 600 }}>
          Confirm Member Activation
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {/* Member Details */}
          <Box sx={{ backgroundColor: '#f5f7fa', borderRadius: 2, p: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Member Details
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Member ID</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.Member_id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Name</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.Name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Mobile</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.mobileno}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Package Amount</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {selectedMember?.package_value
                    ? `₹${selectedMember.package_value}`
                    : selectedMember?.spackage
                      ? `₹${selectedMember.spackage}`
                      : '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Sponsor</Typography>
                <Typography variant="body2" fontWeight={600}>{selectedMember?.Sponsor_name ?? '-'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Current Status</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#FFC000' }}>
                  {selectedMember?.status}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Activation Type Selection */}
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, color: primaryColor, mb: 1 }}>Activation Type</FormLabel>
            <RadioGroup
              row
              value={activationType}
              onChange={(e) => setActivationType(e.target.value as 'with' | 'without')}
            >
              <FormControlLabel
                value="with"
                control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                label={<Typography variant="body2" fontWeight={600}>With Package</Typography>}
              />
              <FormControlLabel
                value="without"
                control={<Radio sx={{ color: primaryColor, '&.Mui-checked': { color: primaryColor } }} />}
                label={<Typography variant="body2" fontWeight={600}>Without Package</Typography>}
              />
            </RadioGroup>
          </FormControl>

          {/* Editable Package Amount */}
          {activationType === 'with' && (
            <Autocomplete
              freeSolo
              options={packageOptions}
              getOptionLabel={(option: any) => (typeof option === 'string' ? option : option.label)}
              value={packageOptions.find(o => o.value === packageAmount) || packageAmount}
              onChange={(_, newValue: any) => {
                if (typeof newValue === 'string') {
                  setPackageAmount(newValue);
                } else if (newValue && newValue.value) {
                  setPackageAmount(newValue.value);
                } else {
                  setPackageAmount('');
                }
              }}
              onInputChange={(_, newInputValue) => {
                // If it looks like one of our options, find it
                const matched = packageOptions.find(o => o.label === newInputValue);
                if (matched) {
                  setPackageAmount(matched.value);
                } else {
                  setPackageAmount(newInputValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Package"
                  fullWidth
                  placeholder="e.g. 1000"
                  helperText="Select a standard package or type a custom amount"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: primaryColor },
                      '&:hover fieldset': { borderColor: primaryColor },
                      '&.Mui-focused fieldset': { borderColor: primaryColor },
                    },
                  }}
                />
              )}
            />
          )}

        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            disabled={isActivating}
            variant="outlined"
            sx={{ borderColor: '#ccc', color: '#555' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isActivating}
            variant="contained"
            startIcon={isActivating ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <CheckCircle />}
            sx={{
              backgroundColor: primaryColor,
              '&:hover': { backgroundColor: '#081d47' },
              '&:disabled': { backgroundColor: '#ccc' },
            }}
          >
            {isActivating ? 'Activating...' : 'Confirm Activation'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const PermissionsMembers = () => {
  const { data: members, isLoading } = useGetAllMembersDetails();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateMemberStatus();

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string, name: string, currentStatus: string } | null>(null);

  const handleToggleClick = (memberId: string, currentStatus: string, name: string) => {
    setSelectedMember({ id: memberId, name: name, currentStatus });
    setConfirmOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!selectedMember) return;

    const newStatus = selectedMember.currentStatus === 'active' ? 'Inactive' : 'active';
    updateStatus({ memberId: selectedMember.id, status: newStatus }, {
      onSuccess: () => {
        toast.success(`Member status updated to ${newStatus}`);
        setConfirmOpen(false);
        setSelectedMember(null);
      },
      onError: () => {
        setConfirmOpen(false);
      }
    });
  };

  // Update handleToggleStatus wrapper for the column definition
  const onToggleRequest = (memberId: string, currentStatus: string) => {
    const member = filteredData.find(m => m.Member_id === memberId);
    handleToggleClick(memberId, currentStatus, member?.Name || 'Member');
  };

  // Filter members who are "ROI Active" (have a package)
  const filteredData = Array.isArray(members)
    ? members.filter((member: any) => member.upgrade_status === 'Active' || member.package_value > 0)
      .map((member: any, index: number) => ({
        ...member,
        sNo: index + 1,
      }))
    : [];

  return (
    <>
      <Grid className="filter-container" sx={{ margin: '2rem', mt: 2 }}>
        <Typography variant="h4">Member Permissions</Typography>
      </Grid>
      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#0a2558',
                color: '#fff',
                '& .MuiSvgIcon-root': { color: '#fff' }
              }}
            >
              List of ROI Active Members
            </AccordionSummary>
            <AccordionDetails>
              <DataTable
                columns={getPermissionsColumns(onToggleRequest, isUpdating)}
                data={filteredData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                progressPending={isLoading}
                progressComponent={
                  <CircularProgress size={"4rem"} sx={{ color: "#0a2558" }} />
                }
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>

      {/* ── Status Toggle Confirmation Dialog (Modern) ── */}
      <Dialog
        open={confirmOpen}
        onClose={() => !isUpdating && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'visible'
          }
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 2 }}>
          {/* Top Icon Circle */}
          <Box sx={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            backgroundColor: selectedMember?.currentStatus === 'active' ? '#fff0f0' : '#f0fff4',
            color: selectedMember?.currentStatus === 'active' ? '#ff4d4d' : '#2ecc71',
            boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
          }}>
            {selectedMember?.currentStatus === 'active' ?
              <WarningAmber sx={{ fontSize: '40px' }} /> :
              <CheckCircle sx={{ fontSize: '40px' }} />
            }
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e', mb: 1.5 }}>
            {selectedMember?.currentStatus === 'active' ? 'Disable Member?' : 'Enable Member?'}
          </Typography>

          <Typography variant="body1" sx={{ color: '#5f6368', px: 2, mb: 4, lineHeight: 1.6 }}>
            Are you sure you want to {selectedMember?.currentStatus === 'active' ? 'deactivate' : 'activate'}{' '}
            <strong>{selectedMember?.name}</strong>?
            <br />
            <Box component="span" sx={{ fontSize: '0.9rem', opacity: 0.8, mt: 1, display: 'block' }}>
              {selectedMember?.currentStatus === 'active'
                ? 'This action will pause all financial ROI benefits for this account.'
                : 'This will resume all financial ROI benefits and access for this account.'}
            </Box>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, width: '100%', px: 2 }}>
            <Button
              fullWidth
              onClick={() => setConfirmOpen(false)}
              disabled={isUpdating}
              variant="outlined"
              sx={{
                borderRadius: '12px',
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#e0e0e0',
                color: '#5f6368',
                '&:hover': { backgroundColor: '#f8f9fa', borderColor: '#d0d0d0' }
              }}
            >
              No, Keep it
            </Button>
            <Button
              fullWidth
              onClick={handleConfirmToggle}
              disabled={isUpdating}
              variant="contained"
              sx={{
                borderRadius: '12px',
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                backgroundColor: selectedMember?.currentStatus === 'active' ? '#ff4d4d' : '#2ecc71',
                '&:hover': {
                  backgroundColor: selectedMember?.currentStatus === 'active' ? '#e60000' : '#27ae60',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
            >
              {isUpdating ? <CircularProgress size={24} color="inherit" /> : `Yes, ${selectedMember?.currentStatus === 'active' ? 'Disable' : 'Enable'}`}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default Members;

