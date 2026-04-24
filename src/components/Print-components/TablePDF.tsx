import { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export interface PrintColumn {
    id: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

interface TablePDFProps {
    title: string;
    columns: PrintColumn[];
    data: Record<string, any>[];
    companyName?: string;
    companyDetails?: string;
}

const TablePDF = forwardRef<HTMLDivElement, TablePDFProps>(
    ({ title, columns, data, companyName = 'Manipal society', companyDetails = 'Bangalore | None,560060 | 9100000000 | mail@manipal.com' }, ref) => {

        const getCurrentDateTime = () => {
            const now = new Date();
            return now.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        return (
            <Box
                ref={ref}
                sx={{
                    width: '297mm', // A4 landscape width
                    minHeight: '210mm', // A4 landscape height
                    padding: '15mm',
                    backgroundColor: 'white',
                    fontFamily: 'Arial, sans-serif',
                    '@media print': {
                        padding: '10mm',
                        margin: 0,
                        '@page': {
                            size: 'A4 landscape',
                        }
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontSize: '10px', mb: 2 }}>
                        {getCurrentDateTime()}
                    </Typography>

                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 700, mb: 0.5 }}>
                            {companyName}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '11px' }}>
                            {companyDetails}
                        </Typography>
                    </Box>

                    <Typography
                        variant="h5"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '16px',
                            mb: 1
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                {/* Table */}
                <Table
                    sx={{
                        border: '1px solid #000',
                        '& td, & th': {
                            border: '1px solid #000',
                            padding: '6px',
                            fontSize: '9px'
                        }
                    }}
                >
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                            <TableCell sx={{ fontWeight: 700, width: '5%' }}>S.No</TableCell>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    sx={{
                                        fontWeight: 700,
                                        width: column.width,
                                        textAlign: column.align || 'left'
                                    }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row.id || index}>
                                <TableCell>{index + 1}</TableCell>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{ textAlign: column.align || 'left' }}
                                    >
                                        {row[column.id] ?? '-'}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Footer */}
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
                        Total Records: {data.length}
                    </Typography>
                </Box>

                {/* Page Footer */}
                <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #ccc', textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ fontSize: '8px', color: '#666' }}>
                        Printed on {getCurrentDateTime()}
                    </Typography>
                </Box>
            </Box>
        );
    }
);

TablePDF.displayName = 'TablePDF';

export default TablePDF;
