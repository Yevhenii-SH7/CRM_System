import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Container,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  List as ListIcon
} from '@mui/icons-material';

import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { projectAPI, taskAPI, Project } from '../services/api';
import CreateProjectDialog from './ui/CreateProjectDialog';
import EditProjectDialog from './ui/EditProjectDialog';
import ProjectViewDialog from './ui/ProjectViewDialog';
import CreateTaskDialog from './ui/CreateTaskDialog';

interface ProjectCardProps {
  children: React.ReactNode;
}

interface ProjectsProps {
  projectIdToView?: number | null;
  onProjectViewed?: () => void;
}

function ProjectCard({ children }: ProjectCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {children}
    </Card>
  );
}

dayjs.locale('en');



function Projects({ projectIdToView, onProjectViewed }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState<Project | null>(null);
  const [isViewingProject, setIsViewingProject] = useState<Project | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [projectTaskCounts, setProjectTaskCounts] = useState<Record<number, { total: number; completed: number }>>({});
  const [isAddingTask, setIsAddingTask] = useState(false);

  const applyFilters = useCallback(() => {
    let filtered = [...projects];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [projects, statusFilter, priorityFilter, searchTerm]);

  useEffect(() => {
    loadProjects();
    loadTaskCounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    if (projectIdToView) {
      const project = projects.find(p => p.id === projectIdToView);
      if (project) {
        setIsViewingProject(project);
        onProjectViewed?.();
      }
    }
  }, [projectIdToView, projects, onProjectViewed]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            setIsAddingProject(true);
            break;
          case 'f':
            event.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.getProjects();
      setProjects(response);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskCounts = async () => {
    try {
      const tasks = await taskAPI.getTasks();
      const counts: Record<number, { total: number; completed: number }> = {};
      
      tasks.forEach(task => {
        if (task.project_id) {
          if (!counts[task.project_id]) {
            counts[task.project_id] = { total: 0, completed: 0 };
          }
          counts[task.project_id].total++;
          if (task.status_id === 3) {
            counts[task.project_id].completed++;
          }
        }
      });
      
      setProjectTaskCounts(counts);
    } catch (error) {
      console.error('Error loading task statistics:', error);
    }
  };

  const handleEditProject = (project: Project) => {
    setIsEditingProject(project);
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      await projectAPI.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      setIsDeletingProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleViewTasks = async (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setIsViewingProject(project);
    }
  };

  const handleCreateTask = (projectId: number) => {
    console.log('Creating task for project ID:', projectId);
    setIsAddingTask(true);
  };


  const renderProjectCard = (project: Project) => {
    const taskCount = projectTaskCounts[project.id || 0] || { total: 0, completed: 0 };
    
    return (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
        <ProjectCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {project.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description}
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => handleEditProject(project)}
                sx={{ color: 'primary.main' }}
              >
                <EditIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              {project.hourly_rate && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Hourly Rate: €{Number(project.hourly_rate).toFixed(2)}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Start: {project.start_date ? dayjs(project.start_date).format('MMM D, YYYY') : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                End: {project.end_date ? dayjs(project.end_date).format('MMM D, YYYY') : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Task Progress: {taskCount.completed}/{taskCount.total}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={taskCount.total > 0 ? (taskCount.completed / taskCount.total) * 100 : 0}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<ListIcon />}
                onClick={() => handleViewTasks(project.id!)}
                fullWidth
              >
                View Tasks
              </Button>
              <Button 
                variant="contained" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => handleCreateTask(project.id!)}
                fullWidth
              >
                Add Task
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Created: {project.created_at ? dayjs(project.created_at).format('MMM D, YYYY') : 'N/A'}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setIsDeletingProject(project.id || null)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </CardContent>
        </ProjectCard>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setIsAddingProject(true)}
        >
          Add Project
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          id="search-input"
          label="Search projects..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects... (Ctrl+F)"
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as string)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value as string)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {filteredProjects.map(renderProjectCard)}
      </Grid>

      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
            ? 'No projects found'
            : 'No projects'}
        </Typography>
      </Box>

      <ProjectViewDialog
        open={!!isViewingProject}
        onClose={() => setIsViewingProject(null)}
        project={isViewingProject}
        onProjectUpdated={() => {
          loadProjects();
          loadTaskCounts();
        }}
      />

      <CreateProjectDialog
        open={isAddingProject}
        onClose={() => setIsAddingProject(false)}
        onCreate={async (projectData) => {
          try {
            await projectAPI.createProject(projectData);
            loadProjects();
            loadTaskCounts();
          } catch (error) {
            console.error('Error creating project:', error);
            throw error;
          }
        }}
      />

      <CreateTaskDialog
        open={isAddingTask}
        onClose={() => setIsAddingTask(false)}
        onTaskCreated={async () => {
          console.log('Task created, refreshing data...');
          await loadTaskCounts();
          setIsAddingTask(false);
        }}
      />

      <EditProjectDialog
        open={!!isEditingProject}
        onClose={() => setIsEditingProject(null)}
        project={isEditingProject}
        onProjectUpdated={() => {
          loadProjects();
          loadTaskCounts();
        }}
      />

      <Dialog open={!!isDeletingProject} onClose={() => setIsDeletingProject(null)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete project "{projects.find(p => p.id === isDeletingProject)?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeletingProject(null)}>Cancel</Button>
          <Button onClick={() => isDeletingProject && handleDeleteProject(isDeletingProject)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Projects;