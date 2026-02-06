import React, { useState, useEffect } from 'react';
import ChatList from '../../../components/Chat/ChatList';
import ChatWindow from '../../../components/Chat/ChatWindow';
import NewChatDialog from '../../../components/Chat/NewChatDialog';
import { useChatSocket, ChatRoom } from '../../../hooks/useChatSocket';
import { initializeSocket } from '../../../utils/socket';
import { get, patch } from '../../../api/Api';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../../../api/token/tokenService';
import { Box, Typography, Paper } from '@mui/material';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';

const Chat: React.FC = () => {
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [showChatWindow, setShowChatWindow] = useState(false);
    const [showNewChatDialog, setShowNewChatDialog] = useState(false);

    const {
        messages,
        setMessages,
        isConnected,
        isTyping,
        sendMessage,
        sendTypingIndicator,
    } = useChatSocket(selectedRoomId);

    // Initialize socket and get current user
    useEffect(() => {
        try {
            const token = TokenService.getToken();
            if (token) {
                const decoded: any = jwtDecode(token);
                const userId = decoded.Member_id || decoded.memberId || decoded.id || '';
                console.log('Decoded Token:', { decoded, userId });
                setCurrentUserId(userId);
            }

            // Initialize socket connection
            const socket = initializeSocket();
            if (!socket.connected) {
                socket.connect();
            }

            return () => {
                // Don't disconnect socket on unmount, keep it alive
                // socket.disconnect();
            };
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            toast.error('Failed to initialize chat');
        }
    }, []);

    // Fetch chat rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setIsLoadingRooms(true);
                const response = await get('/chat/rooms');

                if (response.success) {
                    setRooms(response.data || []);
                }
            } catch (error: any) {
                console.error('Failed to fetch rooms:', error);
                // toast.error('Failed to load conversations');
            } finally {
                setIsLoadingRooms(false);
            }
        };

        if (currentUserId) {
            fetchRooms();
        }
    }, [currentUserId]);

    // Fetch messages when room is selected
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedRoomId) return;

            try {
                setIsLoadingMessages(true);
                const response = await get(`/chat/messages/${selectedRoomId}`);

                if (response.success) {
                    setMessages(response.data || []);

                    // Mark messages as read and update room list
                    await patch(`/chat/mark-read/${selectedRoomId}`);

                    // Update local room's unread count to 0
                    setRooms(prevRooms =>
                        prevRooms.map(room =>
                            room.roomId === selectedRoomId
                                ? { ...room, unreadCount: 0 }
                                : room
                        )
                    );
                }
            } catch (error: any) {
                console.error('Failed to fetch messages:', error);
                toast.error('Failed to load messages');
            } finally {
                setIsLoadingMessages(false);
            }
        };

        fetchMessages();
    }, [selectedRoomId, setMessages]);

    const handleSelectRoom = (roomId: string) => {
        setSelectedRoomId(roomId);
        setShowChatWindow(true);
    };

    const handleSendMessage = (text: string) => {
        sendMessage(text);
    };

    const handleBack = () => {
        setShowChatWindow(false);
        setSelectedRoomId('');
    };

    const handleNewChat = () => {
        setShowNewChatDialog(true);
    };

    const handleChatCreated = async (roomId: string) => {
        try {
            const response = await get('/chat/rooms');
            if (response.success) {
                setRooms(response.data || []);
            }
        } catch (error) {
            console.error('Failed to refresh rooms:', error);
        }

        setSelectedRoomId(roomId);
        setShowChatWindow(true);
    };

    const selectedRoom = rooms.find((r) => r.roomId === selectedRoomId);
    const otherParticipant = selectedRoom?.participantDetails.find(
        (p) => p.memberId !== currentUserId
    );

    // Debug logging
    console.log('Debug Chat:', {
        currentUserId,
        selectedRoom: selectedRoom?.roomId,
        participantDetails: selectedRoom?.participantDetails,
        otherParticipant: otherParticipant?.name
    });

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', mt: 9 }}>
            {/* Connection Status Banner */}
            {/* {!isConnected && (
                <Alert
                    severity="warning"
                    icon={<WifiOff size={20} />}
                    sx={{ borderRadius: 0 }}
                >
                    Reconnecting to chat server...
                </Alert>
            )} */}

            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Chat List - Desktop: always visible, Mobile: hidden when chat is open */}
                <Box
                    sx={{
                        width: { xs: '100%', lg: 400 },
                        flexShrink: 0,
                        display: { xs: showChatWindow ? 'none' : 'block', lg: 'block' },
                    }}
                >
                    <ChatList
                        rooms={rooms.filter(room => !room.roomId.includes('ADMIN_'))}
                        selectedRoomId={selectedRoomId}
                        onSelectRoom={handleSelectRoom}
                        isLoading={isLoadingRooms}
                        currentUserId={currentUserId}
                        onNewChat={handleNewChat}
                    />
                </Box>

                {/* Chat Window - Desktop: always visible if selected, Mobile: full screen when selected */}
                <Box
                    sx={{
                        flex: 1,
                        display: { xs: !showChatWindow && !selectedRoomId ? 'none' : 'flex', lg: 'flex' },
                    }}
                >
                    {selectedRoomId ? (
                        <ChatWindow
                            roomId={selectedRoomId}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onTyping={sendTypingIndicator}
                            isConnected={isConnected}
                            isTyping={isTyping}
                            isLoading={isLoadingMessages}
                            recipientName={otherParticipant?.name || 'User'}
                            recipientRole={otherParticipant?.role || 'user'}
                            onBack={handleBack}
                        />
                    ) : (
                        <Box
                            sx={{
                                display: { xs: 'none', lg: 'flex' },
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                bgcolor: 'background.default',
                                flex: 1,
                            }}
                        >
                            <Paper
                                sx={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                                    mb: 3,
                                    boxShadow: 3,
                                }}
                            >
                                <Search size={48} color="#1976d2" />
                            </Paper>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                Select a conversation
                            </Typography>
                            <Typography variant="body2" color="text.secondary" maxWidth={400} textAlign="center">
                                Choose a conversation from the list to start chatting
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* New Chat Dialog */}
            <NewChatDialog
                open={showNewChatDialog}
                onClose={() => setShowNewChatDialog(false)}
                onChatCreated={handleChatCreated}
            />
        </Box>
    );
};

export default Chat;
