import React from 'react';
import { Box, IconButton, Typography, Paper } from '@mui/material';
import { Close, InsertDriveFile } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface FilePreviewProps {
    file: File | null;
    previewUrl: string | null;
    onRemove: () => void;
}

const PreviewContainer = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(1),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
    border: `1px solid ${theme.palette.divider}`,
}));

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FilePreview: React.FC<FilePreviewProps> = ({ file, previewUrl, onRemove }) => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');

    return (
        <PreviewContainer elevation={0}>
            {/* Preview */}
            {isImage && previewUrl ? (
                <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        objectFit: 'cover',
                        mr: 2,
                    }}
                />
            ) : (
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.main',
                        color: 'white',
                        mr: 2,
                    }}
                >
                    <InsertDriveFile />
                </Box>
            )}

            {/* File Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap fontWeight={500}>
                    {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)}
                </Typography>
            </Box>

            {/* Remove Button */}
            <IconButton
                size="small"
                onClick={onRemove}
                sx={{
                    ml: 1,
                    color: 'error.main',
                    '&:hover': {
                        bgcolor: 'error.light',
                        color: 'white',
                    },
                }}
            >
                <Close fontSize="small" />
            </IconButton>
        </PreviewContainer>
    );
};

export default FilePreview;
