import React from 'react';
import { Card, CardContent, Box, Button } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { SectionTitle } from '../styled/SharedStyled';

interface QuickActionsPanelProps {
  onCreateTask?: () => void;
  onCreateProject?: () => void;
}

const QuickActionsPanel = React.memo(({ onCreateTask, onCreateProject }: QuickActionsPanelProps) => {
  return (
    <Card>
      <CardContent>
        <SectionTitle variant="h6" mb={2}>Quick Actions</SectionTitle>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateTask}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            Create Task
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreateProject}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            Create Project
          </Button>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            Search
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});

export default QuickActionsPanel;