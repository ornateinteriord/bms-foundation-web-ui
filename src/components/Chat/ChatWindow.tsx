import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Message } from '../../hooks/useChatSocket';
import { Box, AppBar, Toolbar, Avatar, Typography, IconButton, CircularProgress, Paper } from '@mui/material';
import { ArrowBack, Circle, WifiOff } from '@mui/icons-material';
import { User } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../../api/token/tokenService';
import { styled } from '@mui/material/styles';
import chatBg from '../../assets/chatBg.jpg';

interface ChatWindowProps {
    roomId: string;
    messages: Message[];
    onSendMessage: (text: string) => void;
    onTyping?: (isTyping: boolean) => void;
    isConnected: boolean;
    isTyping?: boolean;
    isLoading?: boolean;
    recipientName?: string;
    recipientRole?: string;
    onBack?: () => void;
}

const ChatHeader = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[1],
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(3),
    backgroundImage: `url(${chatBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
}));

const ChatWindow: React.FC<ChatWindowProps> = ({
    messages,
    onSendMessage,
    onTyping,
    isConnected,
    isTyping = false,
    isLoading = false,
    recipientName = 'User',
    recipientRole = 'user',
    onBack,
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const currentUserId = useRef<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLength = useRef(messages.length);

    // Get current user ID from token
    useEffect(() => {
        try {
            const token = TokenService.getToken();
            if (token) {
                const decoded: any = jwtDecode(token);
                // For admin, use ADMIN_1 format to match message senderId
                if (decoded.role === 'admin' || decoded.role === 'ADMIN') {
                    currentUserId.current = `ADMIN_${decoded.id?.toString()?.length === 24 ? '1' : decoded.id || '1'}`;
                } else {
                    currentUserId.current = decoded.Member_id || decoded.memberId || decoded.id || '';
                }
                console.log('ChatWindow - currentUserId:', currentUserId.current, 'role:', decoded.role);
            }
        } catch (error) {
            console.error('Failed to decode token:', error);
        }
    }, []);

    // Auto-scroll to bottom only on new messages and when user is near bottom
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check if user is near bottom (within 150px)
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;

        // Only auto-scroll if new message arrived and user is near bottom
        if (messages.length > prevMessagesLength.current && isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }

        prevMessagesLength.current = messages.length;
    }, [messages]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <ChatHeader position="sticky" elevation={0} sx={{ top: 0, zIndex: 10 }}>
                <Toolbar>
                    {/* Back Button (mobile) */}
                    {onBack && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onBack}
                            sx={{ mr: 1, display: { lg: 'none' } }}
                        >
                            <ArrowBack />
                        </IconButton>
                    )}

                    {/* Recipient Avatar */}
                    <Avatar
                        sx={{
                            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                            mr: 2,
                            position: 'relative',
                        }}
                    >
                        {recipientName.charAt(0).toUpperCase()}
                        {isConnected && (
                            <Circle
                                sx={{
                                    position: 'absolute',
                                    bottom: -2,
                                    right: -2,
                                    fontSize: 14,
                                    color: 'success.main',
                                    bgcolor: 'background.paper',
                                    borderRadius: '50%',
                                }}
                            />
                        )}
                    </Avatar>

                    {/* Recipient Info */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" noWrap>
                            {recipientName}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isTyping ? (
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                                    Typing...
                                </Typography>
                            ) : (
                                <>
                                    {isConnected ? (
                                        <Circle sx={{ fontSize: 8, color: 'success.main' }} />
                                    ) : (
                                        <WifiOff sx={{ fontSize: 12 }} />
                                    )}
                                    <Typography variant="caption" color="text.secondary">
                                        {isConnected ? 'Online' : 'Offline'}
                                    </Typography>
                                </>
                            )}
                            {recipientRole === 'admin' && (
                                <Box
                                    component="span"
                                    sx={{
                                        px: 1,
                                        py: 0.25,
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        borderRadius: 1,
                                        fontSize: '10px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Admin
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Toolbar>
            </ChatHeader>

            {/* Messages Area */}
            <MessagesContainer ref={containerRef}>
                {isLoading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <CircularProgress size={40} />
                        <Typography variant="body2" color="text.secondary">
                            Loading messages...
                        </Typography>
                    </Box>
                ) : messages.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Paper
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                            }}
                        >
                            <User size={40} color="#1976d2" />
                        </Paper>
                        <Typography variant="h6" color="text.primary">
                            No messages yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={400}>
                            Start the conversation by sending a message below
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const isSent = message.senderId === currentUserId.current;
                            console.log('Message:', { senderId: message.senderId, currentUserId: currentUserId.current, isSent, text: message.text?.substring(0, 20) });

                            return (
                                <MessageBubble
                                    key={message._id || `${message.roomId}-${index}`}
                                    message={message}
                                    isSent={isSent}
                                    showTimestamp={true}
                                />
                            );
                        })}

                        {/* Scroll anchor */}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </MessagesContainer>

            {/* Input Area */}
            <MessageInput
                onSendMessage={onSendMessage}
                onTyping={onTyping}
                disabled={!isConnected}
                placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
            />
        </Box>
    );
};

export default ChatWindow;
