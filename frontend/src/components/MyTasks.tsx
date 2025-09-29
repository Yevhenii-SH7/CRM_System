import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarTodayIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  DragEndEvent 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import KanbanBoard from './ui/KanbanBoard';
import CreateTaskDialog from './ui/CreateTaskDialog';
import EditTaskDialog from './ui/EditTaskDialog';
import TaskStats from './ui/TaskStats';
import { taskAPI, projectAPI, authAPI, API_ENDPOINT } from '../services/api';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types/task';

interface MyTasksProps {
  onNavigateToCalendar?: () => void;
}

function MyTasks({ onNavigateToCalendar }: MyTasksProps) {
  const navigate = useNavigate();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>('');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<number | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [projects, setProjects] = useState<Record<number, string>>({});
  const [users, setUsers] = useState<Record<number, string>>({});
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const priorityColors = useMemo(() => ({
    Low: '#4caf50',
    Medium: '#ff9800',
    High: '#f44336',
    Critical: '#d32f2f',
  }), []);

  const columns = useMemo(() => [
    { id: 'To Do', title: '📋 To Do', color: '#e3f2fd' },
    { id: 'In Progress', title: '🔄 In Progress', color: '#fff3e0' },
    { id: 'Done', title: '✅ Done', color: '#e8f5e8' }
  ], []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await taskAPI.getTasks();
      const statusMap: Record<number, 'To Do' | 'In Progress' | 'Done'> = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };
      const tasksWithStatus = response.map(task => ({
        ...task,
        id: task.id!,
        status: statusMap[task.status_id as number] || 'To Do'
      })) as Task[];
      setTasks(tasksWithStatus);
    } catch {
      setError('Error loading tasks. Please check your connection to the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDeletedTasks = useCallback(async () => {
    try {
      const response = await taskAPI.getTasks(true);
      const statusMap: Record<number, 'To Do' | 'In Progress' | 'Done'> = { 1: 'To Do', 2: 'In Progress', 3: 'Done' };
      const tasksWithStatus = response.map(task => ({
        ...task,
        id: task.id!,
        status: statusMap[task.status_id as number] || 'To Do'
      })) as Task[];
      setDeletedTasks(tasksWithStatus);
    } catch {
      setError('Error loading deleted tasks. Please check your connection to the server.');
    }
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      const response = await projectAPI.getProjects();
      const projectMap = response.reduce((acc, project) => {
        if (project.id) acc[project.id] = project.title;
        return acc;
      }, {} as Record<number, string>);
      setProjects(projectMap);
    } catch {
      setError('Failed to load projects');
    }
  }, []);

  const loadUsers = useCallback(async (retryCount = 0) => {
    try {
      const response = await authAPI.getUsers();
      if (Array.isArray(response)) {
        const userMap = response.reduce((acc, user) => {
          if (user.id) acc[user.id] = `${user.first_name} ${user.last_name}`;
          return acc;
        }, {} as Record<number, string>);
        setUsers(userMap);
      } else {
        console.warn('Users response is not an array, using empty users map');
        setUsers({});
      }
    } catch (error) {
      console.error('Error loading users:', error);
      if (retryCount < 2) {
        console.log(`Retrying users load (attempt ${retryCount + 1})`);
        setTimeout(() => loadUsers(retryCount + 1), 1000);
      } else {
        setUsers({}); // Set empty users map instead of showing error
      }
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...tasks];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (dateFilter === 'today') {
      const today = dayjs().format('YYYY-MM-DD');
      filtered = filtered.filter(task => 
        task.due_date && dayjs(task.due_date).format('YYYY-MM-DD') === today
      );
    } else if (dateFilter === 'week') {
      const weekEnd = dayjs().add(7, 'day');
      filtered = filtered.filter(task => 
        task.due_date && dayjs(task.due_date).isBefore(weekEnd)
      );
    } else if (dateFilter === 'custom' && customDate) {
      const selected = dayjs(customDate).format('YYYY-MM-DD');
      filtered = filtered.filter(task => 
        task.due_date && dayjs(task.due_date).format('YYYY-MM-DD') === selected
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter, dateFilter, customDate]);

  useEffect(() => {
    loadTasks();
    loadProjects();
    loadUsers();
  }, [loadTasks, loadProjects, loadUsers]);

  useEffect(() => {
    if (showDeleted) {
      loadDeletedTasks();
    }
  }, [showDeleted, loadDeletedTasks]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            setIsAddingTask(true);
            break;
          case 'c':
            event.preventDefault();
            if (onNavigateToCalendar) {
              onNavigateToCalendar();
            } else {
              navigate('/calendar');
            }
            break;
          case 's':
            event.preventDefault();
            setShowStats(!showStats);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showStats, onNavigateToCalendar, navigate]);

  const handleDragStart = useCallback((event: { active: { id: string | number } }) => {
    const task = tasks.find(t => t.id === parseInt(event.active.id.toString()));
    setActiveTask(task || null);
  }, [tasks]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;

    const taskId = parseInt(active.id.toString());
    const overId = over.id.toString();
    
    // Find the task being dragged
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Determine new status
    let newStatus: Task['status'];
    if (['To Do', 'In Progress', 'Done'].includes(overId)) {
      // Dropped on a column
      newStatus = overId as Task['status'];
    } else {
      // Dropped on another task - get the status of that task
      const overTask = tasks.find(t => t.id === parseInt(overId));
      if (!overTask) return;
      newStatus = overTask.status;
    }
    
    // If the status hasn't changed, do nothing
    if (task.status === newStatus) return;
    
    const statusMap = { 'To Do': 1, 'In Progress': 2, 'Done': 3 };
    
    try {
      await taskAPI.updateTask(taskId, { 
        status_id: statusMap[newStatus],
      });
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus, status_id: statusMap[newStatus] } : t
      ));
    } catch {
      setError('Failed to update task status. Please try again.');
    }
  }, [tasks]);

  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setDeleteTask(null);
    } catch {
      setError('Failed to delete task');
    }
  }, []);

  // TaskCard component for Kanban board
  interface TaskCardProps {
    task: Task;
  }

  function TaskCard({ task }: TaskCardProps) {
    return (
      <Card sx={{ mb: 1, p: 1 }}>
        <CardContent sx={{ '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box 
              sx={{ 
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                padding: '4px 8px',
                flex: 1,
                mr: 1,
                cursor: 'grab', // Add grab cursor to indicate draggable area
                '&:hover': {
                  backgroundColor: '#bbdefb',
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                {task.title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setEditTask(task);
                }}
                sx={{ 
                  color: 'primary.main', 
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)'
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDeleteTask(task.id);
                }}
                sx={{ 
                  color: 'error.main', 
                  p: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          {/* Due date and chips below */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {dayjs(task.due_date).format('MMM D')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Chip 
                label={task.status} 
                size="small" 
                sx={{ 
                  backgroundColor: columns.find(col => col.id === task.status)?.color || '#e0e0e0',
                  color: 'black',
                  fontWeight: 'bold',
                  height: '18px'
                }} 
              />
              <Chip 
                label={task.priority} 
                size="small" 
                sx={{ 
                  backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] || '#9e9e9e',
                  color: 'white',
                  fontWeight: 'bold',
                  height: '18px'
                }} 
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                {task.assigned_to && users[task.assigned_to] ? users[task.assigned_to].charAt(0) : 'U'}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {task.assigned_to && users[task.assigned_to] ? users[task.assigned_to] : 'Unassigned'}
              </Typography>
            </Box>
          </Box>
          {task.project_id && projects[task.project_id] && (
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={projects[task.project_id]} 
                size="small" 
                sx={{ 
                  backgroundColor: '#e0e0e0',
                  color: '#616161',
                  fontWeight: 'bold',
                  height: '18px'
                }} 
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">📋 My Tasks</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Go to calendar">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<CalendarTodayIcon />}
              onClick={onNavigateToCalendar}
              sx={{ boxShadow: 2 }}
            >
              Calendar
            </Button>
          </Tooltip>
          
          <Tooltip title="Show statistics (Ctrl+S)">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<BarChartIcon />}
              onClick={() => setShowStats(!showStats)}
              sx={{ boxShadow: 2 }}
            >
              Statistics
            </Button>
          </Tooltip>
          
          <Tooltip title="Show deleted tasks">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<DeleteIcon />}
              onClick={() => setShowDeleted(!showDeleted)}
              sx={{ boxShadow: 2 }}
            >
              Deleted ({deletedTasks.length})
            </Button>
          </Tooltip>
          
          <Tooltip title="Create task (Ctrl+N)">
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setIsAddingTask(true)}
              sx={{ boxShadow: 2 }}
            >
              Create Task
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select 
            labelId="status-label" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="To Do">To Do</MenuItem>
            <MenuItem value="In Progress">In Progress</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="priority-label">Priority</InputLabel>
          <Select 
            labelId="priority-label" 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)} 
            label="Priority"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="date-label">Date</InputLabel>
          <Select 
            labelId="date-label" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)} 
            label="Date"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="custom">Select Date</MenuItem>
          </Select>
        </FormControl>
        
        {dateFilter === 'custom' && (
          <TextField
            label="Date"
            type="date"
            size="small"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              }
            }}
            sx={{ minWidth: 150 }}
          />
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={loadTasks} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      )}

      {/* Statistics */}
      {showStats && !loading && !error && (
        <Box mb={3}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowStats(false)}
            >
              ← Back to My Tasks
            </Button>
          </Box>
          <TaskStats tasks={tasks} />
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Deleted tasks */}
      {showDeleted && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid #f44336', borderRadius: 1, backgroundColor: '#ffebee' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#d32f2f' }}>
              🗑️ Deleted tasks
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setShowDeleted(false)}
            >
              ← Back to My Tasks
            </Button>
          </Box>
          {deletedTasks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No deleted tasks
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {deletedTasks.map((task) => (
                <Card key={task.id} sx={{ mb: 1 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" sx={{ textDecoration: 'line-through' }}>
                        {task.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={task.status} 
                          size="small" 
                          sx={{ 
                            backgroundColor: columns.find(col => col.id === task.status)?.color || '#e0e0e0',
                            color: 'black',
                          }} 
                        />
                        <Chip 
                          label={task.priority} 
                          size="small" 
                          sx={{ 
                            backgroundColor: priorityColors[task.priority as keyof typeof priorityColors] || '#9e9e9e',
                            color: 'white',
                          }} 
                        />
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={async () => {
                            try {
                              // Call restore API endpoint
                              const response = await fetch(`${API_ENDPOINT}?action=tasks&restore=true`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                },
                                body: JSON.stringify({ id: task.id }),
                              });
                              
                              if (response.ok) {
                                // Remove from deleted tasks and reload main tasks
                                setDeletedTasks(prev => prev.filter(t => t.id !== task.id));
                                loadTasks();
                              }
                            } catch (error) {
                              console.error('Error restoring task:', error);
                            }
                          }}
                        >
                          Restore
                        </Button>
                      </Box>
                    </Box>

                    {task.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textDecoration: 'line-through' }}>
                        {task.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Deleted: {dayjs(task.deleted_at).format('MMM D, YYYY HH:mm')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Kanban board */}
      {!loading && !error && !showDeleted && (
        <KanbanBoard
          sensors={sensors}
          columns={columns}
          filteredTasks={filteredTasks}
          activeTask={activeTask}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          TaskCard={TaskCard}
        />
      )}

      {/* Empty state */}
      {!loading && !error && filteredTasks.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            📋 No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first task or change filters
          </Typography>
          <Button
            variant="contained"
            onClick={() => setIsAddingTask(true)}
          >
            ➕ Create first task
          </Button>
          <Typography variant="caption" color="text.secondary" mt={2} display="block">
            ⌨️ Keyboard shortcuts: Ctrl+N - create, Ctrl+C - calendar, Ctrl+S - statistics
          </Typography>
        </Box>
      )}

      {/* Create task dialog */}
      <CreateTaskDialog
        open={isAddingTask}
        onClose={() => setIsAddingTask(false)}
        onTaskCreated={() => {
          loadTasks();
        }}
      />

      {/* Edit task dialog */}
      <EditTaskDialog
        open={!!editTask}
        task={editTask}
        onClose={() => setEditTask(null)}
        onTaskUpdated={() => {
          loadTasks();
        }}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTask} onClose={() => setDeleteTask(null)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this task?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTask(null)}>Cancel</Button>
          <Button onClick={() => {
            if (deleteTask) {
              handleDeleteTask(deleteTask);
            }
          }} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyTasks;
















