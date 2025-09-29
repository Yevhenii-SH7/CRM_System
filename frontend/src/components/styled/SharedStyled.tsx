import { styled } from '@mui/material/styles';
import { 
  Card as MuiCard,
  CardContent as MuiCardContent,
  Typography as MuiTypography,
  Button as MuiButton,
  Box as MuiBox,
  Chip as MuiChip,
  LinearProgress as MuiLinearProgress,
  Skeleton as MuiSkeleton
} from '@mui/material';

// Styled Card Components
export const StyledCard = styled(MuiCard)(({ theme }) => ({
  height: '100%',
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
}));

export const StyledCardContent = styled(MuiCardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

// Styled Typography Components
export const SectionTitle = styled(MuiTypography)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

export const MetricValue = styled(MuiTypography)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

export const MetricTitle = styled(MuiTypography)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

// Styled Button Components
export const ActionButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 500,
}));

export const IconBox = styled(MuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Styled Chip Components
export const StatusChip = styled(MuiChip)(({ theme }) => ({
  fontSize: '0.7rem',
  height: 20,
}));

// Styled Progress Components
export const ProgressBar = styled(MuiLinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
}));

// Styled Layout Components
export const FlexBox = styled(MuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

export const FlexSpaceBetween = styled(MuiBox)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

// Styled Skeleton Components
export const MetricSkeleton = styled(MuiSkeleton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  visibility: 'visible',
  contentVisibility: 'auto',
}));