import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, CircularProgress, Popover, Typography } from '@mui/material';
import { Send, EmojiEmotions } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface MessageInputProps {
    onSendMessage: (text: string) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
}

// Common emojis organized by category
const EMOJI_CATEGORIES = [
    {
        name: 'Smileys',
        emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😎', '🤗', '🤔', '😏', '😌']
    },
    {
        name: 'Gestures',
        emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚', '✋', '🖐️', '👏', '🙌', '🤝', '🙏', '💪', '🦾', '✍️', '🤳']
    },
    {
        name: 'Hearts',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️']
    },
    {
        name: 'Objects',
        emojis: ['📱', '💻', '⌨️', '🖥️', '📷', '📸', '📞', '📧', '📨', '✉️', '📝', '📌', '📍', '📎', '🔗', '💡', '🔔', '🎵', '🎶', '⭐']
    },
    {
        name: 'Misc',
        emojis: ['✅', '❌', '❓', '❗', '💯', '🔥', '⚡', '💫', '✨', '🎉', '🎊', '🎁', '🏆', '🥇', '🎯', '💰', '💵', '🙈', '🙉', '🙊']
    }
];

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '24px',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
        '& fieldset': {
            borderColor: theme.palette.divider,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
        },
    },
}));

const SendButton = styled(IconButton)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: '#fff',
    '&:hover': {
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
        transform: 'scale(1.05)',
    },
    '&:active': {
        transform: 'scale(0.95)',
    },
    '&.Mui-disabled': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
    },
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows[2],
}));

const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onTyping,
    disabled = false,
    placeholder = 'Type a message...',
}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

        // Trigger typing indicator
        if (onTyping) {
            onTyping(true);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2000);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || disabled || isSending) return;

        setIsSending(true);

        try {
            await onSendMessage(message.trim());
            setMessage('');

            // Stop typing indicator
            if (onTyping) {
                onTyping(false);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setEmojiAnchor(event.currentTarget);
    };

    const handleEmojiClose = () => {
        setEmojiAnchor(null);
    };

    const handleEmojiSelect = (emoji: string) => {
        setMessage(prev => prev + emoji);
        // Focus back on input
        inputRef.current?.focus();
    };

    const isEmojiOpen = Boolean(emojiAnchor);

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                {/* Emoji Button */}
                <IconButton
                    size="medium"
                    onClick={handleEmojiClick}
                    sx={{
                        color: isEmojiOpen ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'action.hover',
                        },
                    }}
                    title="Add emoji"
                >
                    <EmojiEmotions />
                </IconButton>

                {/* Emoji Picker Popover */}
                <Popover
                    open={isEmojiOpen}
                    anchorEl={emojiAnchor}
                    onClose={handleEmojiClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    sx={{
                        '& .MuiPopover-paper': {
                            borderRadius: 2,
                            boxShadow: 3,
                            maxHeight: 350,
                            width: 320,
                        },
                    }}
                >
                    <Box sx={{ p: 1.5 }}>
                        {EMOJI_CATEGORIES.map((category) => (
                            <Box key={category.name} sx={{ mb: 1.5 }}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
                                >
                                    {category.name}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                                    {category.emojis.map((emoji, index) => (
                                        <Box
                                            key={index}
                                            onClick={() => handleEmojiSelect(emoji)}
                                            sx={{
                                                fontSize: '22px',
                                                cursor: 'pointer',
                                                p: 0.5,
                                                borderRadius: 1,
                                                transition: 'all 0.15s ease',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                    transform: 'scale(1.2)',
                                                },
                                            }}
                                        >
                                            {emoji}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Popover>

                {/* Message Input */}
                <StyledTextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={message}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    disabled={disabled || isSending}
                    size="small"
                    sx={{ flexGrow: 1 }}
                    inputRef={inputRef}
                />

                {/* Send Button */}
                <SendButton
                    onClick={handleSend}
                    disabled={!message.trim() || disabled || isSending}
                    size="medium"
                >
                    {isSending ? (
                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                    ) : (
                        <Send />
                    )}
                </SendButton>
            </Box>

            {/* Hint Text */}
            <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Box
                    component="span"
                    sx={{
                        fontSize: '11px',
                        color: 'text.secondary',
                    }}
                >
                    Press Enter to send, Shift+Enter for new line
                </Box>
            </Box>
        </Box>
    );
};

export default MessageInput;

