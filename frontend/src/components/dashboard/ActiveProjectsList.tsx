import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Button, Skeleton } from '@mui/material';
import { useLocale } from '../../contexts/LocaleContext';
import { SectionTitle, FlexSpaceBetween } from '../styled/SharedStyled';

interface Project {
  id: number;
  title: string;
  completed_tasks: number;
  total_tasks: number;
}

interface ActiveProjectsListProps {
  projects: Project[];
  loading?: boolean;
  onNavigateToProjects?: () => void;
}

const ActiveProjectsList = React.memo(({ projects, loading, onNavigateToProjects }: ActiveProjectsListProps) => {
  const { t } = useLocale();
  
  return (
    <Card>
      <CardContent>
        <FlexSpaceBetween mb={2}>
          <SectionTitle variant="subtitle1">
            {t('dashboard.activeProjects')}
          </SectionTitle>
          <Button 
            size="small" 
            onClick={onNavigateToProjects}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            {t('dashboard.allProjects')}
          </Button>
        </FlexSpaceBetween>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Box key={index}>
                <Skeleton variant="text" width="80%" height={24} className="skeleton-loading" />
                <Skeleton variant="rectangular" height={20} sx={{ borderRadius: 3 }} className="skeleton-loading" />
              </Box>
            ))
          ) : (
            projects.slice(0, 3).map((project) => (
              <Box key={project.id}>
                <FlexSpaceBetween mb={1}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      wordWrap: 'break-word', 
                      overflowWrap: 'break-word', 
                      maxWidth: '70%',
                      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {project.title}
                  </Typography>
                  <Typography 
                    variant="caption"
                    sx={{
                      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
                    }}
                  >
                    {project.completed_tasks}/{project.total_tasks}
                  </Typography>
                </FlexSpaceBetween>
                <LinearProgress
                  variant="determinate"
                  value={project.total_tasks > 0 ? (project.completed_tasks / project.total_tasks) * 100 : 0}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

export default ActiveProjectsList;