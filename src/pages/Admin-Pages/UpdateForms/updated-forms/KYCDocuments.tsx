import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Box, Card, CardContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImageIcon from '@mui/icons-material/Image';

interface KYCDocumentsProps {
    formData: Record<string, string>;
}

export const KYCDocuments: React.FC<KYCDocumentsProps> = ({ formData }) => {
    const documents = [
        { url: formData.panImage, label: 'PAN Card', key: 'panImage' },
        { url: formData.aadhaarImage, label: 'Aadhaar Card', key: 'aadhaarImage' },
        { url: formData.checkImage, label: 'Cancelled Cheque', key: 'checkImage' },
        { url: formData.passbookImage, label: 'Bank Passbook', key: 'passbookImage' },
        { url: formData.rationCardImage, label: 'Ration Card', key: 'rationCardImage' },
        { url: formData.profile_image, label: 'Profile Photo', key: 'profile_image' },
    ];

    const uploadedDocs = documents.filter(doc => doc.url);
    const hasDocuments = uploadedDocs.length > 0;

    return (
        <Accordion defaultExpanded sx={{ marginBottom: '1rem' }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    backgroundColor: '#000831',
                    color: '#fff',
                    '& .MuiSvgIcon-root': { color: '#fff' },
                }}
            >
                <Typography sx={{ fontWeight: 'bold' }}>
                    KYC Documents ({uploadedDocs.length}/6)
                </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '2rem' }}>
                {!hasDocuments ? (
                    <Box textAlign="center" py={4}>
                        <ImageIcon sx={{ fontSize: 60, color: '#999', mb: 2 }} />
                        <Typography color="textSecondary">
                            No KYC documents uploaded yet
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {documents.map((doc) => (
                            <Grid item xs={12} sm={6} md={4} key={doc.key}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        opacity: doc.url ? 1 : 0.5,
                                        border: doc.url ? '2px solid #000831' : '1px dashed #ccc',
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="subtitle2"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 'bold',
                                                color: doc.url ? '#000831' : '#999'
                                            }}
                                        >
                                            {doc.label}
                                        </Typography>
                                        {doc.url ? (
                                            <Box
                                                onClick={() => window.open(doc.url, '_blank')}
                                                sx={{
                                                    cursor: 'pointer',
                                                    position: 'relative',
                                                    '&:hover': {
                                                        opacity: 0.8,
                                                    },
                                                }}
                                            >
                                                <img
                                                    src={doc.url}
                                                    alt={doc.label}
                                                    style={{
                                                        width: '100%',
                                                        height: '150px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: 'rgba(0, 0, 0, 0)',
                                                        transition: 'background-color 0.3s',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                        },
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: 'white',
                                                            opacity: 0,
                                                            transition: 'opacity 0.3s',
                                                            '&:hover': {
                                                                opacity: 1,
                                                            },
                                                        }}
                                                    >
                                                        Click to view
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '150px',
                                                    backgroundColor: '#f5f5f5',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="body2" color="textSecondary">
                                                    Not uploaded
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </AccordionDetails>
        </Accordion>
    );
};
