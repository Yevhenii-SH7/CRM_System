import React from 'react';
import { Card, CardContent, Box, Button } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useLocale } from '../../contexts/LocaleContext';
import { SectionTitle } from '../styled/SharedStyled';

interface QuickActionsPanelProps {
  onCreateTask?: () => void;
  onCreateProject?: () => void;
}

const QuickActionsPanel = React.memo(({ onCreateTask, onCreateProject }: QuickActionsPanelProps) => {
  const { t } = useLocale();
  
  return (
    <Card>
      <CardContent>
        <SectionTitle variant="h6" mb={2}>{t('dashboard.quickActions')}</SectionTitle>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateTask}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            {t('dashboard.createTask')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreateProject}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            {t('dashboard.createProject')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => alert('Under development')}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            {t('common.search')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

export default QuickActionsPanel;