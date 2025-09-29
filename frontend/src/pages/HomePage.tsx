import { Container, Typography, Paper, Grid, Card, CardContent, Box, Chip } from '@mui/material'
import styles from './HomePage.module.css'
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../contexts/LocaleContext';
import AuthModal from '../components/ui/AuthModal';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useState } from 'react';

function HomePage() {
  useAuth(); // We only need the context provider
  const { t } = useLocale();
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
              {t('homepage.title')}
            </Typography>
            <Typography variant="h6" className={styles.description}>
              {t('homepage.subtitle')}
            </Typography>
          </Box>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  ✅ {t('homepage.taskManagement')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('homepage.taskManagementDesc')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  ✅ {t('homepage.clientOrganization')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('homepage.clientOrganizationDesc')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  ✅ {t('homepage.workPlanning')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('homepage.workPlanningDesc')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            💡 {t('homepage.mvpFeatures')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip label={t('homepage.authFeature')} />
            <Chip label={t('homepage.crudFeature')} />
            <Chip label={t('homepage.tasksFeature')} />
            <Chip label={t('homepage.kanbanFeature')} />
            <Chip label={t('homepage.mobileFeature')} />
          </Box>
          <Typography variant="body2" color="text.secondary">
           {t('homepage.openSource')}
          </Typography>
        </Paper>
      </Container>
      <Box sx={{ pb: 8 }} />
      <Footer />
    </>
  )
}

export default HomePage