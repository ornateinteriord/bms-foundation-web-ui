import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import SearchIcon from '@mui/icons-material/Search';
import { DASHBOARD_CUTSOM_STYLE } from './DataTableColumnsProvider';

interface ExportableTableProps {
  columns: any[];
  data: any[];
  title?: string;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  paginationPerPage?: number;
  paginationRowsPerPageOptions?: number[];
  customStyles?: any;
  sx?: any;
}

const ExportableTable: React.FC<ExportableTableProps> = ({
  columns,
  data,
  title,
  isLoading = false,
  searchQuery = '',
  onSearchChange,
  paginationPerPage = 25,
  paginationRowsPerPageOptions = [25, 50, 100],
  customStyles = DASHBOARD_CUTSOM_STYLE,
  sx = {}
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handlePrint = () => {
    console.log('Print clicked');
  };

  const handleCopy = () => {
    console.log('Copy clicked');
  };

  const handlePDF = () => {
    console.log('PDF clicked');
  };

  const handleCSV = () => {
    console.log('CSV clicked');
  };

  const handleColumns = () => {
    console.log('Columns clicked');
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {title && (
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
          {title}
        </Typography>
      )}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{
              color: '#666',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            PRINT
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            sx={{
              color: '#e91e63',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#e91e63',
                backgroundColor: '#fce4ec'
              }
            }}
          >
            COPY
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePDF}
            sx={{
              color: '#2196f3',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#2196f3',
                backgroundColor: '#e3f2fd'
              }
            }}
          >
            PDF
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<TableChartIcon />}
            onClick={handleCSV}
            sx={{
              color: '#4caf50',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#4caf50',
                backgroundColor: '#e8f5e8'
              }
            }}
          >
            Excel
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewColumnIcon />}
            onClick={handleColumns}
            sx={{
              color: '#ff9800',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#ff9800',
                backgroundColor: '#fff3e0'
              }
            }}
          >
            COLUMNS
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#666', minWidth: 'fit-content' }}>
            Search:
          </Typography>
          <TextField
            size="small"
            value={localSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#042f2e ',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#042f2e ',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#666', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        data={data}
        pagination
        customStyles={customStyles}
        paginationPerPage={paginationPerPage}
        paginationRowsPerPageOptions={paginationRowsPerPageOptions}
        progressPending={isLoading}
        progressComponent={
          <CircularProgress size="4rem" sx={{ color: "#042f2e " }} />
        }
        highlightOnHover
        pointerOnHover
        noDataComponent={<div>No data available</div>}
      />
    </Box>
  );
};

export default ExportableTable;
