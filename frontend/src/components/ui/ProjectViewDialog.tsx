import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useLocale } from '../../contexts/LocaleContext';
import { Project, taskAPI } from '../../services/api';
import EditTaskDialog from './EditTaskDialog';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  status_id: number;
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string;
  project?: string;
  project_id?: number;
  assigned_to?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

interface ProjectViewDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated?: () => void;
}

const ProjectViewDialog = ({ open, onClose, project, onProjectUpdated }: ProjectViewDialogProps) => {
  const { t } = useLocale();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'Medium' as Task['priority'],
    due_date: '',
    estimated_hours: '' as number | '',
  });

  const priorityColors = {
    Low: '#4caf50',
    Medium: '#ff9800',
    High: '#f44336'
  };

  const statusColors = {
    Active: '#2196f3',
    Completed: '#4caf50',
    Archived: '#9e9e9e',
    'To Do': '#e3f2fd',
    'In Progress': '#fff3e0',
    'Done': '#e8f5e8'
  };

  const statusNames = {
    1: 'To Do',
    2: 'In Progress',
    3: 'Done'
  };

  const statusIdColors = {
    1: '#e3f2fd',
    2: '#fff3e0',
    3: '#e8f5e8'
  };

  const loadProjectTasks = useCallback(async () => {
    if (!project) return;
    try {
      const allTasks = await taskAPI.getTasks();
      const projectTasks = allTasks.filter(task => task.project_id === project.id);
      
      // Convert APITask to Task interface expected by EditTaskDialog
      const convertedTasks: Task[] = projectTasks
        .filter(task => task.id !== undefined) // Filter out tasks without id
        .map(task => ({
          id: task.id!,
          title: task.title,
          description: task.description,
          status: task.status_id === 1 ? 'To Do' : task.status_id === 2 ? 'In Progress' : 'Done',
          status_id: task.status_id || 1,
          priority: task.priority as 'Low' | 'Medium' | 'High',
          due_date: task.due_date,
          project_id: task.project_id,
          assigned_to: task.assigned_to,
          created_at: task.created_at,
          updated_at: task.updated_at,
          deleted_at: task.deleted_at
        }));
      
      setTasks(convertedTasks);
    } catch (error) {
      console.error('Error loading project tasks:', error);
    }
  }, [project]);

  useEffect(() => {
    if (project && open) {
      loadProjectTasks();
    }
  }, [project, open, loadProjectTasks]);

  const handleAddTask = async () => {
    if (!project || !newTask.title.trim()) return;

    try {
      await taskAPI.createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        project_id: project.id,
        status_id: 1,
        due_date: newTask.due_date ? `${newTask.due_date} 23:59:59` : undefined,
        estimated_hours: newTask.estimated_hours || undefined,
      });
      
      setNewTask({ title: '', description: '', priority: 'Medium', due_date: '', estimated_hours: '' });
      setShowAddTask(false);
      loadProjectTasks();
      onProjectUpdated?.();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskAPI.updateTask(taskId, { status_id: 3 });
      loadProjectTasks();
      onProjectUpdated?.();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskAPI.deleteTask(taskId);
      loadProjectTasks();
      onProjectUpdated?.();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (!project) return null;

  const completedTasks = tasks.filter(task => task.status_id === 3).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{project.title}</Typography>
            <Box>
              <Chip
                label={project.status}
                size="small"
                sx={{ backgroundColor: statusColors[project.status], color: 'white', mr: 1 }}
              />
              <Chip
                label={project.priority}
                size="small"
                sx={{ backgroundColor: priorityColors[project.priority], color: 'white' }}
              />
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {project.description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.description}
            </Typography>
          )}

          <Box sx={{ mb: 2 }}>
            {project.hourly_rate && (
              <Typography variant="body2" color="text.secondary">
                Hourly Rate: €{project.hourly_rate.toFixed(2)}
              </Typography>
            )}
            {project.start_date && (
              <Typography variant="body2" color="text.secondary">
                Start: {dayjs(project.start_date).format('DD.MM.YYYY')}
              </Typography>
            )}
            {project.end_date && (
              <Typography variant="body2" color="text.secondary">
                End: {dayjs(project.end_date).format('DD.MM.YYYY')}
              </Typography>
            )}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('tasks.title')} ({completedTasks}/{tasks.length}) - {Math.round(progress)}%
            </Typography>
            
            <Button
              startIcon={<AddIcon />}
              onClick={() => setShowAddTask(!showAddTask)}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            >
              {t('dashboard.addTask')}
            </Button>

            {showAddTask && (
              <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <TextField
                  fullWidth
                  label={t('tasks.taskTitle')}
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  margin="normal"
                  size="small"
                />
                <TextField
                  fullWidth
                  label={t('common.description')}
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  margin="normal"
                  size="small"
                  multiline
                  rows={2}
                />
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel shrink>{t('common.priority')}</InputLabel>
                  <Select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                  >
                    <MenuItem value="Low">{t('tasks.low')}</MenuItem>
                    <MenuItem value="Medium">{t('tasks.medium')}</MenuItem>
                    <MenuItem value="High">{t('tasks.high')}</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label={t('tasks.dueDate')}
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  margin="normal"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label={t('tasks.estimatedHours')}
                  type="number"
                  value={newTask.estimated_hours}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: e.target.value ? Number(e.target.value) : '' }))}
                  margin="normal"
                  size="small"
                  inputProps={{ min: 0, step: 0.5 }}
                  helperText={t('tasks.estimateTime')}
                />
                <Box sx={{ mt: 1 }}>
                  <Button onClick={handleAddTask} variant="contained" size="small" sx={{ mr: 1 }}>
                    {t('common.create')}
                  </Button>
                  <Button onClick={() => setShowAddTask(false)} size="small">
                    {t('common.cancel')}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          <List dense>
            {tasks.map((task) => (
              <ListItem
                key={task.id}
                sx={{
                  border: '1px solid #eee',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: task.status_id === 3 ? '#f5f5f5' : 'white'
                }}
                secondaryAction={
                  <Box>
                    <IconButton size="small" onClick={() => setEditingTask(task)}>
                      <EditIcon />
                    </IconButton>
                    {task.status_id !== 3 && (
                      <IconButton size="small" onClick={() => handleCompleteTask(task.id)}>
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: task.status_id === 3 ? 'line-through' : 'none',
                          fontWeight: 500
                        }}
                      >
                        {task.title}
                      </Typography>
                      <Chip
                        label={statusNames[task.status_id as keyof typeof statusNames]}
                        size="small"
                        sx={{
                          backgroundColor: statusIdColors[task.status_id as keyof typeof statusIdColors] || '#grey.300',
                          color: 'black',
                          fontSize: '0.7rem'
                        }}
                      />
                      <Chip
                        label={task.priority}
                        size="small"
                        sx={{
                          backgroundColor: priorityColors[task.priority],
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {task.description && (
                        <Typography variant="caption" display="block">
                          {task.description}
                        </Typography>
                      )}
                      {task.due_date && (
                        <Typography variant="caption" color="text.secondary">
                          {t('tasks.dueDate')}: {dayjs(task.due_date).format('DD.MM.YYYY')}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>

          {tasks.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
              {t('tasks.noTasks')}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
      
      <EditTaskDialog
        open={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onTaskUpdated={() => {
          setEditingTask(null);
          loadProjectTasks();
          onProjectUpdated?.();
        }}
      />
    </>
  );
};

export default ProjectViewDialog;