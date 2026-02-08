import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, CircularProgress, Popover, Typography } from '@mui/material';
import { Send, EmojiEmotions, AttachFile } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import FilePreview from './FilePreview';

interface MessageInputProps {
    onSendMessage: (text: string, attachment?: { imageUrl: string; messageType: string; fileName: string; fileSize: number }) => void;
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

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

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
    const [isUploading, setIsUploading] = useState(false);
    const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const uploadToImageKit = async (file: File): Promise<{ url: string; fileName: string; fileSize: number }> => {
        try {
            const apiUrl = import.meta.env.VITE_MLM_API_URL || 'http://localhost:5051';
            const authResponse = await fetch(`${apiUrl}/image-kit-auth`);
            if (!authResponse.ok) throw new Error('Failed to get upload credentials');
            const authParams = await authResponse.json();
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
            formData.append('signature', authParams.signature);
            formData.append('expire', authParams.expire);
            formData.append('token', authParams.token);
            formData.append('folder', '/chat-attachments');
            const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: formData });
            if (!uploadResponse.ok) throw new Error('Failed to upload file');
            const uploadResult = await uploadResponse.json();
            return { url: uploadResult.url, fileName: file.name, fileSize: file.size };
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isDocument = ALLOWED_FILE_TYPES.includes(file.type);
        if (!isImage && !isDocument) {
            toast.error('Please select an image (JPG, PNG, GIF, WebP) or document (PDF, DOC, DOCX)');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size must be less than 25MB');
            return;
        }
        setSelectedFile(file);
        if (isImage) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
        }
        e.target.value = '';
    };
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleSend = async () => {
        if ((!message.trim() && !selectedFile) || disabled || isSending) return;

        setIsSending(true);

        try {
            let attachment: { imageUrl: string; messageType: string; fileName: string; fileSize: number } | undefined;
            if (selectedFile) {
                setIsUploading(true);
                try {
                    const uploadResult = await uploadToImageKit(selectedFile);
                    const isImage = ALLOWED_IMAGE_TYPES.includes(selectedFile.type);
                    attachment = {
                        imageUrl: uploadResult.url,
                        messageType: isImage ? 'image' : 'file',
                        fileName: uploadResult.fileName,
                        fileSize: uploadResult.fileSize,
                    };
                } catch (error) {
                    toast.error('Failed to upload file. Please try again.');
                    setIsSending(false);
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            await onSendMessage(message.trim(), attachment);
            setMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);

            // Stop typing indicator
            if (onTyping) {
                onTyping(false);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
            setIsUploading(false);
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

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const isEmojiOpen = Boolean(emojiAnchor);
    const canSend = (message.trim() || selectedFile) && !disabled && !isSending;

    return (
        <Box
            sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider',
            }}
        >
            {/* File Preview */}
            {selectedFile && (
                <FilePreview
                    file={selectedFile}
                    previewUrl={previewUrl}
                    onRemove={handleRemoveFile}
                />
            )}

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

                {/* Attachment Button */}
                <IconButton
                    size="medium"
                    onClick={handleAttachClick}
                    disabled={disabled || isUploading}
                    sx={{
                        color: selectedFile ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'action.hover',
                        },
                    }}
                    title="Attach file"
                >
                    {isUploading ? (
                        <CircularProgress size={20} />
                    ) : (
                        <AttachFile />
                    )}
                </IconButton>

                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                />

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
                    disabled={!canSend}
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
                    Press Enter to send
                </Box>
            </Box>
        </Box>
    );
};

export default MessageInput;
