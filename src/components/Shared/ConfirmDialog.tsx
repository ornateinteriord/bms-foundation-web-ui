import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'error' | 'primary' | 'secondary' | 'success' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'error',
}) => {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleConfirm();
        } else if (event.key === 'Escape') {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            onKeyDown={handleKeyPress}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pb: 2
            }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: confirmColor === 'error' ? '#fee2e2' : '#e0f2fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <WarningAmberIcon
                        sx={{
                            color: confirmColor === 'error' ? '#dc2626' : '#0284c7',
                            fontSize: 28
                        }}
                    />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                    {title}
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                        borderColor: '#d1d5db',
                        color: '#6b7280',
                        '&:hover': {
                            borderColor: '#9ca3af',
                            backgroundColor: '#f9fafb'
                        }
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    color={confirmColor}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        px: 3,
                    }}
                    autoFocus
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
