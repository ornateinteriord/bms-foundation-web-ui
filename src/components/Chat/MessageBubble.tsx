import React, { useState } from 'react';
import { Message } from '../../hooks/useChatSocket';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, Download, FileText } from 'lucide-react';
import { styled } from '@mui/material/styles';
import ImageLightbox from './ImageLightbox';

interface MessageBubbleProps {
    message: Message;
    isSent: boolean;
    showAvatar?: boolean;
    showTimestamp?: boolean;
}

const SentBubble = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: '16px',
    borderBottomRightRadius: '4px',
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: '#fff',
    maxWidth: '70%',
    minWidth: 'fit-content',
    wordBreak: 'break-word',
    boxShadow: theme.shadows[1],
}));

const ReceivedBubble = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    borderRadius: '16px',
    borderBottomLeftRadius: '4px',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.background.paper,
    color: theme.palette.text.primary,
    maxWidth: '70%',
    minWidth: 'fit-content',
    wordBreak: 'break-word',
    boxShadow: theme.shadows[1],
    border: `1px solid ${theme.palette.divider}`,
}));

const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isSent,
    showTimestamp = true,
}) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const formatTime = (date: Date | string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const handleDownload = (url: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const BubbleComponent = isSent ? SentBubble : ReceivedBubble;
    const isImage = message.messageType === 'image' && message.imageUrl;
    const isFile = message.messageType === 'file' && message.imageUrl;

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSent ? 'flex-end' : 'flex-start',
                    mb: 1,
                    px: 1,
                }}
            >
                {/* Message Content */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSent ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                    }}
                >

                    {/* Message Bubble */}
                    <BubbleComponent elevation={1}>
                        {/* Image Attachment */}
                        {isImage && (
                            <Box
                                sx={{
                                    mb: message.text ? 1 : 0,
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}
                                onClick={() => setLightboxOpen(true)}
                            >
                                <Box
                                    component="img"
                                    src={message.imageUrl}
                                    alt="Image"
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: 250,
                                        borderRadius: 1,
                                        display: 'block',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {/* File Attachment */}
                        {isFile && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 1,
                                    mb: message.text ? 1 : 0,
                                    borderRadius: 1,
                                    bgcolor: isSent ? 'rgba(255,255,255,0.15)' : 'action.hover',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: isSent ? 'rgba(255,255,255,0.2)' : 'primary.main',
                                        color: isSent ? 'white' : 'white',
                                    }}
                                >
                                    <FileText size={20} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{ fontWeight: 500, color: isSent ? 'white' : 'text.primary' }}
                                    >
                                        {message.fileName || 'Document'}
                                    </Typography>
                                    {message.fileSize && (
                                        <Typography
                                            variant="caption"
                                            sx={{ color: isSent ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}
                                        >
                                            {formatFileSize(message.fileSize)}
                                        </Typography>
                                    )}
                                </Box>
                                <IconButton
                                    size="small"
                                    onClick={() => handleDownload(message.imageUrl!, message.fileName || 'document')}
                                    sx={{
                                        color: isSent ? 'white' : 'primary.main',
                                        '&:hover': {
                                            bgcolor: isSent ? 'rgba(255,255,255,0.2)' : 'action.hover',
                                        },
                                    }}
                                >
                                    <Download size={18} />
                                </IconButton>
                            </Box>
                        )}

                        {/* Message Text */}
                        {message.text && (
                            <Typography
                                variant="body2"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.5,
                                    display: 'inline',
                                }}
                            >
                                {message.text}
                            </Typography>
                        )}

                        {/* Legacy imageUrl support (for old text messages with images) */}
                        {!isImage && !isFile && message.imageUrl && (
                            <Box
                                component="img"
                                src={message.imageUrl}
                                alt="Attachment"
                                sx={{
                                    mt: 1,
                                    borderRadius: 1,
                                    maxWidth: '100%',
                                    height: 'auto',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setLightboxOpen(true)}
                            />
                        )}

                        {/* Timestamp and Status */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.5,
                                justifyContent: isSent ? 'flex-end' : 'flex-start',
                            }}
                        >
                            {showTimestamp && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '10px',
                                        color: isSent ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                    }}
                                >
                                    {formatTime(message.createdAt)}
                                </Typography>
                            )}

                            {/* Read Status (only for sent messages) */}
                            {isSent && (
                                <Box sx={{ display: 'flex', color: 'rgba(255,255,255,0.7)' }}>
                                    {message.isRead ? (
                                        <CheckCheck size={12} />
                                    ) : (
                                        <Check size={12} />
                                    )}
                                </Box>
                            )}
                        </Box>
                    </BubbleComponent>
                </Box>
            </Box>

            {/* Image Lightbox */}
            {message.imageUrl && (
                <ImageLightbox
                    open={lightboxOpen}
                    imageUrl={message.imageUrl}
                    onClose={() => setLightboxOpen(false)}
                />
            )}
        </>
    );
};

export default MessageBubble;
