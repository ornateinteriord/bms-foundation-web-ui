import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
        if (!isLoggedIn) return;

        const socket = initializeSocket();

        if (!socket.connected) {
            socket.connect();
        }

        const handleNewMessageNotification = (data: NotificationPayload) => {
            const isChatPage = location.pathname.includes('/user/chat') || location.pathname.includes('/admin/chat');

            if (isChatPage && activeRoomId === data.roomId) {
                return;
            }

            // Define custom toast component with premium look
            const NotificationToast = ({ closeToast }: { closeToast?: () => void }) => {
                const isAdminPath = location.pathname.startsWith('/admin');
                const targetPath = isAdminPath ? '/admin/chat' : '/user/chat';

                return (
                    <Box
                        onClick={() => {
                            navigate(targetPath);
                            if (closeToast) closeToast();
                        }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            gap: 2,
                            p: 0.5
                        }}
                    >
                    <Avatar
                        src={data.senderProfileImage}
                        alt={data.senderName}
                        sx={{
                            width: 48,
                            height: 48,
                            border: '2px solid #0a2558',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        {data.senderName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ color: '#0a2558', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            {data.senderName}
                            <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 600, ml: 1, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                                New Message
                            </Typography>
                        </Typography>
                        <Typography variant="body2" sx={{
                            color: '#475569',
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontSize: '0.85rem',
                            lineHeight: 1.4
                        }}>
                            {data.text}
                        </Typography>
                    </Box>
                </Box>
            );
        };

            toast(<NotificationToast />, {
                position: "top-center",
                autoClose: 7000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });

            playNotificationSound();
        };

        socket.on('new_message_notification', handleNewMessageNotification);

        return () => {
            socket.off('new_message_notification', handleNewMessageNotification);
        };
    }, [isLoggedIn, location.pathname, navigate, activeRoomId]);

    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.error('Audio play failed', e);
        }
    };

    return null;
};

export default ChatNotificationListener;
