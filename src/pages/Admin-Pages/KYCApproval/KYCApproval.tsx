import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useQueryClient } from '@tanstack/react-query';
import { useApproveKYC, useGetKYCSubmissions } from '../../../api/Admin';

interface KYCSubmission {
  _id: string;
  Member_id: string;
  Name: string;
  mobileno: string;
  email: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  Pan_no: string;
  kycStatus: 'PROCESSING' | 'APPROVED' | 'REJECTED';
  beneficiaryStatus: string;
  beneficiaryId: string;
  address: string;
  panImage?: string;
  aadhaarImage?: string;
  checkImage?: string;
  passbookImage?: string;
  rationCardImage?: string;
  profile_image?: string;
  createdAt: string;
  updatedAt: string;
}

const KYCApproval: React.FC = () => {
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const queryClient = useQueryClient();

  // Fetch KYC submissions (PROCESSING)
  const { data: kycResponse, isLoading } = useGetKYCSubmissions('PROCESSING', '', 1, 500);
  const kycSubmissions: KYCSubmission[] = kycResponse?.data || [];

  // Filter by search
  const filteredSubmissions = useMemo(() => {
    if (!searchTerm.trim()) return kycSubmissions;
    const lower = searchTerm.toLowerCase();
    return kycSubmissions.filter(
      (sub) =>
        sub.Member_id?.toLowerCase().includes(lower) ||
        sub.Name?.toLowerCase().includes(lower) ||
        sub.mobileno?.toLowerCase().includes(lower) ||
        sub.email?.toLowerCase().includes(lower) ||
        sub.account_number?.toLowerCase().includes(lower) ||
        sub.Pan_no?.toLowerCase().includes(lower) ||
        sub.bank_name?.toLowerCase().includes(lower)
    );
  }, [kycSubmissions, searchTerm]);

  // Handle approval
  const approveKYC = useApproveKYC();

  const handleApprove = () => {
    if (selectedKYC) {
      approveKYC.mutate(selectedKYC?.Member_id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['kycSubmissions'] });
          setSnackbar({
            open: true,
            message: `KYC for ${selectedKYC.Member_id} approved successfully`,
            severity: 'success',
          });
          setOpenDialog(false);
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message: error?.response?.data?.message || 'Failed to approve KYC',
            severity: 'error',
          });
        },
      });
    }
  };

  const handleReject = () => {
    setOpenDialog(false);
    setSnackbar({
      open: true,
      message: 'Rejection functionality not implemented yet',
      severity: 'info',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'processing':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        margin: { xs: '0.75rem', sm: '1.25rem', md: '2rem' },
        mt: { xs: 4, sm: 9, md: 10 },
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <VerifiedUserIcon sx={{ color: '#0a2558', fontSize: { xs: 28, sm: 32 } }} />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: '#0a2558',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                KYC Approval
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                Review and approve pending KYC submissions
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Chip
              label={`Pending: ${filteredSubmissions.length}`}
              color="warning"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search Member ID, Name, Phone, Account, PAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: { xs: '100%', sm: 380, md: 450 } }}
          />
        </Box>

        {/* RESPONSIVE TABLE (ONLY TABLE ROWS) */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 1,
            border: '1px solid #e2e8f0',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#0a2558' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Member ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Account Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>IFSC Code</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Bank Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>PAN Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Submitted At</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5 }}>
                    <CircularProgress size={32} />
                    <Typography sx={{ mt: 1, fontSize: '0.875rem' }}>Loading KYC submissions...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                      {searchTerm ? 'No pending KYC submissions match your search' : 'No pending KYC submissions found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission: KYCSubmission) => (
                  <TableRow
                    key={submission._id}
                    hover
                    sx={{
                      '&:nth-of-type(even)': { backgroundColor: '#f8fafc' },
                      '& .MuiTableCell-root': { py: { xs: 1, sm: 1.5 }, px: { xs: 1.25, sm: 2 } },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: '#0a2558', whiteSpace: 'nowrap' }}>
                      {submission.Member_id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: '500', whiteSpace: 'nowrap' }}>{submission.Name}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {submission.account_number || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {submission.ifsc_code || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{submission.bank_name || 'N/A'}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {submission.Pan_no || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Chip
                        label={submission.kycStatus || 'PROCESSING'}
                        color={getStatusColor(submission.kycStatus) as any}
                        size="small"
                        sx={{ fontWeight: 'bold', fontSize: '0.725rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.825rem' }}>
                      {submission.updatedAt ? new Date(submission.updatedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: '#0a2558',
                          textTransform: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.775rem',
                          py: 0.4,
                          px: 1.5,
                          '&:hover': { backgroundColor: '#581c87' },
                        }}
                        onClick={() => {
                          setSelectedKYC(submission);
                          setOpenDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      {/* Details & Review Dialog (Responsive) */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 3 },
            maxHeight: { xs: '92vh', sm: '85vh' },
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#0a2558',
            color: 'white',
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          KYC Submission Details
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {selectedKYC && (
            <Box sx={{ py: 0.5 }}>
              {/* Member Summary */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  mb: 2,
                  backgroundColor: '#f1f5f9',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0a2558', fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                    {selectedKYC.Name} ({selectedKYC.Member_id})
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                    Submitted At: {selectedKYC.updatedAt ? new Date(selectedKYC.updatedAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
                <Chip
                  label={selectedKYC.kycStatus || 'PROCESSING'}
                  color={getStatusColor(selectedKYC.kycStatus) as any}
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              {/* Bank Details */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0a2558', mb: 1 }}>
                Bank & PAN Details
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: { xs: 1.25, sm: 2 },
                  mb: 2,
                  p: { xs: 1.25, sm: 2 },
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Bank Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedKYC.bank_name || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Account Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                    {selectedKYC.account_number || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    IFSC Code
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                    {selectedKYC.ifsc_code || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    PAN Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                    {selectedKYC.Pan_no || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                  <Typography variant="caption" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body2">{selectedKYC.address || 'N/A'}</Typography>
                </Box>
              </Box>

              {/* Uploaded Documents */}
              {(selectedKYC.panImage || selectedKYC.aadhaarImage || selectedKYC.passbookImage || selectedKYC.checkImage) && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0a2558', mb: 1 }}>
                    Uploaded Documents
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    {selectedKYC.panImage && (
                      <Box sx={{ border: '1px solid #e2e8f0', p: 1, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                          PAN Card
                        </Typography>
                        <a href={selectedKYC.panImage} target="_blank" rel="noopener noreferrer">
                          <Box
                            component="img"
                            src={selectedKYC.panImage}
                            alt="PAN Card"
                            sx={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
                          />
                        </a>
                      </Box>
                    )}
                    {selectedKYC.aadhaarImage && (
                      <Box sx={{ border: '1px solid #e2e8f0', p: 1, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                          Aadhaar Card
                        </Typography>
                        <a href={selectedKYC.aadhaarImage} target="_blank" rel="noopener noreferrer">
                          <Box
                            component="img"
                            src={selectedKYC.aadhaarImage}
                            alt="Aadhaar Card"
                            sx={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
                          />
                        </a>
                      </Box>
                    )}
                    {selectedKYC.passbookImage && (
                      <Box sx={{ border: '1px solid #e2e8f0', p: 1, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                          Passbook
                        </Typography>
                        <a href={selectedKYC.passbookImage} target="_blank" rel="noopener noreferrer">
                          <Box
                            component="img"
                            src={selectedKYC.passbookImage}
                            alt="Passbook"
                            sx={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
                          />
                        </a>
                      </Box>
                    )}
                    {selectedKYC.checkImage && (
                      <Box sx={{ border: '1px solid #e2e8f0', p: 1, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                          Cheque Leaf
                        </Typography>
                        <a href={selectedKYC.checkImage} target="_blank" rel="noopener noreferrer">
                          <Box
                            component="img"
                            src={selectedKYC.checkImage}
                            alt="Cheque"
                            sx={{ maxHeight: 90, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
                          />
                        </a>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            fullWidth
            sx={{ maxWidth: { sm: 110 } }}
          >
            Close
          </Button>
          {selectedKYC && selectedKYC.kycStatus === 'PROCESSING' && (
            <>
              <Button
                onClick={handleReject}
                variant="outlined"
                color="error"
                fullWidth
                sx={{ maxWidth: { sm: 110 } }}
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                variant="contained"
                color="success"
                fullWidth
                disabled={approveKYC.isPending}
                sx={{
                  maxWidth: { sm: 140 },
                  fontWeight: 'bold',
                }}
              >
                {approveKYC.isPending ? 'Approving...' : 'Approve KYC'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default KYCApproval;
