import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: number;
  loading?: boolean;
  isCurrency?: boolean;
}

// Format values as numbers or currency
const formatValue = (value: number | string, isCurrency?: boolean): string => {
  if (typeof value === 'number') {
    if (isCurrency) {
      // Format as Euro currency using de-DE locale, rounded to whole numbers
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.round(value));
    }
    return value.toLocaleString();
  }
  return value;
};

function MetricCard({ title, value, icon, color, change, loading, isCurrency }: MetricCardProps) {
  if (loading) {
    return (
      <Box sx={{ 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        boxShadow: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="80%" height={20} />
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 2, 
      bgcolor: 'background.paper', 
      borderRadius: 2, 
      boxShadow: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 2
    }}>
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color, 
            fontWeight: 600, 
            mb: 0.5,
            fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
          }}
        >
          {formatValue(value, isCurrency)}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
          }}
        >
          {title}
        </Typography>
        {change !== undefined && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: change >= 0 ? 'success.main' : 'error.main',
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            {change > 0 ? '+' : ''}{change}%
          </Typography>
        )}
      </Box>
      <Box sx={{ 
        width: 48, 
        height: 48, 
        borderRadius: '50%', 
        bgcolor: `${color}20`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color 
      }}>
        {icon}
      </Box>
    </Box>
  );
};

export default React.memo(MetricCard);