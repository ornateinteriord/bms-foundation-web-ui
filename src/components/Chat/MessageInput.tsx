import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, CircularProgress, Popover, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Backdrop } from '@mui/material';
import { Send, EmojiEmotions, AttachFile, Mic, Stop, Close, ArrowBack, InsertDriveFile } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toast } from 'react-toastify';
import { get } from '../../api/Api';

interface MessageInputProps {
    onSendMessage: (text: string, attachment?: { imageUrl: string; messageType: string; fileName: string; fileSize: number }) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
}

const EMOJI_CATEGORIES = [
    { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😎', '🤗', '🤔', '😏', '😌'] },
    { name: 'Gestures', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚', '✋', '🖐️', '👏', '🙌', '🤝', '🙏', '💪', '🦾', '✍️', '🤳'] },
    { name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'] },
    { name: 'Objects', emojis: ['📱', '💻', '⌨️', '🖥️', '📷', '📸', '📞', '📧', '📨', '✉️', '📝', '📌', '📍', '📎', '🔗', '💡', '🔔', '🎵', '🎶', '⭐'] },
    { name: 'Misc', emojis: ['✅', '❌', '❓', '❗', '💯', '🔥', '⚡', '💫', '✨', '🎉', '🎊', '🎁', '🏆', '🥇', '🎯', '💰', '💵', '🙈', '🙉', '🙊'] }
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '24px',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
        '& fieldset': { borderColor: theme.palette.divider },
        '&:hover fieldset': { borderColor: theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
    },
}));

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping, disabled = false, placeholder = 'Type a message...' }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [emojiAnchor, setEmojiAnchor] = useState<HTMLButtonElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showFilePreview, setShowFilePreview] = useState(false);
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
        if (onTyping) {
            onTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
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
            mediaRecorder.ondataavailable = (event) => event.data.size > 0 && audioChunksRef.current.push(event.data);
            mediaRecorder.onstop = () => {
                setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
                setShowAudioPreview(true);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            recordingIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            recordingTimeoutRef.current = setTimeout(() => stopRecording(), 5 * 60 * 1000);
        } catch (error: any) {
            toast.error('Microphone access denied or error occurred.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
        }
    };

    const cancelRecording = () => {
        audioChunksRef.current = [];
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setRecordingTime(0);
        setAudioBlob(null);
        setShowAudioPreview(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
    };

    const uploadToImageKit = async (file: File) => {
        try {
            const authParams = await get('/image-kit-auth');
            if (!authParams || !authParams.signature) {
                throw new Error('Invalid authentication parameters received');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
            formData.append('signature', authParams.signature);
            formData.append('expire', authParams.expire);
            formData.append('token', authParams.token);
            formData.append('folder', '/chat-attachments');

            const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await uploadResponse.json();
            return { url: result.url, fileName: file.name, fileSize: file.size };
        } catch (error: any) {
            console.error('Upload Error:', error);
            throw new Error(error.message || 'Failed to upload file');
        }
    };

    const handleSend = async () => {
        const trimmedMessage = message.trim();
        if ((!trimmedMessage && !selectedFile) || disabled || isSending) return;

        setIsSending(true);
        try {
            let attachment;
            if (selectedFile) {
                setIsUploading(true);
                try {
                    const uploadResult = await uploadToImageKit(selectedFile);
                    attachment = {
                        imageUrl: uploadResult.url,
                        messageType: ALLOWED_IMAGE_TYPES.includes(selectedFile.type) ? 'image' : 'file',
                        fileName: uploadResult.fileName,
                        fileSize: uploadResult.fileSize,
                    };
                } catch (uploadError: any) {
                    toast.error(uploadError.message || 'File upload failed');
                    setIsSending(false);
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            await onSendMessage(trimmedMessage, attachment);
            setMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setShowFilePreview(false);
            if (onTyping) onTyping(false);
        } catch (error: any) {
            console.error('Send error:', error);
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSending(false);
            setIsUploading(false);
        }
    };

    const handleSendAudio = async () => {
        if (!audioBlob) return;
        setIsSending(true);
        setIsUploading(true);
        try {
            const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
            const uploadResult = await uploadToImageKit(file);
            await onSendMessage('', { imageUrl: uploadResult.url, messageType: 'audio', fileName: uploadResult.fileName, fileSize: uploadResult.fileSize });
            setShowAudioPreview(false);
            setAudioBlob(null);
            if (onTyping) onTyping(false);
        } catch (error) {
            toast.error('Failed to send audio');
        } finally {
            setIsSending(false);
            setIsUploading(false);
        }
    };

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', width: '100%', boxSizing: 'border-box' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                {!isRecording ? (
                    <>
                        <IconButton size="medium" onClick={(e) => setEmojiAnchor(e.currentTarget)}><EmojiEmotions /></IconButton>
                        <IconButton size="medium" onClick={() => fileInputRef.current?.click()} disabled={disabled || isUploading}>
                            {isUploading ? <CircularProgress size={20} /> : <AttachFile />}
                        </IconButton>
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setSelectedFile(file);
                                setShowFilePreview(true);
                                if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setPreviewUrl(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }
                            e.target.value = '';
                        }} style={{ display: 'none' }} />
                        <StyledTextField
                            sx={{ flex: 1 }}
                            multiline
                            maxRows={4}
                            value={message}
                            onChange={handleInputChange}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder={placeholder}
                            disabled={disabled || isSending}
                            size="small"
                            inputRef={inputRef}
                            InputProps={{
                                endAdornment: (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {message.trim() || selectedFile ? (
                                            <IconButton
                                                onClick={handleSend}
                                                disabled={isSending}
                                                size="small"
                                                sx={{
                                                    color: 'primary.main',
                                                    '&:hover': { color: 'primary.dark' }
                                                }}
                                            >
                                                {isSending ? <CircularProgress size={20} /> : <Send />}
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                onClick={startRecording}
                                                disabled={disabled}
                                                size="small"
                                                sx={{ color: 'text.secondary' }}
                                            >
                                                <Mic />
                                            </IconButton>
                                        )}
                                    </Box>
                                )
                            }}
                        />
                    </>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'error.light', borderRadius: '24px', px: 2, py: 0.5, flex: 1, minHeight: 40 }}>
                        <IconButton size="small" onClick={cancelRecording} sx={{ color: 'error.contrastText' }}><Close fontSize="small" /></IconButton>
                        <Typography variant="body2" sx={{ color: 'error.contrastText', fontWeight: 600, flex: 1, textAlign: 'center' }}>
                            Recording: {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </Typography>
                        <IconButton
                            onClick={stopRecording}
                            size="small"
                            sx={{
                                bgcolor: 'error.contrastText',
                                color: 'error.main',
                                '&:hover': { bgcolor: 'error.contrastText', opacity: 0.9 }
                            }}
                        >
                            <Stop fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </Box>
            <Popover
                open={Boolean(emojiAnchor)}
                anchorEl={emojiAnchor}
                onClose={() => setEmojiAnchor(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                PaperProps={{ sx: { borderRadius: 3, boxShadow: 3 } }}
            >
                <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5, width: 280 }}>
                    {EMOJI_CATEGORIES.flatMap(c => c.emojis).map((emoji, i) => (
                        <Typography key={i} onClick={() => { setMessage(prev => prev + emoji); setEmojiAnchor(null); inputRef.current?.focus(); }} sx={{ fontSize: '24px', cursor: 'pointer', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'action.hover', transform: 'scale(1.2)' }, transition: 'all 0.2s' }}>{emoji}</Typography>
                    ))}
                </Box>
            </Popover>
            <Dialog open={showAudioPreview} onClose={() => !isSending && setShowAudioPreview(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle>Preview Voice Message</DialogTitle>
                <DialogContent>
                    {audioBlob && <audio controls style={{ width: '100%', marginTop: '10px' }} src={URL.createObjectURL(audioBlob)} />}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={cancelRecording} disabled={isSending} sx={{ borderRadius: 2 }}>Discard</Button>
                    <Button onClick={handleSendAudio} variant="contained" disabled={isSending} sx={{ borderRadius: 2, px: 3 }}>Send</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                fullScreen
                open={showFilePreview}
                onClose={() => !isSending && setShowFilePreview(false)}
                PaperProps={{
                    sx: { bgcolor: '#000', color: '#fff' }
                }}
            >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={() => setShowFilePreview(false)} sx={{ color: '#fff' }} disabled={isSending}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h6">Preview</Typography>
                    </Box>

                    {/* Backdrop for sending status */}
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute', flexDirection: 'column', gap: 2, bgcolor: 'rgba(0,0,0,0.7)' }}
                        open={isSending}
                    >
                        <CircularProgress color="inherit" />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Sending...</Typography>
                    </Backdrop>

                    {/* Content */}
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, overflow: 'hidden' }}>
                        {selectedFile && (
                            ALLOWED_IMAGE_TYPES.includes(selectedFile.type) && previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                    <InsertDriveFile sx={{ fontSize: 100, mb: 2, opacity: 0.7 }} />
                                    <Typography variant="h6">{selectedFile.name}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.6 }}>
                                        {Math.round(selectedFile.size / 1024)} KB
                                    </Typography>
                                </Box>
                            )
                        )}
                    </Box>

                    {/* Footer - Caption Input */}
                    <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 800, mx: 'auto' }}>
                            <StyledTextField
                                fullWidth
                                multiline
                                maxRows={4}
                                value={message}
                                onChange={handleInputChange}
                                placeholder="Add a caption..."
                                disabled={isSending}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        borderRadius: '24px'
                                    }
                                }}
                            />
                            <IconButton
                                onClick={handleSend}
                                disabled={isSending}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: '#fff',
                                    width: 50,
                                    height: 50,
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                {isSending ? <CircularProgress size={24} color="inherit" /> : <Send />}
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Dialog>
        </Box>
    );
};

export default MessageInput;
