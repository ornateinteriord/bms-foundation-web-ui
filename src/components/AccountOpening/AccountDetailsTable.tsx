import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableFooter,
  TablePagination,
  TextField,
  Grid,
  Typography,
} from '@mui/material';

interface Column {
  key: string;
  label: string;
}

interface Props {
  title?: string;
  accountType?: string;
  columns?: Column[];
  data?: any[];
}

const defaultColumns: Column[] = [
  { key: 'accountNo', label: 'Account No' },
  { key: 'accountHolder', label: 'Account Holder' },
  { key: 'dateOfOpening', label: 'Date of Opening' },
  { key: 'operation', label: 'Operation' },
  { key: 'balance', label: 'Balance' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

const AccountDetailsTable: React.FC<Props> = ({ title = 'Account Details', columns = defaultColumns, data = [] }) => {
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    if (!search && !fromDate && !toDate) return data;
    const s = search.toLowerCase();
    return data.filter((d: any) => {
      const text = Object.values(d).join(' ').toLowerCase();
      if (s && !text.includes(s)) return false;
      // date filter (if dateOfOpening is present)
      if (fromDate || toDate) {
        const dt = d.dateOfOpening || '';
        if (dt) {
          const dd = new Date(dt);
          if (fromDate && dd < new Date(fromDate)) return false;
          if (toDate && dd > new Date(toDate)) return false;
        }
      }
      return true;
    });
  }, [data, search, fromDate, toDate]);

  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: any) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ mt: 9, px: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>{title}</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <Button variant="outlined">Excel</Button>
          </Grid>
          <Grid item xs={12} md={6} />
          <Grid item xs={12} md={2}>
            <TextField size="small" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField size="small" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} fullWidth />
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="contained">Print</Button>
          <TextField size="small" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.key}>{c.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">No data available in table</TableCell>
                </TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any, idx: number) => (
                  <TableRow key={idx}>
                    {columns.map((c) => (
                      <TableCell key={c.key}>{row[c.key]}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  count={filtered.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5,10,25,50]}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AccountDetailsTable;
