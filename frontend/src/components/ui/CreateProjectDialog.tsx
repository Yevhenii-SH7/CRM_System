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
import type { Dayjs } from 'dayjs';
import { useLocale } from '../../contexts/LocaleContext';
import { Project, clientAPI, Client } from '../../services/api';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client_name'>) => Promise<void>;
  defaultClientId?: number;
}

function CreateProjectDialog({ open, onClose, onCreate, defaultClientId }: CreateProjectDialogProps) {
  const { t } = useLocale();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('Active');
  const [priority, setPriority] = useState<Project['priority']>('Medium');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [clientId, setClientId] = useState<number | null>(defaultClientId || null);
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadClients();
      // Set the default client ID when dialog opens
      if (defaultClientId) {
        setClientId(defaultClientId);
      }
    }
  }, [open, defaultClientId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }

    try {
      const projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client_name'> = {
        title: title.trim(),
        description: description.trim(),
        status: status as 'Active' | 'Completed' | 'Archived',
        priority: priority as 'Low' | 'Medium' | 'High',
        start_date: startDate?.format('YYYY-MM-DD') || undefined,
        end_date: endDate?.format('YYYY-MM-DD') || undefined,
        client_id: clientId || undefined,
        hourly_rate: hourlyRate || undefined,
      };

      await onCreate(projectData);
      handleClose();
    } catch (error) {
      setError('Failed to create project');
      console.error('Error creating project:', error);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('Active');
    setPriority('Medium');
    setStartDate(null);
    setEndDate(null);
    setClientId(null);
    setHourlyRate('');
    setError('');
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('projects.createProject')}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            fullWidth
            label={`${t('projects.projectTitle')} ${t('common.required')}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            error={!title.trim() && error !== ''}
          />
          
          <TextField
            fullWidth
            label={t('projects.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          
          <TextField
            fullWidth
            label={t('projects.hourlyRate')}
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))}
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            }}
            inputProps={{
              min: 0,
              step: 0.01,
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
                label={t('projects.client')}
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingClients ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>{t('common.status')}</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as Project['status'])}
            >
              <MenuItem value="Active">{t('projects.active')}</MenuItem>
              <MenuItem value="Completed">{t('projects.completed')}</MenuItem>
              <MenuItem value="Archived">{t('projects.onHold')}</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel shrink>{t('common.priority')}</InputLabel>
            <Select
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value as Project['priority'])}
            >
              <MenuItem value="Low">{t('tasks.low')}</MenuItem>
              <MenuItem value="Medium">{t('tasks.medium')}</MenuItem>
              <MenuItem value="High">{t('tasks.high')}</MenuItem>
            </Select>
          </FormControl>

          <DatePicker
            label={t('projects.startDate')}
            value={startDate}
            onChange={setStartDate}
            sx={{ width: '100%', mt: 2 }}
          />
          
          <DatePicker
            label={t('projects.endDate')}
            value={endDate}
            onChange={setEndDate}
            sx={{ width: '100%', mt: 2 }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateProjectDialog;