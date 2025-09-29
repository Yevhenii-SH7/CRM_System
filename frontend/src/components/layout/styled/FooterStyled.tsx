import { styled } from '@mui/material/styles';
import { 
  Box as MuiBox,
  Typography as MuiTypography,
  Container as MuiContainer
} from '@mui/material';

export const FooterContainer = styled(MuiBox)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: 1000,
}));

export const FooterText = styled(MuiTypography)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));