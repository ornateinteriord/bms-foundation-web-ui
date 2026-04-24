import React from "react";
import AdminReusableTable, { ColumnDefinition } from "../../../utils/AdminReusableTable";
import { Box } from "@mui/material";
import { getJournalEntriesColumns } from "../../../utils/DataTableColumnsProvider";

type Journal = {
  date: string;
  journalId: string;
  debitFrom: string;
  creditTo: string;
  amount: number;
};

const sampleData: Journal[] = [
  { date: "2020-03-22", journalId: "23652", debitFrom: "India", creditTo: "Bangalore", amount: 0 },
];

const JournalEntries: React.FC = () => {
  const columns: ColumnDefinition<Journal>[] = getJournalEntriesColumns().map((col: any) => ({
    id: col.id || (col.selector ? String(col.selector).split('.').pop() || '' : ''),
    label: col.name,
    sortable: col.sortable,
    renderCell: col.cell
  }));
  
  return (
     <Box sx={{ p: 3, mt: 8 }}>
      <AdminReusableTable<Journal>
        title="Journal Entries"
        columns={columns}
        data={sampleData}
      />
    </Box>
  );
};

export default JournalEntries;