import DataTable from 'react-data-table-component';
import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DASHBOARD_CUTSOM_STYLE, getLevelBenifitsColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetROIBenefits } from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';

const ROIBenefits = () => {
  const memberId = TokenService.getMemberId();
  const {
    data: roiBenefitsData,
    isLoading,
    isError,
    error,
  } = useGetROIBenefits(memberId);

  const benefits = Array.isArray(roiBenefitsData) ? roiBenefitsData : [];

  const processedData = benefits.map((transaction: any) => {
    // Helper for ordinal numbers (1st, 2nd, etc.)
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const levelStr = transaction.level 
      ? `${getOrdinal(transaction.level)} Level Benefit` 
      : 'N/A';

    return {
      id: transaction._id || transaction.transaction_id,
      date: transaction.transaction_date,
      payoutLevel: levelStr,
      members: transaction.related_member_id || 'N/A',
      amount: transaction.ew_credit || '0',
      description: transaction.description,
      transactionType: transaction.transaction_type
    };
  });

  const noDataComponent = (
    <div style={{ padding: '24px' }}>
      No ROI benefits data available
    </div>
  );

  if (isError) {
    return (
      <Card sx={{ margin: '2rem', mt: 10 }}>
        <CardContent>
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            Error loading ROI benefits data: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ margin: '2rem', mt: 10 }}>
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
            List of ROI Benefits ({processedData.length})
          </AccordionSummary>
          <AccordionDetails>
            <DataTable
              columns={getLevelBenifitsColumns()}
              data={processedData}
              pagination
              customStyles={DASHBOARD_CUTSOM_STYLE}
              paginationPerPage={25}
              paginationRowsPerPageOptions={[25, 50, 100]}
              noDataComponent={noDataComponent}
              highlightOnHover
              progressPending={isLoading}
              subHeader
              subHeaderComponent={
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: '0.5rem' }}>
                  <TextField
                    placeholder="Search"
                    variant="outlined"
                    size="small"
                  />
                </div>
              }
            />
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ROIBenefits;
