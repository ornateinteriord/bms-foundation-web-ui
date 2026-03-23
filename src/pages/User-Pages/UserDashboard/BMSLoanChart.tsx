import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box
} from '@mui/material';

const BMSLoanChart = () => {
    const loanData = [
        { amount: '5,000', deduction: '250', cashLoan: '4,750', repayment: '500', weeks: '10 Weeks', rdPlanning: '600 & 1200' },
        { amount: '10,000', deduction: '600', cashLoan: '9,400', repayment: '1000', weeks: '10 Weeks', rdPlanning: '600 & 1200' },
        { amount: '25,000', deduction: '2500', cashLoan: '22,500', repayment: '1000', weeks: '25 Weeks', rdPlanning: '1200' },
        { amount: '50,000', deduction: '5000', cashLoan: '45,000', repayment: '1000', weeks: '50 Weeks', rdPlanning: '1200' },
        { amount: '1,00,000', deduction: '15000', cashLoan: '85,000', repayment: '2000', weeks: '50 Weeks', rdPlanning: '1200' },
    ];

    const headerCells = [
        'Loan Amount', 'Dediction Int.', 'Cash Loan', 'Loan Repayment Week', 'No. of Weeks', 'R.D. Planning'
    ];

    return (
        <Box sx={{
            mt: 4,
            mb: 3,
            mx: { xs: 2, sm: 3, md: 4 },
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid #dde3f0',
        }}>
            {/* Chart Title */}
            <Box sx={{
                background: 'linear-gradient(135deg, #0a2558 0%, #153b93 100%)',
                py: 2,
                px: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
            }}>
                <Typography variant="h6" sx={{
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '1px',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                }}>
                    📊 BMS LOAN CHART
                </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                <Table sx={{ minWidth: 500 }} aria-label="bms loan chart">
                    <TableHead>
                        <TableRow>
                            {headerCells.map((cell) => (
                                <TableCell
                                    key={cell}
                                    sx={{
                                        background: 'linear-gradient(135deg, #0a2558 0%, #1d40af 100%)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        textAlign: 'center',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        py: 1.8,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {cell}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loanData.map((row, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <TableRow
                                    key={row.amount}
                                    sx={{
                                        backgroundColor: isEven ? '#fff' : '#ffe4e6',
                                        '&:hover': {
                                            backgroundColor: '#fecdd3',
                                            transition: 'background-color 0.2s ease'
                                        }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#dc2626', textAlign: 'center', border: '1px solid #fecdd3', fontSize: '0.95rem' }}>
                                        {row.amount}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center', border: '1px solid #fecdd3' }}>
                                        {row.deduction}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center', border: '1px solid #fecdd3' }}>
                                        {row.cashLoan}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#15803d', textAlign: 'center', border: '1px solid #fecdd3', fontSize: '0.95rem' }}>
                                        {row.repayment}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151', textAlign: 'center', border: '1px solid #fecdd3' }}>
                                        {row.weeks}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#0a2558', textAlign: 'center', border: '1px solid #fecdd3' }}>
                                        {row.rdPlanning}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BMSLoanChart;
