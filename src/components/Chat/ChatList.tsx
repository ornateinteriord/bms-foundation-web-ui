import React, { useState } from 'react';
import { ChatRoom } from '../../hooks/useChatSocket';
import {
    Box,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Badge,
    TextField,
    Typography,
    InputAdornment,
    Paper,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import { Search, MessageSquare, Circle } from 'lucide-react';
import { Add } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { styled } from '@mui/material/styles';

interface ChatListProps {
    rooms: ChatRoom[];
    selectedRoomId?: string;
    onSelectRoom: (roomId: string) => void;
    isLoading?: boolean;
    currentUserId: string;
    onNewChat?: () => void;
}

const StyledListItemButton = styled(ListItemButton)<{ selected?: boolean }>(({ theme, selected }) => ({
    borderLeft: selected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
    backgroundColor: selected
        ? theme.palette.mode === 'dark'
            ? 'rgba(25, 118, 210, 0.15)'
            : 'rgba(25, 118, 210, 0.08)'
        : 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    transition: 'all 0.2s ease',
    padding: theme.spacing(2),
}));

const SearchField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
    },
}));

const ChatList: React.FC<ChatListProps> = ({
    rooms,
    selectedRoomId,
    onSelectRoom,
    isLoading = false,
    currentUserId,
    onNewChat,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRooms = rooms.filter((room) => {
        const otherParticipant = room.participantDetails.find(
            (p) => p.memberId !== currentUserId
        );
        return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const formatTime = (date: Date | string | undefined) => {
        if (!date) return '';
        try {
            return formatDistanceToNow(new Date(date), { addSuffix: true });
        } catch {
            return '';
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.paper',
                borderRight: 1,
                borderColor: 'divider',
            }}
        >
            {/* Header */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Messages
                    </Typography>

                    {onNewChat && (
                        <Tooltip title="Start New Chat">
                            <IconButton
                                onClick={onNewChat}
                                sx={{
                                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                    color: '#fff',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                                    },
                                }}
                            >
                                <Add />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Search Bar */}
                <SearchField
                    fullWidth
                    size="small"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Chat List */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredRooms.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            px: 4,
                            py: 12,
                            textAlign: 'center',
                        }}
                    >
                        <Paper
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
                                mb: 2,
                            }}
                        >
                            <MessageSquare size={32} color="#1976d2" />
                        </Paper>
                        <Typography variant="h6" gutterBottom>
                            No conversations yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" maxWidth={300}>
                            {searchQuery
                                ? 'No results found for your search'
                                : 'Start a new conversation to get started'}
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {filteredRooms.map((room) => {
                            const otherParticipant = room.participantDetails.find(
                                (p) => p.memberId !== currentUserId
                            );

                            if (!otherParticipant) return null;

                            const isSelected = room.roomId === selectedRoomId;
                            const hasUnread = (room.unreadCount || 0) > 0;

                            return (
                                <StyledListItemButton
                                    key={room.roomId}
                                    selected={isSelected}
                                    onClick={() => onSelectRoom(room.roomId)}
                                >
                                    <ListItemAvatar>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            badgeContent={
                                                <Circle
                                                    size={12}
                                                    fill="#4caf50"
                                                    color="#4caf50"
                                                    style={{ border: '2px solid white', borderRadius: '50%' }}
                                                />
                                            }
                                        >
                                            <Avatar
                                                sx={{
                                                    background:
                                                        otherParticipant.role === 'admin'
                                                            ? 'linear-gradient(135deg, #ff9800 0%, #f44336 100%)'
                                                            : 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {otherParticipant.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </Badge>
                                    </ListItemAvatar>

                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    noWrap
                                                    sx={{
                                                        fontWeight: hasUnread ? 600 : 400,
                                                        flexGrow: 1,
                                                    }}
                                                >
                                                    {otherParticipant.name}
                                                </Typography>
                                                {otherParticipant.role === 'admin' && (
                                                    <Chip
                                                        label="Admin"
                                                        size="small"
                                                        sx={{
                                                            height: 18,
                                                            fontSize: '10px',
                                                            bgcolor: 'warning.light',
                                                            color: 'warning.contrastText',
                                                        }}
                                                    />
                                                )}
                                                {room.lastMessageTime && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {formatTime(room.lastMessageTime)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontWeight: hasUnread ? 500 : 400,
                                                        flexGrow: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {room.lastMessage || 'No messages yet'}
                                                </Typography>
                                                {hasUnread && (
                                                    <Badge
                                                        badgeContent={room.unreadCount}
                                                        color="primary"
                                                        sx={{
                                                            ml: 1,
                                                            '& .MuiBadge-badge': {
                                                                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                                                fontWeight: 700,
                                                            },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                    />
                                </StyledListItemButton>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Box>
    );
};

export default ChatList;
