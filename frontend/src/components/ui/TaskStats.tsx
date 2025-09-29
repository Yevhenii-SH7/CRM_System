import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import dayjs from 'dayjs';

interface Task {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

interface TaskStatsProps {
  tasks: Task[];
}

const statusColors = {
  'To Do': '#e3f2fd',
  'In Progress': '#fff3e0',
  'Done': '#e8f5e8'
};

const statusLabels = {
  'To Do': '📋 To Do',
  'In Progress': '🔄 In Progress',
  'Done': '✅ Done'
};

const TaskStats = ({ tasks }: TaskStatsProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const todoTasks = tasks.filter(task => task.status === 'To Do').length;
  
  const overdueTasks = tasks.filter(task => 
    task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day') && task.status !== 'Done'
  ).length;
  
  const todayTasks = tasks.filter(task => 
    task.due_date && dayjs(task.due_date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  ).length;
  
  const highPriorityTasks = tasks.filter(task => 
    task.priority === 'High' && task.status !== 'Done'
  ).length;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Ensure totalEstimated and totalActual are numbers
  const totalEstimated = tasks.reduce((sum, task) => sum + (Number(task.estimated_hours) || 0), 0);
  const totalActual = tasks.reduce((sum, task) => sum + (Number(task.actual_hours) || 0), 0);
  
  // Prepare data for distribution chart
  const statusDistribution = [
    { status: 'To Do', count: todoTasks, color: statusColors['To Do'] },
    { status: 'In Progress', count: inProgressTasks, color: statusColors['In Progress'] },
    { status: 'Done', count: completedTasks, color: statusColors['Done'] }
  ];
  
  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: <Assignment />,
      color: '#1976d2',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: <CheckCircle />,
      color: '#4caf50',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: <Schedule />,
      color: '#ff9800',
    },
    {
      title: 'To Do',
      value: todoTasks,
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
  ];

  return (
    <Box>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={2} mb={3}>
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ color: stat.color, fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color }}>
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr' }} gap={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>📊 Task Distribution by Status</Typography>
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={100}>
              <Box display="flex" width="100%" maxWidth={600}>
                {statusDistribution.map((item) => (
                  <Box 
                    key={item.status}
                    sx={{ 
                      flex: item.count || 0.01,
                      height: 40,
                      backgroundColor: item.color,
                      border: '1px solid rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: '#333',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    {item.count > 0 ? `${statusLabels[item.status as keyof typeof statusLabels]}: ${item.count}` : ''}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box display="flex" justifyContent="center" mt={2} flexWrap="wrap" gap={2}>
              {statusDistribution.map((item) => (
                <Box key={item.status} display="flex" alignItems="center">
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      backgroundColor: item.color, 
                      borderRadius: '50%',
                      mr: 1,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Typography variant="body2">
                    {statusLabels[item.status as keyof typeof statusLabels]}: {item.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>📊 Completion Progress</Typography>
              <Box mb={1}>
                <Typography variant="body2" color="text.secondary">
                  {completionRate.toFixed(1)}% completed
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completionRate} 
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>⚠️ Important Metrics</Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {overdueTasks > 0 && (
                  <Chip 
                    label={`${overdueTasks} overdue`}
                    color="error"
                    size="small"
                  />
                )}
                {todayTasks > 0 && (
                  <Chip 
                    label={`${todayTasks} today`}
                    color="warning"
                    size="small"
                  />
                )}
                {highPriorityTasks > 0 && (
                  <Chip 
                    label={`${highPriorityTasks} high priority`}
                    color="error"
                    variant="outlined"
                    size="small"
                  />
                )}
                {overdueTasks === 0 && todayTasks === 0 && highPriorityTasks === 0 && (
                  <Chip 
                    label="All under control ✅"
                    color="success"
                    size="small"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {(totalEstimated > 0 || totalActual > 0) && (
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>⏱️ Time Tracking</Typography>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Planned hours
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {totalEstimated.toFixed(1)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Actually spent
                  </Typography>
                  <Typography variant="h5" color="secondary">
                    {totalActual.toFixed(1)}
                  </Typography>
                </Box>
              </Box>
              {totalEstimated > 0 && totalActual > 0 && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Planning accuracy: {((totalEstimated / totalActual) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default TaskStats;