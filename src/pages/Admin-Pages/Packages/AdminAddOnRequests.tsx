import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Box,
  Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DataTable from 'react-data-table-component';
import { DASHBOARD_CUTSOM_STYLE } from '../../../utils/DataTableColumnsProvider';
import { useGetAddOnRequests, useEvaluateAddOnMutation } from '../../../api/Packages';

const AdminAddOnRequests = () => {
  const { data: requests, isLoading } = useGetAddOnRequests();
  const { mutate: evaluateRequest, isPending: isEvaluating } = useEvaluateAddOnMutation();

  const handleAction = (request_id: string, status: 'APPROVED' | 'REJECTED') => {
    evaluateRequest({
      request_id,
      status,
      admin_id: "ADMIN_OVERRIDE" // Should pull from context in real app, hardcoded safely for now
    });
  };

  const columns = [
    { name: 'Request ID', selector: (row: any) => row.request_id, sortable: true, wrap: true },
    { name: 'Member ID', selector: (row: any) => row.member_id, sortable: true },
    {
      name: 'Amount Requested',
      selector: (row: any) => `₹${row.requested_amount}`,
      sortable: true
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <Chip
          label={row.status}
          color={row.status === 'APPROVED' ? 'success' : row.status === 'REJECTED' ? 'error' : 'warning'}
          size="small"
        />
      ),
      sortable: true
    },
    { name: 'Date', selector: (row: any) => new Date(row.createdAt).toLocaleDateString(), sortable: true },
    {
      name: 'Actions',
      cell: (row: any) => (
        row.status === 'PENDING' ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleAction(row.request_id, 'APPROVED')}
              disabled={isEvaluating}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleAction(row.request_id, 'REJECTED')}
              disabled={isEvaluating}
            >
              Reject
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">Evaluated</Typography>
        )
      ),
      minWidth: '250px'
    }
  ];

  return (
    <>
      <Typography variant="h4" sx={{ margin: '2rem', mt: 10 }}>
        Add-On Package Requests
      </Typography>

      <Card sx={{ margin: '2rem', mt: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#0a2558', mb: 2 }}>
            Manage Member Add-On Approvals
          </Typography>
          <DataTable
            columns={columns}
            data={requests || []}
            pagination
            progressPending={isLoading}
            progressComponent={<CircularProgress />}
            customStyles={DASHBOARD_CUTSOM_STYLE}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default AdminAddOnRequests;
