import { useEffect, useState, useCallback, useRef } from 'react';
import { getSocket } from '../utils/socket';
import { Socket } from 'socket.io-client';
import { post, get } from '../api/Api';

export interface Message {
    _id?: string;
    roomId: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    text: string;
    imageUrl?: string;
    isRead: boolean;
    createdAt: Date | string;
}

export interface ChatRoom {
    _id?: string;
    roomId: string;
    participants: string[];
    participantDetails: Array<{
        memberId: string;
        name: string;
        role: string;
        profileImage?: string;
    }>;
    lastMessage?: string;
    lastMessageTime?: Date | string;
    unreadCount?: number;
}

export const useChatSocket = (roomId?: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected] = useState(true); // Always show as connected since we use REST API
    const [isTyping, setIsTyping] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const pollingRef = useRef<NodeJS.Timeout>();

    // Try socket connection but don't rely on it
    useEffect(() => {
        socketRef.current = getSocket();

        if (!socketRef.current) {
            console.log('Socket not initialized, using REST API only');
            return;
        }

        const socket = socketRef.current;

        // Connection status - but we always show connected since REST works
        const handleConnect = () => {
            console.log('Socket connected');
        };
        const handleDisconnect = () => {
            console.log('Socket disconnected, using REST API');
        };

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        // Join room if roomId is provided and socket is connected
        if (roomId && socket.connected) {
            socket.emit('joinRoom', { roomId });

            // Listen for new messages (as backup to polling)
            const handleReceiveMessage = (message: Message) => {
                setMessages((prev) => {
                    // Avoid duplicates
                    if (prev.some(m => m._id === message._id)) {
                        return prev;
                    }
                    return [...prev, message];
                });
            };

            // Listen for typing indicator
            const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
                setIsTyping(data.isTyping);
            };

            socket.on('receiveMessage', handleReceiveMessage);
            socket.on('userTyping', handleUserTyping);

            return () => {
                socket.off('receiveMessage', handleReceiveMessage);
                socket.off('userTyping', handleUserTyping);
                socket.off('connect', handleConnect);
                socket.off('disconnect', handleDisconnect);
            };
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, [roomId]);

    // Polling for new messages (works even when socket fails on Vercel)
    useEffect(() => {
        if (!roomId) return;

        const pollMessages = async () => {
            try {
                const response = await get(`/chat/messages/${roomId}`);
                if (response.success && response.data) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error('Failed to poll messages:', error);
            }
        };

        // Poll every 3 seconds for new messages
        pollingRef.current = setInterval(pollMessages, 3000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [roomId]);

    // Send message using REST API (works on Vercel)
    const sendMessage = useCallback(
        async (text: string) => {
            if (!roomId || !text.trim() || isSending) return;

            console.log('sendMessage - Sending to roomId:', roomId, 'text:', text.trim());

            setIsSending(true);
            try {
                const response = await post('/chat/message/send', {
                    roomId,
                    text: text.trim(),
                });

                console.log('sendMessage - Response:', response);

                if (response.success && response.data) {
                    // Add message to local state immediately
                    setMessages((prev) => {
                        // Avoid duplicates
                        if (prev.some(m => m._id === response.data._id)) {
                            return prev;
                        }
                        return [...prev, response.data];
                    });
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            } finally {
                setIsSending(false);
            }
        },
        [roomId, isSending]
    );

    const sendTypingIndicator = useCallback(
        (typing: boolean) => {
            if (!socketRef.current || !roomId || !socketRef.current.connected) return;

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            socketRef.current.emit('typing', { roomId, isTyping: typing });

            // Auto-stop typing after 3 seconds
            if (typing) {
                typingTimeoutRef.current = setTimeout(() => {
                    socketRef.current?.emit('typing', { roomId, isTyping: false });
                }, 3000);
            }
        },
        [roomId]
    );

    const markAsRead = useCallback(
        (messageIds: string[]) => {
            if (!socketRef.current || !roomId || !socketRef.current.connected) return;

            socketRef.current.emit('markAsRead', { roomId, messageIds });
        },
        [roomId]
    );

    return {
        messages,
        setMessages,
        isConnected,
        isTyping,
        isSending,
        sendMessage,
        sendTypingIndicator,
        markAsRead,
    };
};
