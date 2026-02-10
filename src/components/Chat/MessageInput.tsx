import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, CircularProgress, Popover, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Send, EmojiEmotions, AttachFile, Mic, Stop, Close } from '@mui/icons-material';
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
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [showAudioPreview, setShowAudioPreview] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimeoutRef = useRef<NodeJS.Timeout>();
    const recordingIntervalRef = useRef<NodeJS.Timeout>();

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            setIsRecording(true);
            setRecordingTime(0);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                setShowAudioPreview(true);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();

            // Update recording time every second
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            // Auto-stop recording after 5 minutes
            recordingTimeoutRef.current = setTimeout(() => {
                stopRecording();
            }, 5 * 60 * 1000);
        } catch (error: any) {
            console.error('Failed to access microphone:', error);
            if (error.name === 'NotAllowedError') {
                toast.error('Microphone access denied. Please allow microphone access in your browser settings and reload the page.');
            } else if (error.name === 'NotFoundError') {
                toast.error('No microphone detected. Please connect a microphone and try again.');
            } else {
                toast.error('Unable to access microphone. Please check your permissions.');
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (recordingTimeoutRef.current) {
                clearTimeout(recordingTimeoutRef.current);
            }
        }
    };

    const cancelRecording = () => {
        // Clear audio chunks first so onstop handler doesn't process them
        audioChunksRef.current = [];

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            // Stop the media tracks to release the microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current.stop();
        }

        setIsRecording(false);
        setRecordingTime(0);
        setAudioBlob(null);
        setShowAudioPreview(false);
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
        }
    };

    const sendAudioMessage = async () => {
        if (!audioBlob) return;

        setIsSending(true);
        try {
            setIsUploading(true);
            const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
            try {
                const uploadResult = await uploadToImageKit(file);
                const attachment = {
                    imageUrl: uploadResult.url,
                    messageType: 'audio',
                    fileName: uploadResult.fileName,
                    fileSize: uploadResult.fileSize,
                };
                await onSendMessage('', attachment);
                setAudioBlob(null);
                setShowAudioPreview(false);
                setRecordingTime(0);

                // Stop typing indicator
                if (onTyping) {
                    onTyping(false);
                }
            } catch (error) {
                toast.error('Failed to upload audio. Please try again.');
            }
            setIsUploading(false);
        } finally {
            setIsSending(false);
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

            {isRecording ? (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: 'error.light',
                        borderRadius: '24px',
                        px: 2,
                        py: 1,
                        flex: 1,
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={cancelRecording}
                        sx={{
                            color: 'error.contrastText',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)',
                            },
                        }}
                        title="Cancel recording"
                    >
                        <Close />
                    </IconButton>

                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: '#ff0000',
                                animation: 'pulse 1s infinite',
                                '@keyframes pulse': {
                                    '0%': { opacity: 1 },
                                    '50%': { opacity: 0.4 },
                                    '100%': { opacity: 1 },
                                },
                            }}
                        />
                        <Typography variant="body1" sx={{ color: 'error.contrastText', fontWeight: 600 }}>
                            {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </Typography>
                    </Box>

                    <SendButton
                        onClick={stopRecording}
                        size="medium"
                    >
                        <Stop />
                    </SendButton>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, flex: 1 }}>
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

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                        style={{ display: 'none' }}
                    />

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

                    {message.trim() || selectedFile ? (
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
                    ) : (
                        <IconButton
                            size="medium"
                            onClick={startRecording}
                            disabled={disabled}
                            sx={{
                                bgcolor: 'primary.main',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                            }}
                            title="Record voice message"
                        >
                            <Mic />
                        </IconButton>
                    )}
                </Box>
            )}

            {/* Hint Text */}
            <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Box
                    component="span"
                    sx={{
                        fontSize: '11px',
                        color: 'text.secondary',
                    }}
                >
                    {isRecording ? (
                        <span style={{ color: 'red', fontWeight: 'bold' }}>
                            🔴 Recording: {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </span>
                    ) : (
                        'Press Enter to send'
                    )}
                </Box>
            </Box>

            {/* Audio Preview Dialog */}
            <Dialog open={showAudioPreview} onClose={() => !isSending && setShowAudioPreview(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Voice Message
                    <IconButton size="small" onClick={() => !isSending && setShowAudioPreview(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Duration: {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </Typography>
                        {audioBlob && (
                            <audio
                                controls
                                style={{ width: '100%' }}
                                src={URL.createObjectURL(audioBlob)}
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setShowAudioPreview(false);
                            cancelRecording();
                        }}
                        disabled={isSending}
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={sendAudioMessage}
                        variant="contained"
                        disabled={isSending || isUploading}
                    >
                        {isSending || isUploading ? <CircularProgress size={20} /> : 'Send'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MessageInput;
