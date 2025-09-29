import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  Alert,
} from '@mui/material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { taskAPI, projectAPI, authAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../contexts/LocaleContext';
import type { User } from '../../services/api';
import { 
  FormTextField,
  FormFormControl,
  FormInputLabel,
  FormSelect,
  FormMenuItem,
  TagChip,
  TagsContainer,
  FormDialogActions,
  FormDialogContent,
  FormDialogTitle
} from '../styled/FormStyled';
import { ActionButton } from '../styled/SharedStyled';
import { Box } from '@mui/material';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
  defaultProjectId?: number; // Add this prop
}

interface ProjectOption {
  id: number;
  title: string;
}

interface CreateTaskFormData {
  taskName: string;
  description: string;
  projectId: number | null;
  priority: 'Low' | 'Medium' | 'High';
  startDate: Dayjs | null;
  deadline: Dayjs | null;
  assignedUser: number | null;
  tags: string[];
  tagInput: string;
  estimatedHours: number | '';
}

function CreateTaskDialog({ open, onClose, onTaskCreated, defaultProjectId }: CreateTaskDialogProps) {
  const { user } = useAuth();
  const { t } = useLocale();
  const [formData, setFormData] = useState<CreateTaskFormData>({
    taskName: '',
    description: '',
    projectId: null,
    priority: 'Medium',
    startDate: dayjs(),
    deadline: null,
    assignedUser: null,
    tags: [],
    tagInput: '',
    estimatedHours: ''
  });
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const handleAddTag = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && formData.tagInput.trim()) {
      if (!formData.tags.includes(formData.tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, formData.tagInput.trim()],
          tagInput: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, tagInput: '' }));
      }
    }
  }, [formData.tagInput, formData.tags]);

  const handleDeleteTag = useCallback((tagToDelete: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  }, []);

  const loadProjects = useCallback(async () => {
    try {
      console.log('Loading projects...');
      const response = await projectAPI.getProjects();
      console.log('Projects received:', response);
      const activeProjects = response.filter(p => p.status === 'Active');
      console.log('Active projects:', activeProjects);
      const projectsForSelect = activeProjects.map(p => ({ id: p.id!, title: p.title }));
      console.log('Projects for select:', projectsForSelect);
      setProjects(projectsForSelect);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      console.log('Loading users...');
      const response = await authAPI.getUsers();
      console.log('Users received:', response);
      if (Array.isArray(response)) {
        setUsers(response);
      } else {
        console.warn('Users response is not an array:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadProjects();
      loadUsers();
      
      // Set default project if provided
      if (defaultProjectId) {
        console.log('Setting default project ID:', defaultProjectId);
        console.log('Default project ID type:', typeof defaultProjectId);
        setFormData(prev => ({
          ...prev,
          projectId: defaultProjectId
        }));
      }
    }
  }, [open, loadProjects, loadUsers, defaultProjectId]);

  const handleClose = useCallback(() => {
    setFormData({
      taskName: '',
      description: '',
      projectId: defaultProjectId || null, // Preserve default project ID
      priority: 'Medium',
      startDate: dayjs(),
      deadline: null,
      assignedUser: null,
      tags: [],
      tagInput: '',
      estimatedHours: ''
    });
    setError('');
    onClose();
  }, [onClose, defaultProjectId]);

  const handleSave = useCallback(async () => {
    if (!formData.taskName.trim()) {
      setError('Task name is required');
      return;
    }
    
    if (formData.deadline && formData.startDate && formData.deadline.isBefore(formData.startDate)) {
      setError('Deadline cannot be before start date');
      return;
    }

    try {
      const taskData = {
        title: formData.taskName,
        description: formData.description || undefined,
        status_id: 1, // To Do
        project_id: formData.projectId || undefined,
        assigned_to: formData.assignedUser || undefined,
        due_date: formData.deadline?.format('YYYY-MM-DD HH:mm:ss'),
        priority: formData.priority,
        created_by: user?.id || 1,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        estimated_hours: formData.estimatedHours || undefined,
      };

      console.log('=== CREATING NEW TASK ===');
      console.log('Sending data:', taskData);
      console.log('Default project ID:', defaultProjectId);
      console.log('Form project ID:', formData.projectId);
      console.log('Form project ID type:', typeof formData.projectId);
      console.log('Form data:', formData);

      // Log the token for debugging
      const token = localStorage.getItem('token');
      console.log('Token:', token);
      
      const createdTask = await taskAPI.createTask(taskData);
      console.log('Task created:', createdTask);
      
      onTaskCreated?.();
      handleClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Error creating task: ' + (error as Error).message);
    }
  }, [formData, user?.id, onTaskCreated, handleClose, defaultProjectId]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <FormDialogTitle>{t('tasks.createTask')}</FormDialogTitle>
      <FormDialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <FormTextField
          fullWidth
          label={`${t('tasks.taskName')} ${t('common.required')}`}
          value={formData.taskName}
          onChange={(e) => setFormData(prev => ({ ...prev, taskName: e.target.value }))}
          error={!formData.taskName.trim() && error !== ''}
        />
        
        <FormTextField
          fullWidth
          label={t('common.description')}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          multiline
          rows={3}
        />
        
        <FormFormControl>
          <FormInputLabel shrink>{t('tasks.project')}</FormInputLabel>
          <FormSelect
            value={formData.projectId || ''}
            label="Project"
            onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value ? Number(e.target.value) : null }))}
            disabled={!!defaultProjectId} // Disable if default project is set
          >
            <FormMenuItem value="">{t('common.notSelected')}</FormMenuItem>
            {projects.map((project) => (
              <FormMenuItem key={project.id} value={project.id}>
                📁 {project.title}
              </FormMenuItem>
            ))}
          </FormSelect>
        </FormFormControl>
        
        <FormFormControl>
          <FormInputLabel shrink>{t('common.priority')}</FormInputLabel>
          <FormSelect
            value={formData.priority}
            label="Priority"
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'Low' | 'Medium' | 'High' }))}
          >
            <FormMenuItem value="Low">🟢 {t('tasks.low')}</FormMenuItem>
            <FormMenuItem value="Medium">🟡 {t('tasks.medium')}</FormMenuItem>
            <FormMenuItem value="High">🔴 {t('tasks.high')}</FormMenuItem>
          </FormSelect>
        </FormFormControl>
        
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={t('projects.startDate')}
              value={formData.startDate}
              onChange={(newValue) => setFormData(prev => ({ ...prev, startDate: newValue }))}
              slotProps={{
                textField: {
                  fullWidth: true,
                }
              }}
            />
          </LocalizationProvider>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label={t('tasks.dueDate')}
              value={formData.deadline}
              onChange={(newValue) => setFormData(prev => ({ ...prev, deadline: newValue }))}
              slotProps={{
                textField: {
                  fullWidth: true,
                }
              }}
            />
          </LocalizationProvider>
        </Box>
        
        <FormFormControl>
          <FormInputLabel shrink>{t('tasks.assignTo')}</FormInputLabel>
          <FormSelect
            value={formData.assignedUser || ''}
            label="Assign To"
            onChange={(e) => setFormData(prev => ({ ...prev, assignedUser: e.target.value ? Number(e.target.value) : null }))}
          >
            <FormMenuItem value="">{t('common.unassigned')}</FormMenuItem>
            {users.map((user) => (
              <FormMenuItem key={user.id} value={user.id}>
                👤 {user.first_name} {user.last_name}
              </FormMenuItem>
            ))}
          </FormSelect>
        </FormFormControl>
        
        <Box>
          <FormTextField
            fullWidth
            label={t('tasks.tags')}
            value={formData.tagInput}
            onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
            onKeyDown={handleAddTag}
            helperText={t('tasks.addTags')}
          />
          <TagsContainer>
            {formData.tags.map((tag, index) => (
              <TagChip
                key={index}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
                variant="outlined"
              />
            ))}
          </TagsContainer>
        </Box>
        
        <FormTextField
          fullWidth
          label={t('tasks.estimatedHours')}
          type="number"
          value={formData.estimatedHours}
          onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value ? Number(e.target.value) : '' }))}
          InputProps={{
            inputProps: { min: 0, step: 0.5 }
          }}
        />
      </FormDialogContent>
      <FormDialogActions>
        <ActionButton onClick={handleClose} color="secondary">
          {t('common.cancel')}
        </ActionButton>
        <ActionButton onClick={handleSave} variant="contained" color="primary">
          {t('common.create')}
        </ActionButton>
      </FormDialogActions>
    </Dialog>
  );
}

export default CreateTaskDialog;