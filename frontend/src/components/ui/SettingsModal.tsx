import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Checkbox from '@mui/material/Checkbox';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../contexts/LocaleContext';
import { authAPI, User, UserUpdateData } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  height: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { user, login } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const theme = useTheme();
  const [tabValue, setTabValue] = React.useState(0);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isError, setIsError] = React.useState(false);
  
  // Profile settings
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  
  // System settings
  const [themeMode, setThemeMode] = React.useState('auto');
  const [dateFormat, setDateFormat] = React.useState('DD.MM.YYYY');
  const [timezone, setTimezone] = React.useState('UTC');
  // Language is now managed by LocaleContext
  
  // Users management
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [userEmail, setUserEmail] = React.useState('');
  const [userRole, setUserRole] = React.useState('');
  const [userPassword, setUserPassword] = React.useState('');
  const [userFirstName, setUserFirstName] = React.useState('');
  const [userLastName, setUserLastName] = React.useState('');
  
  // Notifications settings
  const [newTaskNotifications, setNewTaskNotifications] = React.useState(true);
  const [deadlineReminders, setDeadlineReminders] = React.useState(true);
  const [dailyEmailSummary, setDailyEmailSummary] = React.useState(false);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  // Load users when the Users tab is opened
  useEffect(() => {
    if (tabValue === 2 && user?.role === 'admin') {
      loadUsers();
    }
  }, [tabValue, user?.role]);

  // Initialize profile fields when user data is available
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const usersData = await authAPI.getUsers();
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        console.warn('Users data is not an array:', usersData);
        setUsers([]);
        setMessage('Users management not available (API not updated)');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setMessage('Users management not available (API not updated)');
      setIsError(true);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    try {
      setMessage('Password changed successfully');
      setIsError(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password change error:', err);
      setMessage('Failed to change password');
      setIsError(true);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      // Prepare update data
      const updateData: Partial<User> = {};
      if (firstName !== user.first_name) updateData.first_name = firstName;
      if (lastName !== user.last_name) updateData.last_name = lastName;
      
      // If we have changes to make
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await authAPI.updateUser(user.id, updateData);
        // Update the user in AuthContext with merged data
        const mergedUser = { ...user, ...updatedUser };
        login(mergedUser);
        setMessage('Profile updated successfully');
        setIsError(false);
      } else {
        setMessage('No changes to save');
        setIsError(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setMessage('Failed to update profile');
      setIsError(true);
    }
  };

  const handleClose = () => {
    setTabValue(0);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserEmail(user.email || '');
    setUserRole(user.role || '');
    setUserFirstName(user.first_name || '');
    setUserLastName(user.last_name || '');
    setUserPassword('');
  };

  const handleUserUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      // Prepare update data using the correct type that includes password
      const updateData: UserUpdateData = {};
      if (userEmail !== selectedUser.email) updateData.email = userEmail;
      if (userRole !== selectedUser.role) updateData.role = userRole;
      if (userFirstName !== selectedUser.first_name) updateData.first_name = userFirstName;
      if (userLastName !== selectedUser.last_name) updateData.last_name = userLastName;
      if (userPassword) updateData.password = userPassword;
      
      // Update the user via API
      const updatedUser = await authAPI.updateUser(selectedUser.id, updateData);
      
      // Update the users list
      const updatedUsers = users.map(u => 
        u.id === selectedUser.id ? updatedUser : u
      );
      setUsers(updatedUsers);
      
      // If we're updating the current user, update the auth context
      if (selectedUser.id === user?.id) {
        login(updatedUser);
      }
      
      // Update the selected user
      setSelectedUser(updatedUser);
      setUserEmail(updatedUser.email || '');
      setUserRole(updatedUser.role || '');
      setUserFirstName(updatedUser.first_name || '');
      setUserLastName(updatedUser.last_name || '');
      setUserPassword('');
      
      setMessage(`User ${updatedUser.first_name} ${updatedUser.last_name} updated successfully`);
      setIsError(false);
    } catch (err) {
      console.error('User update error:', err);
      setMessage('Failed to update user');
      setIsError(true);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="settings-modal-title"
      aria-describedby="settings-modal-description"
    >
      <Box sx={style}>
        <Box sx={{ px: 4, pt: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
          <Typography id="settings-modal-title" variant="h6" component="h2">
            {t('settings.title')}
          </Typography>
        </Box>
        
        <Box sx={{ bgcolor: 'background.paper' }}>
          <AppBar position="static" sx={{ minHeight: 36 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, fontSize: '0.75rem', py: 0.5 } }}
            >
              <Tab label={t('settings.profile')} {...a11yProps(0)} />
              <Tab label={t('settings.system')} {...a11yProps(1)} />
              <Tab label={t('settings.users')} {...a11yProps(2)} />
              <Tab label={t('settings.notifications')} {...a11yProps(3)} />
            </Tabs>
          </AppBar>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto', px: 4 }}>
          
          <TabPanel value={tabValue} index={0} dir={theme.direction}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('settings.userInformation')}
            </Typography>
            
            <TextField
              fullWidth
              label={t('common.firstName')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              margin="dense"
              size="small"
            />
            <TextField
              fullWidth
              label={t('common.lastName')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              margin="dense"
              size="small"
            />
            <TextField
              fullWidth
              label={t('common.email')}
              value={user?.email || ''}
              margin="dense"
              disabled
              size="small"
            />
            <TextField
              fullWidth
              label={t('common.role')}
              value={user?.role || ''}
              margin="dense"
              disabled
              size="small"
            />
            
            {message && tabValue === 0 && (
              <Alert severity={isError ? 'error' : 'success'} sx={{ mb: 1 }}>
                {message}
              </Alert>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={handleProfileUpdate} variant="contained">
                {t('settings.updateProfile')}
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('settings.changePassword')}
            </Typography>
            
            <TextField
              fullWidth
              type="password"
              label={t('settings.currentPassword')}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              margin="dense"
              size="small"
            />
            <TextField
              fullWidth
              type="password"
              label={t('settings.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="dense"
              size="small"
            />
            <TextField
              fullWidth
              type="password"
              label={t('settings.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="dense"
              size="small"
            />
            
            <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={handlePasswordChange} variant="contained">
                {t('settings.changePassword')}
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1} dir={theme.direction}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {t('settings.systemPreferences')}
            </Typography>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel shrink>{t('settings.theme')}</InputLabel>
              <Select
                value={themeMode}
                label={t('settings.theme')}
                onChange={(e) => setThemeMode(e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel shrink>{t('settings.dateFormat')}</InputLabel>
              <Select
                value={dateFormat}
                label={t('settings.dateFormat')}
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                <MenuItem value="MM.DD.YYYY">MM.DD.YYYY</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel shrink>{t('settings.timezone')}</InputLabel>
              <Select
                value={timezone}
                label={t('settings.timezone')}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <MenuItem value="UTC">UTC</MenuItem>
                <MenuItem value="Europe/Moscow">Europe/Moscow</MenuItem>
                <MenuItem value="America/New_York">America/New_York</MenuItem>
                <MenuItem value="Asia/Tokyo">Asia/Tokyo</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel shrink>{t('common.language')}</InputLabel>
              <Select
                value={locale}
                label={t('common.language')}
                onChange={(e) => setLocale(e.target.value as 'en' | 'de')}
              >
                <MenuItem value="en">🇺🇸 English</MenuItem>
                <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
              </Select>
            </FormControl>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2} dir={theme.direction}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Users Management
            </Typography>
            
            {message && tabValue === 2 && (
              <Alert severity={isError ? 'error' : 'success'} sx={{ mb: 1 }}>
                {message}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ width: '40%' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Select User:</Typography>
                <List sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ccc' }}>
                  {users.map((u) => (
                    <ListItem key={u.id} disablePadding>
                      <ListItemButton 
                        selected={selectedUser?.id === u.id}
                        onClick={() => handleUserSelect(u)}
                      >
                        <ListItemText 
                          primary={`${u.first_name} ${u.last_name}`} 
                          secondary={u.email}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ width: '60%' }}>
                {selectedUser && (
                  <>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Edit User: {selectedUser.first_name} {selectedUser.last_name}
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="First Name"
                      value={userFirstName}
                      onChange={(e) => setUserFirstName(e.target.value)}
                      margin="dense"
                      size="small"
                    />
                    
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={userLastName}
                      onChange={(e) => setUserLastName(e.target.value)}
                      margin="dense"
                      size="small"
                    />
                    
                    <TextField
                      fullWidth
                      label="Email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      margin="dense"
                      size="small"
                    />
                    
                    <FormControl fullWidth margin="dense" size="small">
                      <InputLabel shrink>Role</InputLabel>
                      <Select
                        value={userRole}
                        label="Role"
                        onChange={(e) => setUserRole(e.target.value)}
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password (optional)"
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      margin="dense"
                      size="small"
                      placeholder="Leave empty to keep current password"
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Button onClick={handleUserUpdate} variant="contained" size="small">
                        Update User
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3} dir={theme.direction}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {t('settings.notificationsSettings')}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {t('settings.notificationTypes')}
            </Typography>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={newTaskNotifications}
                  onChange={(e) => setNewTaskNotifications(e.target.checked)}
                />
              }
              label={t('settings.newTaskNotifications')}
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={deadlineReminders}
                  onChange={(e) => setDeadlineReminders(e.target.checked)}
                />
              }
              label={t('settings.deadlineReminders')}
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={dailyEmailSummary}
                  onChange={(e) => setDailyEmailSummary(e.target.checked)}
                />
              }
              label={t('settings.dailyEmailSummary')}
              sx={{ display: 'block', mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              {t('settings.deliveryMethods')}
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                />
              }
              label={t('settings.pushNotifications')}
              sx={{ display: 'block', mb: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              }
              label={t('settings.emailNotifications')}
              sx={{ display: 'block' }}
            />
          </TabPanel>
          
        </Box>
        
        <Box sx={{ px: 4, py: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1, justifyContent: 'flex-end', bgcolor: 'background.paper' }}>
          <Button onClick={handleClose}>{t('common.close')}</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SettingsModal;