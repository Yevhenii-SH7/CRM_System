import { styled } from '@mui/material/styles';
import { 
  TextField as MuiTextField,
  FormControl as MuiFormControl,
  InputLabel as MuiInputLabel,
  Select as MuiSelect,
  MenuItem as MuiMenuItem,
  Chip as MuiChip,
  Box as MuiBox,
  Button as MuiButton,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle
} from '@mui/material';

export const FormTextField = styled(MuiTextField)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const FormFormControl = styled(MuiFormControl)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  width: '100%',
}));

export const FormInputLabel = styled(MuiInputLabel)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

export const FormSelect = styled(MuiSelect)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

export const FormMenuItem = styled(MuiMenuItem)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

export const TagChip = styled(MuiChip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
}));

export const TagsContainer = styled(MuiBox)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const FormDialogActions = styled(MuiDialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const FormDialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const FormDialogTitle = styled(MuiDialogTitle)(({ theme }) => ({
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  fontWeight: 600,
  padding: theme.spacing(2),
  paddingBottom: 0,
}));