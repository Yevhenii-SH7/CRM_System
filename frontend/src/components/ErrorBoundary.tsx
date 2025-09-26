import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          p={2}
        >
          <Typography variant="h4" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" gutterBottom>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={this.handleRetry}
            sx={{ mt: 2 }}
          >
            Try again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;