import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import { taskAPI, projectAPI, authAPI } from '../../services/api';

dayjs.locale('en');

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
  tags?: string[];
  estimated_hours?: number;
  actual_hours?: number;
}

interface EditTaskDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

const EditTaskDialog = ({ open, task, onClose, onTaskUpdated }: EditTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('To Do');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [assignedUser, setAssignedUser] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [actualHours, setActualHours] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Array<{id: number, title: string}>>([]);
  const [users, setUsers] = useState<Array<{id: number, first_name: string, last_name: string}>>([]);

  useEffect(() => {
    if (open) {
      loadProjects();
      loadUsers();
    }
  }, [open]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ? dayjs(task.due_date) : null);
      setProjectId(task.project_id || null);
      setAssignedUser(task.assigned_to || null);
      setTags(task.tags || []);
      setEstimatedHours(task.estimated_hours || '');
      setActualHours(task.actual_hours || '');
    }
  }, [task]);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      const activeProjects = response.filter(p => p.status === 'Active');
      setProjects(activeProjects.map(p => ({ id: p.id!, title: p.title })));
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users for editing...');
      const response = await authAPI.getUsers();
      console.log('Users received:', response);
      if (Array.isArray(response)) {
        setUsers(response.map(user => ({ id: user.id, first_name: user.first_name, last_name: user.last_name })));
      } else {
        console.warn('Users response is not an array:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleAddTag = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleSave = async () => {
    if (!task || !title.trim()) {
      setError('Task name is required');
      return;
    }

    try {
      const statusMap = { 'To Do': 1, 'In Progress': 2, 'Done': 3 };
      
      const updateData = {
        title,
        description: description || undefined,
        status_id: statusMap[status],
        priority,
        project_id: projectId || undefined,
        assigned_to: assignedUser || undefined,
        due_date: dueDate?.format('YYYY-MM-DD HH:mm:ss'),
        estimated_hours: estimatedHours || undefined,
        actual_hours: actualHours || undefined,
      };

      console.log('Sending data:', updateData);
      await taskAPI.updateTask(task.id, updateData);
      onTaskUpdated?.();
      handleClose();
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Error updating task');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>✏️ Edit Task</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Task Name *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            error={!title.trim() && error !== ''}
          />
          
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as Task['status'])}
            >
              <MenuItem value="To Do">To Do</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Done">Done</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
            >
              <MenuItem value="Low">🟢 Low</MenuItem>
              <MenuItem value="Medium">🟡 Medium</MenuItem>
              <MenuItem value="High">🔴 High</MenuItem>
            </Select>
          </FormControl>
          
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2} mt={2}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Due Date"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  }
                }}
              />
            </LocalizationProvider>
            
            <FormControl fullWidth>
              <InputLabel shrink>Project</InputLabel>
              <Select
                value={projectId || ''}
                label="Project"
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : null)}
              >
                <MenuItem value="">Not Selected</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    📁 {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Assign To</InputLabel>
            <Select
              value={assignedUser || ''}
              label="Assign To"
              onChange={(e) => setAssignedUser(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  👤 {user.first_name} {user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box mt={2}>
            <TextField
              fullWidth
              label="Tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              helperText="Press Enter to add tags"
            />
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => handleDeleteTag(tag)}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2} mt={2}>
            <TextField
              fullWidth
              label="Estimated Hours"
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : '')}
              InputProps={{
                inputProps: { min: 0, step: 0.5 }
              }}
            />
            
            <TextField
              fullWidth
              label="Actual Hours"
              type="number"
              value={actualHours}
              onChange={(e) => setActualHours(e.target.value ? Number(e.target.value) : '')}
              InputProps={{
                inputProps: { min: 0, step: 0.5 }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EditTaskDialog;