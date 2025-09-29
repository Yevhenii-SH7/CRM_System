import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Alert,
  Typography,
  Button,
  Skeleton
} from '@mui/material';
import { useLocale } from '../contexts/LocaleContext';
import {
  WorkOutline,
  DoneAll,
  ListAlt,
  AttachMoney,
  People,
  Business,
  AccessTime,
} from '@mui/icons-material';
import get from 'lodash-es/get';
import { dashboardAPI, Task } from '../services/api';
import MetricCard from './dashboard/MetricCard';
import RecentTasksTable from './dashboard/RecentTasksTable';
import ActiveProjectsList from './dashboard/ActiveProjectsList';
import UpcomingDeadlinesList from './dashboard/UpcomingDeadlinesList';
import QuickActionsPanel from './dashboard/QuickActionsPanel';
import BasicCharts from './dashboard/BasicCharts';
import ErrorBoundary from './ErrorBoundary';

const CHART_COLORS = [
  '#2196F3', '#FF9800', '#4CAF50', '#E91E63', '#9C27B0', '#00BCD4',
  '#FF5722', '#8BC34A', '#3F51B5', '#FFC107', '#795548', '#607D8B'
];

interface DashboardProps {
  onNavigateToTasks?: () => void;
  onNavigateToProjects?: () => void;
  onCreateTask?: () => void;
  onCreateProject?: () => void;
}

interface DashboardSummary {
  total_tasks: number;
  completed_tasks: number;
  active_projects: number;
  total_projects: number;
  overdue_tasks: number;
  total_clients: number;
  total_users: number;
  avg_task_hours: number;
  earnings_month: number;
}

interface RecentTask {
  id: number;
  title: string;
  priority: string;
  status: string;
}

interface ActiveProject {
  id: number;
  title: string;
  completed_tasks: number;
  total_tasks: number;
}

interface ChartData {
  tasksByStatus?: Array<{ name: string; value: number }>;
  tasksByProject?: Array<{ name: string; tasks: number }>;
  upcomingDeadlines?: Array<{ id: number; title: string; due_date: string }>;
  monthlyEarnings?: Array<{ date: string; earnings: number }>;
}



interface ProjectData {
  id: number;
  title: string;
  completed_tasks: number;
  total_tasks: number;
}

