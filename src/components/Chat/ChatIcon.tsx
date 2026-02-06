import React, { useState, useEffect } from 'react';
import { Fab, Badge, Tooltip, Box } from '@mui/material';
import { MessageCircle } from 'lucide-react';
import { styled, keyframes } from '@mui/material/styles';

interface ChatIconProps {
    onClick?: () => void;
    unreadCount?: number;
}

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
`;

const StyledFab = styled(Fab)<{ hasUnread: boolean }>(({ theme, hasUnread }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    color: '#fff',
    zIndex: 1000,
    animation: hasUnread ? `${pulse} 2s infinite` : 'none',
    '&:hover': {
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
        transform: 'scale(1.1)',
    },
    transition: 'all 0.3s ease',
}));

const ChatIcon: React.FC<ChatIconProps> = ({ onClick, unreadCount = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <Box
            sx={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s ease',
            }}
        >
            <Tooltip
                title={unreadCount > 0 ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}` : 'Open Chat'}
                placement="left"
                arrow
            >
                <StyledFab
                    color="primary"
                    aria-label="chat"
                    onClick={onClick}
                    hasUnread={unreadCount > 0}
                >
                    <Badge
                        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                        color="error"
                        sx={{
                            '& .MuiBadge-badge': {
                                animation: unreadCount > 0 ? 'bounce 1s infinite' : 'none',
                                '@keyframes bounce': {
                                    '0%, 100%': { transform: 'translateY(0)' },
                                    '50%': { transform: 'translateY(-5px)' },
                                },
                            },
                        }}
                    >
                        <MessageCircle size={24} />
                    </Badge>
                </StyledFab>
            </Tooltip>
        </Box>
    );
};

export default ChatIcon;
