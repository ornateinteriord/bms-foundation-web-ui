import React from 'react';
import { Message } from '../../hooks/useChatSocket';
import { Box, Typography, Paper } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { styled } from '@mui/material/styles';

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

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isSent,
    showTimestamp = true,
}) => {
    const formatTime = (date: Date | string) => {
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const BubbleComponent = isSent ? SentBubble : ReceivedBubble;

    return (
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
                    {/* Message Text */}
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

                    {/* Image if exists */}
                    {message.imageUrl && (
                        <Box
                            component="img"
                            src={message.imageUrl}
                            alt="Attachment"
                            sx={{
                                mt: 1,
                                borderRadius: 1,
                                maxWidth: '100%',
                                height: 'auto',
                            }}
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
    );
};

export default MessageBubble;
