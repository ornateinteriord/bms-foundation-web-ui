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

const SendButton = styled(IconButton)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: '#fff',
    '&:hover': { background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', transform: 'scale(1.05)' },
    '&:active': { transform: 'scale(0.95)' },
    '&.Mui-disabled': { background: theme.palette.action.disabledBackground, color: theme.palette.action.disabled },
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows[2],
}));

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping, disabled = false, placeholder = 'Type a message...' }) => {
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
        const apiUrl = import.meta.env.VITE_MLM_API_URL || 'http://localhost:5051';
        const authResponse = await fetch(`${apiUrl}/image-kit-auth`);
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
        const result = await uploadResponse.json();
        return { url: result.url, fileName: file.name, fileSize: file.size };
    };

    const handleSend = async () => {
        if ((!message.trim() && !selectedFile) || disabled || isSending) return;
        setIsSending(true);
        try {
            let attachment;
            if (selectedFile) {
                setIsUploading(true);
                const uploadResult = await uploadToImageKit(selectedFile);
                attachment = {
                    imageUrl: uploadResult.url,
                    messageType: ALLOWED_IMAGE_TYPES.includes(selectedFile.type) ? 'image' : 'file',
                    fileName: uploadResult.fileName,
                    fileSize: uploadResult.fileSize,
                };
                setIsUploading(false);
            }
            await onSendMessage(message.trim(), attachment);
            setMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            if (onTyping) onTyping(false);
        } catch (error) {
            toast.error('Failed to send message');
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
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
            {selectedFile && <FilePreview file={selectedFile} previewUrl={previewUrl} onRemove={() => { setSelectedFile(null); setPreviewUrl(null); }} />}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
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
                                if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setPreviewUrl(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }
                        }} style={{ display: 'none' }} />
                        <StyledTextField fullWidth multiline maxRows={4} value={message} onChange={handleInputChange} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())} placeholder={placeholder} disabled={disabled || isSending} size="small" inputRef={inputRef} />
                        {message.trim() || selectedFile ? (
                            <SendButton onClick={handleSend} disabled={isSending}>
                                {isSending ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Send />}
                            </SendButton>
                        ) : (
                            <IconButton onClick={startRecording} disabled={disabled} sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }}><Mic /></IconButton>
                        )}
                    </>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'error.light', borderRadius: '24px', px: 2, py: 1, flex: 1 }}>
                        <IconButton size="small" onClick={cancelRecording} sx={{ color: 'error.contrastText' }}><Close /></IconButton>
                        <Typography variant="body1" sx={{ color: 'error.contrastText', fontWeight: 600, flex: 1, textAlign: 'center' }}>
                            {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}
                        </Typography>
                        <SendButton onClick={stopRecording} size="medium"><Stop /></SendButton>
                    </Box>
                )}
            </Box>
            <Popover open={Boolean(emojiAnchor)} anchorEl={emojiAnchor} onClose={() => setEmojiAnchor(null)} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                <Box sx={{ p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5, width: 300 }}>
                    {EMOJI_CATEGORIES.flatMap(c => c.emojis).map((emoji, i) => (
                        <Typography key={i} onClick={() => { setMessage(prev => prev + emoji); setEmojiAnchor(null); inputRef.current?.focus(); }} sx={{ fontSize: '24px', cursor: 'pointer', p: 0.5, '&:hover': { transform: 'scale(1.2)' } }}>{emoji}</Typography>
                    ))}
                </Box>
            </Popover>
            <Dialog open={showAudioPreview} onClose={() => !isSending && setShowAudioPreview(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Preview Voice Message</DialogTitle>
                <DialogContent>
                    {audioBlob && <audio controls style={{ width: '100%', marginTop: '10px' }} src={URL.createObjectURL(audioBlob)} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelRecording} disabled={isSending}>Discard</Button>
                    <Button onClick={handleSendAudio} variant="contained" disabled={isSending}>Send</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MessageInput;
