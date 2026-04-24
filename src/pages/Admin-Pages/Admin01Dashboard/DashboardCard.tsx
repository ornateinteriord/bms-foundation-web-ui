import { Box, Card, CardContent, Button, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardCardProps {
  icon?: ReactNode;
  title: string;
  status?: string;
  description?: string;
  showActionButton?: boolean;
  actionButtonLabel?: string;
  onActionClick?: () => void;
  showFooterContent?: boolean;
  footerContent?: ReactNode;
  sx?: SxProps<Theme>;
}

const DashboardCard = ({
  icon,
  title,
  status,
  description,
  showActionButton = false,
  actionButtonLabel,
  onActionClick,
  showFooterContent = false,
  footerContent,
  sx,
}: DashboardCardProps) => {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        minHeight: 150,
        ...sx,
      }}
    >
      {/* Background Icon */}
      {icon && (
        <Box
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            opacity: 0.1,
            fontSize: '120px',
            color: 'white',
          }}
        >
          {icon}
        </Box>
      )}

      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          {/* Icon */}
          {icon && (
            <Box
              sx={{
                fontSize: '40px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
          )}

          {/* Title and Status */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'white',
                mb: 0.5,
              }}
            >
              {title}
            </Box>
            {status && (
              <Box
                sx={{
                  fontSize: '14px',
                  color: '#62ff00ff',
                  fontWeight: 500,
                }}
              >
                {status}
              </Box>
            )}
          </Box>

          {/* Action Button */}
          {showActionButton && actionButtonLabel && (
            <Button
              variant="outlined"
              size="small"
              onClick={onActionClick}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {actionButtonLabel}
            </Button>
          )}
        </Box>

        {/* Description */}
        {description && (
          <Box
            sx={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'white',
              mb: showFooterContent ? 2 : 0,
            }}
          >
            {description}
          </Box>
        )}

        {/* Footer Content */}
        {showFooterContent && footerContent && (
          <Box sx={{ mt: 2 }}>{footerContent}</Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;