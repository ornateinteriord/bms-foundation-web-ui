import { forwardRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { toWords } from 'number-to-words';

interface ReceiptPrintProps {
    receiptData: {
        receipt_id: string;
        receipt_date: string | Date;
        received_from: string;
        receipt_details: string;
        mode_of_payment_received: string;
        amount: number;
        branch_code?: string;
        entered_by?: string;
    };
    currentPage?: number;
    totalPages?: number;
}

const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(({ receiptData, currentPage = 1, totalPages = 1 }, ref) => {
    const formatDate = (date: string | Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

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

    const convertAmountToWords = (amount: number): string => {
        try {
            const words = toWords(amount);
            return words.charAt(0).toUpperCase() + words.slice(1) + ' Only';
        } catch {
            return 'Amount conversion error';
        }
    };

    return (
        <Box
            ref={ref}
            sx={{
                position: 'relative',
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                backgroundColor: 'white',
                fontFamily: 'Arial, sans-serif',
                '@media print': {
                    padding: '10mm',
                    margin: 0,
                }
            }}
        >
            {/* Header Section */}
            <Box sx={{ mb: 3 }}>
                {/* Date and Time - Top Left */}
                <Typography variant="body2" sx={{ fontSize: '10px', mb: 2 }}>
                    {getCurrentDateTime()}
                </Typography>

                {/* Society Details - Centered */}
                <Box sx={{ textAlign: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 700, mb: 0.5 }}>
                        Manipal society
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '10px' }}>
                        Bangalore
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '10px' }}>
                        None,560060
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '10px' }}>
                        9100000000
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '10px', mb: 1 }}>
                        mail@manipal.com
                    </Typography>
                </Box>

                <Divider sx={{ my: 2, borderColor: '#000', borderWidth: 1 }} />

                {/* Receipt Voucher Title */}
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: '18px',
                        mb: 2
                    }}
                >
                    Receipt Voucher
                </Typography>

                {/* Receipt Number and Date */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontSize: '11px' }}>
                        No: <strong>{receiptData.receipt_id}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '11px' }}>
                        Dated: <strong>{formatDate(receiptData.receipt_date)}</strong>
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: '#000' }} />
            </Box>

            {/* Main Content Table */}
            <Box sx={{ mb: 3, border: '1px solid #000' }}>
                {/* Table Header */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '3fr 1fr',
                        borderBottom: '1px solid #000'
                    }}
                >
                    <Box sx={{ p: 1, borderRight: '1px solid #000' }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 700 }}>
                            Particulars
                        </Typography>
                    </Box>
                    <Box sx={{ p: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', fontWeight: 700 }}>
                            Amount
                        </Typography>
                    </Box>
                </Box>

                {/* Table Content */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr' }}>
                    <Box sx={{ p: 2, borderRight: '1px solid #000', minHeight: '250px' }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', mb: 1 }}>
                            <strong>Account:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '11px', mb: 3, pl: 2 }}>
                            {receiptData.received_from}
                        </Typography>

                        <Box sx={{ mt: 15 }}>
                            <Typography variant="body2" sx={{ fontSize: '11px', mb: 1 }}>
                                <strong>Through:</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '11px', pl: 2, color: '#d32f2f' }}>
                                {receiptData.mode_of_payment_received}
                            </Typography>

                            <Typography variant="body2" sx={{ fontSize: '11px', mt: 2, mb: 1 }}>
                                <strong>Amount(in words):</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '11px', pl: 2, color: '#d32f2f' }}>
                                * {convertAmountToWords(receiptData.amount)}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', textAlign: 'right' }}>
                            {receiptData.amount.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                {/* Total Row */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '3fr 1fr',
                        borderTop: '1px solid #000'
                    }}
                >
                    <Box sx={{ p: 1, borderRight: '1px solid #000' }}></Box>
                    <Box sx={{ p: 1 }}>
                        <Typography variant="body2" sx={{ fontSize: '11px', textAlign: 'right', fontWeight: 700 }}>
                            {receiptData.amount.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Signature Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8 }}>
                <Box>
                    <Typography variant="body2" sx={{ fontSize: '11px', mb: 1 }}>
                        Receiver's Signature:
                    </Typography>
                    <Box sx={{ width: '150px', height: '40px', borderBottom: '1px solid #000', mt: 4 }}></Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontSize: '11px', mb: 1 }}>
                        Authorised Signatory
                    </Typography>
                    <Box sx={{ width: '150px', height: '40px', borderBottom: '1px solid #000', mt: 4 }}></Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10mm',
                    left: '20mm',
                    right: '20mm',
                    pt: 2,
                    borderTop: '1px solid #ccc',
                    '@media print': {
                        bottom: '5mm',
                        left: '10mm',
                        right: '10mm',
                    }
                }}
            >
                <Typography variant="caption" sx={{ fontSize: '8px', color: '#666' }}>
                    https://manipalsociety.in/Banking/Print/handler.js?name=ReceiptVoucher&receipt={receiptData.receipt_id}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '8px', float: 'right', color: '#666' }}>
                    {currentPage}/{totalPages}
                </Typography>
            </Box>
        </Box>
    );
});

ReceiptPrint.displayName = 'ReceiptPrint';

export default ReceiptPrint;
