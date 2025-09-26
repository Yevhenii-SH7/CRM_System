import { styled } from '@mui/material/styles';
import { 
  Card as MuiCard,
  CardContent as MuiCardContent,
  Typography as MuiTypography,
  Box as MuiBox,
  Skeleton as MuiSkeleton
} from '@mui/material';

export const ChartCard = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  boxShadow: theme.shadows[1],
  borderRadius: theme.shape.borderRadius,
}));

export const ChartCardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

export const ChartTitle = styled(MuiTypography)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

export const ChartContainer = styled(MuiBox)(({ theme }) => ({
  height: 300,
  width: '100%',
  position: 'relative',
}));

export const ChartSkeleton = styled(MuiSkeleton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));

export const NoDataContainer = styled(MuiBox)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 300,
}));

export const NoDataText = styled(MuiTypography)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));