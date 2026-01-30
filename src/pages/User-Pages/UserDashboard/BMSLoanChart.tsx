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
        { amount: '5,000', deduction: '250', cashLoan: '4,750', repayment: '500', weeks: '10 Weeks' },
        { amount: '10,000', deduction: '600', cashLoan: '9,400', repayment: '1000', weeks: '10 Weeks' },
        { amount: '25,000', deduction: '2500', cashLoan: '22,500', repayment: '1000', weeks: '25 Weeks' },
        { amount: '50,000', deduction: '5000', cashLoan: '45,000', repayment: '1000', weeks: '50 Weeks' },
        { amount: '1,00,000', deduction: '15000', cashLoan: '85,000', repayment: '2000', weeks: '50 Weeks' },
    ];

    return (
        <Box sx={{
            mt: 4,
            mb: 2,
            mx: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
            overflow: 'hidden',
            background: 'linear-gradient(90deg, rgba(0,8,49,0.8) 0%, rgba(94,59,214,0.8) 100%)',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
            <Typography
                variant="h5"
                sx={{
                    p: 2,
                    fontWeight: 'bold',
                    color: '#fff',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    background: 'linear-gradient(90deg, rgba(0,8,49,0.8) 0%, rgba(94,59,214,0.8) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                BMS LOANS
            </Typography>
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Table sx={{ minWidth: 650 }} aria-label="bms loan chart">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(0, 8, 49, 0.9)' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loan Amount</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Deduction Int.</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cash Loan</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Loan Repayment Week</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>No. of Weeks</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loanData.map((row, index) => (
                            <TableRow
                                key={row.amount}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        transition: 'background-color 0.3s'
                                    }
                                }}
                            >
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    {row.amount}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>{row.deduction}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>{row.cashLoan}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>{row.repayment}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>{row.weeks}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BMSLoanChart;
