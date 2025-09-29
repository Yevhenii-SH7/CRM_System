import { styled } from '@mui/material/styles';
import { 
  AppBar as MuiAppBar,
  Toolbar as MuiToolbar,
  Typography as MuiTypography,
  Button as MuiButton,
  Box as MuiBox,
  Avatar as MuiAvatar
} from '@mui/material';

export const AppBar = styled(MuiAppBar)(({ theme }) => ({
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  backgroundColor: '#1976d2', // Blue color matching dashboard
  background: '#1976d2', // Explicitly set background to ensure no override
}));

export const Toolbar = styled(MuiToolbar)(({ theme }) => ({
  minHeight: 78, // Match dashboard height
  py: 0,
  [theme.breakpoints.up('sm')]: {
    minHeight: 78, // Match dashboard height
  },
}));

export const Title = styled(MuiTypography)(({ theme }) => ({
  flexGrow: 1,
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  fontWeight: 600,
}));

export const AuthSection = styled(MuiBox)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const UserInfoBox = styled(MuiBox)(({ theme }) => ({
  textAlign: 'right',
}));

export const UserName = styled(MuiTypography)(({ theme }) => ({
  color: 'white',
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

export const UserRole = styled(MuiTypography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  fontSize: '0.75rem',
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

export const UserAvatar = styled(MuiAvatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: theme.palette.secondary.main,
}));

export const AuthButtons = styled(MuiBox)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

export const AuthButton = styled(MuiButton)(({ theme }) => ({
  color: 'inherit',
}));