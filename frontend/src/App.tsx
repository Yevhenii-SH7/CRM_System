import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { useAuth } from './hooks/useAuth';
import theme from './theme';
import ErrorBoundary from './components/ErrorBoundary';

import HomePage from './pages/HomePage';

const Dashboard = lazy(() => import('./pages/Dashboard'));

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ErrorBoundary>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
              </Box>
            }>
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/dashboard" element={
          <ErrorBoundary>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
              </Box>
            }>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <LocaleProvider>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}

export default App;