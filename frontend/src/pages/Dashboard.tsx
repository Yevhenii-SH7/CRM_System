import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../contexts/LocaleContext';
import * as React from 'react';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import SettingsModal from '../components/ui/SettingsModal';
import Footer from '../components/layout/Footer';
import { CircularProgress, Box as MuiBox } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

// Import icons
import {
  SpaceDashboard as DashboardIcon,
  Task as TaskIcon,
  ViewKanban as ViewKanbanIcon,
  CalendarToday as CalendarTodayIcon,
  ListAlt as ListAltIcon,
  Folder as FolderIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

// Preload critical components to improve LCP
import DashboardComponent from '../components/Dashboard';

// Direct imports for Railway compatibility
import Calendar from './Calendar';
import MyTasks from '../components/MyTasks';
import Projects from '../components/Projects';
import Clients from '../components/Clients';

const drawerWidth = 240;
const appBarHeight = 78; // Match homepage header height

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(5)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(6)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(2, 1),
  minHeight: `${appBarHeight}px`,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    variants: [
      {
        props: ({ open }) => open,
        style: {
          ...openedMixin(theme),
          '& .MuiDrawer-paper': openedMixin(theme),
        },
      },
      {
        props: ({ open }) => !open,
        style: {
          ...closedMixin(theme),
          '& .MuiDrawer-paper': closedMixin(theme),
        },
      },
    ],
  }),
);

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLocale();
  console.log('Dashboard user:', user); // Debug log
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [activePage, setActivePage] = React.useState('Dashboard');
  const [projectIdToView, setProjectIdToView] = React.useState<number | null>(null);

  // Handle navigation state from location
  React.useEffect(() => {
    if (location.state && location.state.activePage) {
      setActivePage(location.state.activePage);
      // Only set projectIdToView if we're actually navigating to the projects page
      // This prevents automatic opening on refresh
      if (location.state.activePage === 'All Projects' && location.state.projectId) {
        setProjectIdToView(location.state.projectId);
      }
      // Clear the location state after using it to prevent reopening on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'Calendar':
        return <Calendar onNavigateToTasks={() => setActivePage('My Tasks')} />;
      case 'My Tasks':
        return <MyTasks onNavigateToCalendar={() => setActivePage('Calendar')} />;
      case 'All Projects':
        return <Projects 
          projectIdToView={projectIdToView} 
          onProjectViewed={() => setProjectIdToView(null)} 
        />;
      case 'Clients':
        return <Clients />;
      case 'Dashboard':
        return (
          <DashboardComponent 
            onNavigateToTasks={() => setActivePage('My Tasks')}
            onNavigateToProjects={() => setActivePage('All Projects')}
            onCreateTask={() => setActivePage('My Tasks')}
            onCreateProject={() => setActivePage('All Projects')}
          />
        );
      default:
        return (
          <MuiBox>
            <Typography variant="h4" gutterBottom>
              {activePage}
            </Typography>
            <Typography sx={{ marginBottom: 2 }}>
              Content for page "{activePage}" will be added later.
            </Typography>
          </MuiBox>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar id="AppBar" position="fixed" open={open}>
        <Toolbar id="Toolbar" variant="dense" sx={{ minHeight: appBarHeight, py: 0 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              {
                marginRight: 5,
              },
              open && { display: 'none' },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CRM Task Planner
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {t('messages.welcome')}, {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
                    {t('messages.role')}: {user.role || t('common.user')}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.first_name?.[0]?.toUpperCase() || ''}
                  {user.last_name?.[0]?.toUpperCase() || ''}
                </Avatar>
                <Button color="inherit" onClick={logout} size="small">
                  {t('navigation.logout')}
                </Button>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: 'white' }}>
                Guest User
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader id="DrawerHeader">
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {[
            { text: t('navigation.dashboard'), key: 'Dashboard', icon: <DashboardIcon /> },
            { text: t('navigation.tasks'), key: 'My Tasks', icon: <TaskIcon /> },
            { text: t('navigation.clients'), key: 'Clients', icon: <ViewKanbanIcon /> },
            { text: t('navigation.calendar'), key: 'Calendar', icon: <CalendarTodayIcon /> },
            { text: 'All Tasks', key: 'All Tasks', icon: <ListAltIcon /> },
            { text: t('navigation.projects'), key: 'All Projects', icon: <FolderIcon /> },
            { text: 'Project Analytics', key: 'Project Analytics', icon: <AnalyticsIcon /> },
          ].map((item) => (
            <ListItem key={item.key} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => setActivePage(item.key)}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                  },
                  open
                    ? {
                        justifyContent:'flex-start',
                      }
                    : {
                        justifyContent: 'center',
                      },
                ]}
              >
                <Box sx={{ mr: open ? 2 : 0 }}>
                  {item.icon}
                </Box>
                {open && (
                  <Typography variant="body2">
                    {item.text}
                  </Typography>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {[
            { text: t('navigation.settings'), key: 'Settings', icon: <SettingsIcon /> },
          ].map((item) => (
            <ListItem key={item.key} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => {
                  if (item.key === 'Settings') {
                    setSettingsOpen(true);
                  }
                }}
                sx={[
                  {
                    minHeight: 48,
                    px: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                  },
                  open
                    ? {
                        justifyContent: 'flex-start',
                      }
                    : {
                        justifyContent: 'center',
                      },
                ]}
              >
                <Box sx={{ mr: open ? 2 : 0 }}>
                  {item.icon}
                </Box>
                {open && (
                  <Typography variant="body2">
                    {item.text}
                  </Typography>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, pb: 8 }}>
        {renderActivePage()}
      </Box>
      <Footer />
      <SettingsModal 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </Box>
  );
}