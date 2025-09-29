import React from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { useLocale } from '../../contexts/LocaleContext';
import { SectionTitle, FlexSpaceBetween } from '../styled/SharedStyled';

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
}

interface RecentTasksTableProps {
  tasks: Task[];
  priorityColors: Record<string, string>;
  statusColors?: Record<string, string>;
  getStatusColor?: (status: string) => string;
  onNavigateToTasks?: () => void;
}

const RecentTasksTable = React.memo(({ tasks, priorityColors, statusColors, getStatusColor, onNavigateToTasks }: RecentTasksTableProps) => {
  const { t } = useLocale();
  
  return (
    <Card>
      <CardContent>
        <FlexSpaceBetween>
          <SectionTitle variant="subtitle1">{t('dashboard.recentTasks')}</SectionTitle>
          <Button 
            size="small" 
            onClick={onNavigateToTasks}
            sx={{
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
            }}
          >
            {t('dashboard.allTasks')}
          </Button>
        </FlexSpaceBetween>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {t('common.title')}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {t('common.priority')}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {t('common.status')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.slice(0, 5).map((task) => (
                <TableRow key={task.id}>
                  <TableCell
                    sx={{
                      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
                    }}
                  >
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      size="small"
                      sx={{
                        backgroundColor: priorityColors[task.priority as keyof typeof priorityColors],
                        color: 'white',
                        fontSize: '0.7rem',
                        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor
                          ? getStatusColor(task.status)
                          : (statusColors?.[task.status as keyof typeof statusColors] || '#607D8B'),
                        color: 'white',
                        fontSize: '0.7rem',
                        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
});

export default RecentTasksTable;