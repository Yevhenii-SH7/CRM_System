import { Container, Typography, Paper, Grid, Card, CardContent, Box, Chip } from '@mui/material'
import styles from './HomePage.module.css'
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/ui/AuthModal';
import Header from '../components/layout/Header';
import { useState } from 'react';

function HomePage() {
  useAuth(); // We only need the context provider
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register' | 'forgot-password'>('login');

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <>
      <Header onAuthClick={(type) => {
        setAuthModalType(type);
        setAuthModalOpen(true);
      }} />

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={handleCloseAuthModal} 
        type={authModalType} 
      />

      <Container id="hero" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
          <Box className={styles.box}>
            <Typography variant="h3" component="h1" gutterBottom className={styles.title}>
              Freelance Planner
            </Typography>
            <Typography variant="h6" className={styles.description}>
              Your Project Management Center
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  ✅ Task Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, edit, and track tasks with an intuitive Kanban board
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  ✅ Client Organization
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Maintain a database of your clients: contacts, companies, and collaboration history
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  ✅ Work Planning
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set task statuses, deadlines, and track progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            💡 MVP Features:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label="Registration and Authentication (JWT)" />
            <Chip label="CRUD Companies and Contacts" />
            <Chip label="Create and Update Tasks" />
            <Chip label="Kanban Board" />
            <Chip label="Mobile Adaptation" />
          </Box>
          <Typography variant="body2" color="text.secondary">
           Open source project
          </Typography>
        </Paper>
      </Container>
    </>
  )
}

export default HomePage