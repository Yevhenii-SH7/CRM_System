import React, { useState, useEffect } from 'react';
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
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { projectAPI, Project, clientAPI, Client } from '../../services/api';

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  onProjectUpdated?: () => void;
}

function EditProjectDialog({ open, onClose, project, onProjectUpdated }: EditProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Active');
  const [priority, setPriority] = useState<Project['priority']>('Medium');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');

  const [clientId, setClientId] = useState<number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project && open) {
      setTitle(project.title);
      setDescription(project.description || '');
      setStatus(project.status);
      setPriority(project.priority);
      setStartDate(project.start_date ? dayjs(project.start_date) : null);
      setEndDate(project.end_date ? dayjs(project.end_date) : null);
      setHourlyRate(project.hourly_rate || '');

      setClientId(project.client_id || null);
      setError('');
    }
  }, [project, open]);

  useEffect(() => {
    if (open) {
      loadClients();
    }
  }, [open]);

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const clientsData = await clientAPI.getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;
    
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }
    
    if (endDate && startDate && endDate.isBefore(startDate)) {
      setError('End date cannot be before start date');
      return;
    }

    try {
      const projectData = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        start_date: startDate?.format('YYYY-MM-DD'),
        end_date: endDate?.format('YYYY-MM-DD'),
        client_id: clientId,
        hourly_rate: hourlyRate || undefined,
      };

      await projectAPI.updateProject(project.id!, projectData);
      onProjectUpdated?.();
      handleClose();
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Error updating project');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label="Project Title *"
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
          
          <TextField
            fullWidth
            label="Hourly Rate (€)"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
            margin="normal"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
              },
              htmlInput: {
                min: 0,
                step: 0.01,
              }
            }}
          />
          
          <Autocomplete
            options={clients}
            getOptionLabel={(option) => option.name}
            value={clients.find(client => client.id === clientId) || null}
            onChange={(event, newValue) => {
              setClientId(newValue?.id || null);
            }}
            loading={loadingClients}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Client"
                margin="normal"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }
                }}
              />
            )}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as Project['status'])}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Priority</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value as Project['priority'])}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </Select>
          </FormControl>

          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            sx={{ width: '100%', mt: 2 }}
          />
          
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            sx={{ width: '100%', mt: 2 }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EditProjectDialog;