function Dashboard({ onNavigateToTasks, onNavigateToProjects, onCreateTask, onCreateProject }: DashboardProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [summary, setSummary] = useState<DashboardSummary>({
    total_tasks: 0,
    completed_tasks: 0,
    active_projects: 0,
    total_projects: 0,
    overdue_tasks: 0,
    total_clients: 0,
    total_users: 0,
    avg_task_hours: 0,
    earnings_month: 0
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [chartData, setChartData] = useState<ChartData>({});

  const priorityColors = useMemo(() => ({
    'Low': '#66bb6a',
    'Medium': '#ff9800',
    'High': '#f44336',
    'Niedrig': '#66bb6a',
    'Mittel': '#ff9800',
    'Hoch': '#f44336'
  }), []);

  const getColorByString = useCallback((str: string): string => {
    if (!str) return CHART_COLORS[0];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
    }
    return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length];
  }, []);

  const getStatusColor = useCallback((label: string): string => {
    const statusMap: Record<string, string> = {
      'To Do': '#2196F3',
      'In Progress': '#FF9800',
      'Done': '#4CAF50',
      'Zu erledigen': '#2196F3',
      'In Bearbeitung': '#FF9800',
      'Erledigt': '#4CAF50',
      'Test Project': '#2196F3',
      'CRM System Development': '#4CAF50',
      'Mobile App Development': '#FF5722',
      'API Integration Project': '#FFC107',
      'Website Redesign': '#9C27B0',
      'Database Optimization': '#00BCD4'
    };
    return get(statusMap, label, getColorByString(label));
  }, [getColorByString]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const [summaryData, tasksData, projectsData] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getRecentTasks(),
        dashboardAPI.getActiveProjects(),
      ]);

      // Safe data access using lodash-es/get
      setSummary({
        total_tasks: get(summaryData, 'total_tasks', 0),
        completed_tasks: get(summaryData, 'completed_tasks', 0),
        active_projects: get(summaryData, 'active_projects', 0),
        total_projects: get(summaryData, 'total_projects', 0),
        overdue_tasks: get(summaryData, 'overdue_tasks', 0),
        total_clients: get(summaryData, 'total_clients', 0),
        total_users: get(summaryData, 'total_users', 0),
        avg_task_hours: get(summaryData, 'avg_task_hours', 0),
        earnings_month: get(summaryData, 'earnings_month', 0)
      });

      // Ensure tasksData is an array before mapping
      const tasksArray = Array.isArray(tasksData) ? tasksData : [];
      setRecentTasks(tasksArray.slice(0, 5).map((task: Task) => ({
        id: get(task, 'id', 0),
        title: get(task, 'title', 'Unbekannte Aufgabe'),
        priority: get(task, 'priority', 'Mittel'),
        status: get(task, 'status', 'Zu erledigen')
      })));

      // Ensure projectsData is an array before mapping
      const projectsArray = Array.isArray(projectsData) ? projectsData : [];
      setActiveProjects(projectsArray.slice(0, 5).map((project: ProjectData) => ({
        id: get(project, 'id', 0),
        title: get(project, 'title', 'Unbekanntes Projekt'),
        completed_tasks: get(project, 'completed_tasks', 0),
        total_tasks: get(project, 'total_tasks', 0)
      })));

      setLoading(false);

      // Load charts after critical content
      dashboardAPI.getCharts()
        .then(chartData => {
          setChartData({
            tasksByStatus: get(chartData, 'tasksByStatus', []),
            tasksByProject: get(chartData, 'tasksByProject', []),
            upcomingDeadlines: get(chartData, 'upcomingDeadlines', []),
            monthlyEarnings: get(chartData, 'monthlyEarnings', [])
          });
        })
        .catch(() => setChartData({ tasksByStatus: [], tasksByProject: [], upcomingDeadlines: [], monthlyEarnings: [] }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Fehler beim Laden der Dashboard-Daten');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <ErrorBoundary>
      <Box sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        pb: { xs: 1, sm: 2, md: 3 },
        pt: 0,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 3,
            fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            fontWeight: 600,
            fontSize: '2.5rem',
            lineHeight: 1.2,
            color: 'primary.main'
          }}
        >
          📊 {t('dashboard.title')}
        </Typography>

        {/* Metrics Section */}
        <Box component="section" sx={{ mb: 3 }}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={2}>
            {loading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={100} />
              ))
            ) : (
              <>
                <MetricCard
                  title={t('dashboard.totalProjects')}
                  value={summary.total_projects || 0}
                  icon={<WorkOutline />}
                  color="#42a5f5"
                  loading={loading}
                />
                <MetricCard
                  title={t('dashboard.activeProjects')}
                  value={summary.active_projects || 0}
                  icon={<DoneAll />}
                  color="#66bb6a"
                  loading={loading}
                />
                <MetricCard
                  title={t('dashboard.totalTasks')}
                  value={summary.total_tasks || 0}
                  icon={<ListAlt />}
                  color="#ff9800"
                  loading={loading}
                />
                <MetricCard
                  title={t('dashboard.monthlyData')}
                  value={summary.earnings_month || 0}
                  icon={<AttachMoney />}
                  color="#ab47bc"
                  loading={loading}
                  isCurrency={true}
                />
                <MetricCard
                  title={t('dashboard.totalClients')}
                  value={summary.total_clients || 0}
                  icon={<Business />}
                  color="#FF9800"
                  loading={loading}
                />
                <MetricCard
                  title={t('dashboard.totalUsers')}
                  value={summary.total_users || 0}
                  icon={<People />}
                  color="#2196F3"
                  loading={loading}
                />
                <MetricCard
                  title={t('dashboard.avgTaskHours')}
                  value={summary.avg_task_hours || 0}
                  icon={<AccessTime />}
                  color="#9C27B0"
                  loading={loading}
                />
              </>
            )}
          </Box>
        </Box>

        {/* Error Handling */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
            <Button onClick={() => loadDashboardData()} sx={{ ml: 2 }}>
              Wiederholen
            </Button>
          </Alert>
        )}

        {/* Main Content Grid */}
        <Box component="section" sx={{ mb: 3 }}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} gap={2}>
            <RecentTasksTable 
              tasks={recentTasks} 
              priorityColors={priorityColors}
              getStatusColor={getStatusColor}
              onNavigateToTasks={onNavigateToTasks}
            />
            <ActiveProjectsList 
              projects={activeProjects}
              onNavigateToProjects={onNavigateToProjects}
            />
          </Box>
        </Box>

{/* Charts Section */}
        <Box component="section" sx={{ mb: 3 }}>
          <BasicCharts 
            chartData={chartData}
            getStatusColor={getStatusColor}
            getColorByString={getColorByString}
          />
        </Box>
        
        {/* Secondary Content Grid */}
        <Box component="section" sx={{ mb: 3 }}>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} gap={2}>
            <UpcomingDeadlinesList 
              deadlines={get(chartData, 'upcomingDeadlines', [])}
            />
            <QuickActionsPanel 
              onCreateTask={onCreateTask}
              onCreateProject={onCreateProject}
            />
          </Box>
        </Box>

        
      </Box>
    </ErrorBoundary>
  );
}

export default Dashboard;