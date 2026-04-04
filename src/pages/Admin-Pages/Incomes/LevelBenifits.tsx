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
  CircularProgress
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import {
  DASHBOARD_CUTSOM_STYLE,
  getAdminAggregatedIncomeColumns,
} from "../../../utils/DataTableColumnsProvider";
import { useGetAllTransactionDetails } from '../../../api/Admin';

const LevelBenifits = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Use the same transaction hook and filter for level benefits
  const { data: allTransactions, isLoading, isError } = useGetAllTransactionDetails();

  // Filter transactions to get only level benefits
  const levelBenefits = allTransactions?.filter((transaction: any) => {
    const isLevel = (
      transaction.type === 'level_benefit' ||
      transaction.transactionType === 'level' ||
      transaction.category === 'level_benefits' ||
      transaction.description?.toLowerCase().includes('level')
    );
    const isROI = transaction.description?.toLowerCase().includes('roi') || 
                  transaction.type?.toLowerCase().includes('roi') || 
                  transaction.transactionType?.toLowerCase().includes('roi');
    
    return isLevel && !isROI;
  }) || [];

  // Aggregate level benefits by user
  const aggregatedData = levelBenefits.reduce((acc: any, curr: any) => {
    const memberId = curr.member_id || curr.related_member_id || 'N/A';
    if (!acc[memberId]) {
      acc[memberId] = {
        member_id: memberId,
        name: curr.Name || curr.name || curr.memberName || curr.member_name || '-',
        totalAmount: 0,
      };
    }
    acc[memberId].totalAmount += parseFloat(curr.ew_credit || curr.amount || 0);
    return acc;
  }, {});

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
      <Typography variant="h4" sx={{ margin: "2rem", mt: 10 }}>
        Level Benefits
      </Typography>
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
              List of Level Benefits
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

export default LevelBenifits;