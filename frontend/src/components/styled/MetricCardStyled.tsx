import { styled } from '@mui/material/styles';
import { 
  Card as MuiCard,
  CardContent as MuiCardContent,
  Typography as MuiTypography,
  Box as MuiBox,
  Skeleton as MuiSkeleton
} from '@mui/material';

export const MetricCardContainer = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const MetricCardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

export const MetricContentBox = styled(MuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 80,
}));

export const MetricTextContainer = styled(MuiBox)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

export const MetricValueText = styled(MuiTypography)(({ theme, color }) => ({
  color,
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

export const MetricTitleText = styled(MuiTypography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

// Add proper typing for the change prop
interface MetricChangeTextProps {
  change?: number;
}

export const MetricChangeText = styled(MuiTypography)<MetricChangeTextProps>(({ theme, change }) => ({
  color: change && change > 0 ? '#4caf50' : '#f44336',
}));

export const MetricIconBox = styled(MuiBox)(({ theme, color }) => ({
  color,
  fontSize: {
    xs: 30,
    sm: 35,
    md: 40,
  },
  marginLeft: theme.spacing(1),
}));

export const MetricSkeletonText = styled(MuiSkeleton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  visibility: 'visible',
  contentVisibility: 'auto',
  containIntrinsicSize: '40px',
}));