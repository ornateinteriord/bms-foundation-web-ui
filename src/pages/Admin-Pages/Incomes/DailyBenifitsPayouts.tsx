import { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Button
} from "@mui/material";
import SyncIcon from '@mui/icons-material/Sync';

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import {
  DASHBOARD_CUTSOM_STYLE,
  getAdminAggregatedIncomeColumns,
} from "../../../utils/DataTableColumnsProvider";
import { useGetAllDailyPayouts, useTriggerDailyROI } from '../../../api/Admin';



const DailyROI = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Properly destructure the useQuery return values
  const { data: dailyBenefits, isLoading, isError } = useGetAllDailyPayouts();
  const { mutate: triggerSync, isPending: isSyncing } = useTriggerDailyROI();

  const handleTriggerSync = () => {
    if (window.confirm("Are you sure you want to trigger the ROI payout sync manually? This will process any pending payouts for today.")) {
      triggerSync();
    }
  };

  console.log(dailyBenefits);


  // Handle the data structure from API
  // Aggregate daily benefits by user
  const aggregatedData = dailyBenefits?.reduce((acc: any, curr: any) => {
    const memberId = curr.member_id || curr.related_member_id || 'N/A';
    if (!acc[memberId]) {
      acc[memberId] = {
        member_id: memberId,
        name: curr.name || curr.memberName || curr.member_name || '-',
        totalAmount: 0,
      };
    }
    acc[memberId].totalAmount += parseFloat(curr.ew_credit || curr.amount || 0);
    return acc;
  }, {}) || {};

  const finalData = Object.values(aggregatedData);

  const filteredData = finalData.filter((benefit: any) =>
    Object.values(benefit).some(
      value =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const noDataComponent = (
    <div style={{ padding: "24px" }}>
      {isError ? "Error loading data" : "No data available in table"}
    </div>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: "2rem", mt: 10 }}>
        <Typography variant="h4">
          Daily ROI
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={isSyncing ? <CircularProgress size={20} color="inherit" /> : <SyncIcon />}
          onClick={handleTriggerSync}
          disabled={isSyncing}
          sx={{
            backgroundColor: "#0a2558",
            "&:hover": { backgroundColor: "#1a3568" },
            textTransform: "none",
            borderRadius: "8px",
            px: 3
          }}
        >
          {isSyncing ? "Processing..." : "Trigger ROI Sync"}
        </Button>
      </Box>

      <Card sx={{ margin: "2rem", mt: 2 }}>
        <CardContent>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: "#0a2558",
                color: "#fff",
                "& .MuiSvgIcon-root": { color: "#fff" },
              }}
            >
              Daily ROI Details
            </AccordionSummary>
            <AccordionDetails>
              <Box
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginBottom: "1rem",
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
              </Box>
              <DataTable
                columns={getAdminAggregatedIncomeColumns()}
                data={filteredData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
                noDataComponent={noDataComponent}
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
};

export default DailyROI;
