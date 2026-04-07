import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface RupeeIconProps {
  sx?: SxProps<Theme>;
  className?: string;
}

const RupeeIcon: React.FC<RupeeIconProps> = ({ sx, className }) => {
  return (
    <Box
      component="img"
      src="/B3.png"
      alt="₹"
      className={className}
      sx={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: '1em',
        height: '1em',
        objectFit: 'contain',
        ...sx,
      }}
    />
  );
};

export default RupeeIcon;
