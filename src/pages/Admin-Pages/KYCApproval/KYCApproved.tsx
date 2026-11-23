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
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useGetKYCSubmissions } from '../../../api/Admin';
import { exportToExcel } from '../../../utils/excelExport';

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

const KYCApproved: React.FC = () => {
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Fetch approved KYC submissions
  const { data: kycResponse, isLoading } = useGetKYCSubmissions('APPROVED', '', 1, 5000);
  const kycSubmissions: KYCSubmission[] = kycResponse?.data || [];

  // Client-side filtering by search term
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

  // Paginated records
  const paginatedSubmissions = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSubmissions.slice(start, start + rowsPerPage);
  }, [filteredSubmissions, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Export to Excel function
  const handleExportToExcel = () => {
    if (filteredSubmissions.length === 0) {
      alert('No approved KYC records to export');
      return;
    }

    const exportData = filteredSubmissions.map((sub, index) => ({
      slNo: index + 1,
      memberInfo: `${sub.Member_id}(${sub.Name || ''})`,
      Member_id: sub.Member_id || 'N/A',
      Name: sub.Name || 'N/A',
      mobileno: sub.mobileno || 'N/A',
      email: sub.email || 'N/A',
      bank_name: sub.bank_name || 'N/A',
      account_number: sub.account_number || 'N/A',
      ifsc_code: sub.ifsc_code || 'N/A',
      Pan_no: sub.Pan_no || 'N/A',
      address: sub.address || 'N/A',
      kycStatus: sub.kycStatus || 'APPROVED',
      approvedDate: sub.updatedAt ? new Date(sub.updatedAt).toLocaleDateString() : 'N/A',
    }));

    exportToExcel({
      fileName: `KYC_Approved_Members_${new Date().toISOString().split('T')[0]}`,
      title: 'BMS Foundation - KYC Approved Members List',
      columns: [
        { header: 'SL No', key: 'slNo', width: 8 },
        { header: 'Member (ID & Name)', key: 'memberInfo', width: 26 },
        { header: 'Member ID', key: 'Member_id', width: 16 },
        { header: 'Name', key: 'Name', width: 22 },
        { header: 'Mobile Number', key: 'mobileno', width: 16 },
        { header: 'Email ID', key: 'email', width: 26 },
        { header: 'Bank Name', key: 'bank_name', width: 22 },
        { header: 'Account Number', key: 'account_number', width: 20 },
        { header: 'IFSC Code', key: 'ifsc_code', width: 15 },
        { header: 'PAN Number', key: 'Pan_no', width: 16 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Status', key: 'kycStatus', width: 14 },
        { header: 'Approved Date', key: 'approvedDate', width: 16 },
      ],
      data: exportData,
      statusField: 'kycStatus',
    });
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
            <CheckCircleIcon sx={{ color: '#16a34a', fontSize: { xs: 28, sm: 32 } }} />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: '#0a2558',
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                }}
              >
                KYC Approved
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                Profiles approved by admin
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
            }}
          >
            <Chip
              label={`Approved: ${filteredSubmissions.length}`}
              color="success"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportToExcel}
              disabled={isLoading || filteredSubmissions.length === 0}
              sx={{
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                '&:hover': { backgroundColor: '#15803d' },
              }}
            >
              Export to Excel
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search Member ID, Name, Phone, Account, PAN..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '50px', whiteSpace: 'nowrap' }}>#</TableCell>
                {/* User specified: member id and name show in single row like BMS000092(ramesh ) */}
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Member (ID & Name)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Contact</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Account Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>IFSC Code</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Bank Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>PAN Number</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Approved Date</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} sx={{ textAlign: 'center', py: 5 }}>
                    <CircularProgress size={32} />
                    <Typography sx={{ mt: 1, fontSize: '0.875rem' }}>Loading approved records...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} sx={{ textAlign: 'center', py: 5 }}>
                    <Typography color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                      {searchTerm ? 'No approved KYC records match your search' : 'No approved KYC records found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((submission: KYCSubmission, index: number) => (
                  <TableRow
                    key={submission._id}
                    hover
                    sx={{
                      '&:nth-of-type(even)': { backgroundColor: '#f8fafc' },
                      '& .MuiTableCell-root': { py: { xs: 1, sm: 1.5 }, px: { xs: 1.25, sm: 2 } },
                    }}
                  >
                    <TableCell sx={{ fontWeight: '500', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    {/* Member ID and Name in single row: BMS000092(ramesh ) */}
                    <TableCell sx={{ fontWeight: 'bold', color: '#0a2558', whiteSpace: 'nowrap' }}>
                      {submission.Member_id}({submission.Name || 'N/A'})
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {submission.mobileno || 'N/A'}
                      </Typography>
                      {submission.email && (
                        <Typography variant="caption" color="textSecondary" display="block">
                          {submission.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: '500', whiteSpace: 'nowrap' }}>
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
                        label="Approved"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 'bold', fontSize: '0.725rem', height: 22 }}
                      />
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.825rem' }}>
                      {submission.updatedAt ? new Date(submission.updatedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <Tooltip title="View Profile & Documents">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedKYC(submission);
                            setOpenDialog(true);
                          }}
                          sx={{
                            backgroundColor: '#e0e7ff',
                            color: '#1e3a8a',
                            '&:hover': { backgroundColor: '#c7d2fe' },
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredSubmissions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            mt: 1,
            '.MuiTablePagination-toolbar': {
              px: { xs: 0, sm: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' },
            },
          }}
        />
      </CardContent>

      {/* Profile & Document Details Dialog (Responsive) */}
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
          Approved KYC Profile Details
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          {selectedKYC && (
            <Box sx={{ py: 0.5 }}>
              {/* Member Summary Box */}
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
                    {selectedKYC.Member_id}({selectedKYC.Name})
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                    Phone: {selectedKYC.mobileno} | Email: {selectedKYC.email || 'N/A'}
                  </Typography>
                </Box>
                <Chip label="KYC Approved" color="success" size="small" sx={{ fontWeight: 'bold' }} />
              </Box>

              {/* Bank & Identification Information */}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0a2558', mb: 1 }}>
                Bank & Identification Details
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
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Approved Date
                  </Typography>
                  <Typography variant="body2">
                    {selectedKYC.updatedAt ? new Date(selectedKYC.updatedAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>

              {/* Uploaded Documents */}
              {(selectedKYC.panImage || selectedKYC.aadhaarImage || selectedKYC.passbookImage || selectedKYC.checkImage) && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0a2558', mb: 1 }}>
                    Verified Documents
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
                      gap: 1.5,
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
                            sx={{ maxHeight: { xs: 80, sm: 110 }, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
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
                            sx={{ maxHeight: { xs: 80, sm: 110 }, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
                          />
                        </a>
                      </Box>
                    )}
                    {selectedKYC.passbookImage && (
                      <Box sx={{ border: '1px solid #e2e8f0', p: 1, borderRadius: 1, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontSize: '0.75rem' }}>
                          Bank Passbook
                        </Typography>
                        <a href={selectedKYC.passbookImage} target="_blank" rel="noopener noreferrer">
                          <Box
                            component="img"
                            src={selectedKYC.passbookImage}
                            alt="Passbook"
                            sx={{ maxHeight: { xs: 80, sm: 110 }, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
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
                            sx={{ maxHeight: { xs: 80, sm: 110 }, maxWidth: '100%', objectFit: 'contain', cursor: 'pointer' }}
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
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#0a2558',
              '&:hover': { backgroundColor: '#581c87' },
              maxWidth: { sm: 140 },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default KYCApproved;
