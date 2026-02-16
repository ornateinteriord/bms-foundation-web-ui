import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastPosition, Theme } from 'react-toastify';
import { initializeSocket } from '../../utils/socket';
import useAuth from '../../hooks/use-auth';
import { Box, Typography, Avatar } from '@mui/material';

// Define the shape of the notification data
interface NotificationPayload {
    roomId: string;
    senderId: string;
    senderName: string;
    text: string;
    senderProfileImage?: string;
}

const ChatNotificationListener: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);

    // Listen for active chat room changes
    useEffect(() => {
        const handleActiveRoomChange = (e: CustomEvent) => {
            setActiveRoomId(e.detail);
        };

        window.addEventListener('active-chat-room' as any, handleActiveRoomChange as any);
        return () => {
            window.removeEventListener('active-chat-room' as any, handleActiveRoomChange as any);
        };
    }, []);

    useEffect(() => {
        // Initialize simple notification sound
        // Using a base64 encoded short beep or notification sound if available
        // For now, we'll try to use a standard browser notification sound or just the visual toast
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;

        const socket = initializeSocket();

        if (!socket.connected) {
            console.log('ChatNotificationListener: Connecting socket...');
            socket.connect();
        }

        socket.on('connect', () => {
            console.log('ChatNotificationListener: Socket connected');
        });

        const handleNewMessageNotification = (data: NotificationPayload) => {
            console.log('New message notification received:', data);

            // Check if user is currently in this chat room
            // We use the custom event tracking for activeRoomId
            // Also check if we are on the chat page
            const isChatPage = location.pathname.includes('/user/chat');

            if (isChatPage && activeRoomId === data.roomId) {
                console.log('Suppressing notification: User is active in this room');
                return;
            }

            // Define custom toast component
            const NotificationToast = ({ closeToast }: { closeToast?: () => void }) => (
                <Box
                    onClick={() => {
                        navigate('/user/chat');
                        if (closeToast) closeToast();
                    }}
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 2 }}
                >
                    <Avatar
                        src={data.senderProfileImage}
                        alt={data.senderName}
                        sx={{ width: 40, height: 40 }}
                    >
                        {data.senderName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {data.senderName}
                        </Typography>
                        <Typography variant="body2" sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {data.text}
                        </Typography>
                    </Box>
                </Box>
            );

            toast(<NotificationToast />, {
                position: "top-center" as ToastPosition,
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light" as Theme,
            });

            // Play sound
            playNotificationSound();
        };

        socket.on('new_message_notification', handleNewMessageNotification);

        return () => {
            socket.off('new_message_notification', handleNewMessageNotification);
        };
    }, [isLoggedIn, location.pathname, navigate, activeRoomId]);

    const playNotificationSound = () => {
        try {
            // Simple beep using Web Audio API if no file
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Deeper sound
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    return null; // This component handles side effects only
};

export default ChatNotificationListener;
