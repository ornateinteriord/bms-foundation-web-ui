import React from 'react';
import { Box, IconButton, Modal, Fade } from '@mui/material';
import { Close, Download } from '@mui/icons-material';

interface ImageLightboxProps {
    open: boolean;
    imageUrl: string;
    onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ open, imageUrl, onClose }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'image';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            closeAfterTransition
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Fade in={open}>
                <Box
                    sx={{
                        position: 'relative',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        outline: 'none',
                    }}
                >
                    <IconButton
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            top: -48,
                            right: 0,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                            },
                        }}
                    >
                        <Close />
                    </IconButton>

                    <IconButton
                        onClick={handleDownload}
                        sx={{
                            position: 'absolute',
                            top: -48,
                            right: 48,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.7)',
                            },
                        }}
                    >
                        <Download />
                    </IconButton>

                    <Box
                        component="img"
                        src={imageUrl}
                        alt="Full size"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            borderRadius: 2,
                            boxShadow: 24,
                        }}
                    />
                </Box>
            </Fade>
        </Modal>
    );
};

export default ImageLightbox;
