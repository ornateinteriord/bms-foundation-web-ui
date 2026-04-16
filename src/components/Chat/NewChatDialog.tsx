import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    CircularProgress,
    Avatar,
    Typography,
    Paper,
    Alert,
} from '@mui/material';
import { Search, MessageCircle } from 'lucide-react';
import { get } from '../../api/Api';
import { toast } from 'react-toastify';

interface NewChatDialogProps {
    open: boolean;
    onClose: () => void;
    onChatCreated: (roomId: string) => void;
}

const NewChatDialog: React.FC<NewChatDialogProps> = ({ open, onClose, onChatCreated }) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [searching, setSearching] = useState(false);
    const [foundMember, setFoundMember] = useState<any>(null);

    const handleSearch = async () => {
        if (!mobileNumber.trim()) {
            toast.error('Please enter a mobile number');
            return;
        }

        try {
            setSearching(true);
            setFoundMember(null);

            const response = await get(`/chat/search?mobileNumber=${mobileNumber}`);

            if (response.success) {
                setFoundMember(response.data);
                toast.success('Member found!');
            } else {
                toast.error(response.message || 'Member not found');
            }
        } catch (error: any) {
            console.error('Search error:', error);
            toast.error(error.response?.data?.message || 'No active member found with this mobile number');
        } finally {
            setSearching(false);
        }
    };

    const handleStartChat = () => {
        if (foundMember && foundMember.chatRoom) {
            onChatCreated(foundMember.chatRoom.roomId);
            handleClose();
        }
    };

    const handleClose = () => {
        setMobileNumber('');
        setFoundMember(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageCircle size={24} />
                    <Typography variant="h6">Start New Chat</Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            label="Enter Mobile Number"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="e.g. 9876543210"
                            disabled={searching}
                            sx={{ flexGrow: 1 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSearch}
                            disabled={searching || !mobileNumber.trim()}
                            sx={{
                                minWidth: 100,
                                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            }}
                        >
                            {searching ? <CircularProgress size={24} /> : <Search size={20} />}
                        </Button>
                    </Box>

                    {foundMember && (
                        <Paper
                            sx={{
                                mt: 3,
                                p: 2,
                                border: '2px solid',
                                borderColor: 'primary.main',
                                borderRadius: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    src={foundMember.member.profile_image}
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                                    }}
                                >
                                    {foundMember.member.Name.charAt(0).toUpperCase()}
                                </Avatar>

                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6">{foundMember.member.Name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {foundMember.member.mobile}
                                    </Typography>
                                </Box>

                                {foundMember.member.role === 'ADMIN' && (
                                    <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'warning.main', color: 'warning.contrastText', borderRadius: 1, fontSize: '12px', fontWeight: 600 }}>Admin</Box>
                                )}
                            </Box>
                            <Alert severity="success" sx={{ mt: 2 }}>Member found! Click "Start Chat" to begin conversation.</Alert>
                        </Paper>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button onClick={handleStartChat} variant="contained" disabled={!foundMember} sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>Start Chat</Button>
            </DialogActions>
        </Dialog>
    );
};

export default NewChatDialog;
