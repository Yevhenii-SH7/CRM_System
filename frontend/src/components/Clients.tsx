import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { clientAPI, projectAPI, Client, Project } from '../services/api';
import CreateClientDialog from './ui/CreateClientDialog';
import EditClientDialog from './ui/EditClientDialog';
import CreateProjectDialog from './ui/CreateProjectDialog';
import { useNavigate } from 'react-router-dom';

dayjs.locale('en');

function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<(Client & { projects?: Project[] })[]>([]);
  const [filteredClients, setFilteredClients] = useState<(Client & { projects?: Project[] })[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const [selectedClientForProject, setSelectedClientForProject] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<Client & { projects?: Project[] } | null>(null);

  const applyFilters = useCallback(() => {
    let filtered = [...clients];

    if (searchQuery.trim()) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.contact_email && client.contact_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.phone && client.phone.includes(searchQuery))
      );
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'n':
            event.preventDefault();
            setCreateDialogOpen(true);
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

  const loadClients = async () => {
    setLoading(true);
    setError('');
    try {
      // Get clients and projects separately
      const [clientsData, projectsData] = await Promise.all([
        clientAPI.getClients(),
        projectAPI.getProjects()
      ]);
      
      // Group projects by client_id
      const projectsByClient: Record<number, Project[]> = {};
      projectsData.forEach(project => {
        if (project.client_id) {
          if (!projectsByClient[project.client_id]) {
            projectsByClient[project.client_id] = [];
          }
          projectsByClient[project.client_id].push(project);
        }
      });
      
      // Add projects to each client
      const clientsWithProjects = clientsData.map(client => ({
        ...client,
        projects: projectsByClient[client.id!] || []
      }));
      
      setClients(clientsWithProjects);
    } catch (error) {
      console.error('Error loading clients:', error);
      setError('Error loading clients. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClient) return;
    
    try {
      await clientAPI.deleteClient(deleteClient.id!);
      setClients(prev => prev.filter(client => client.id !== deleteClient.id));
      setDeleteClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('Error deleting client');
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'client_name'>) => {
    try {
      await projectAPI.createProject(projectData);
      // Reload clients to update the project list
      await loadClients();
      
      // Update the selected client in the modal with the new data
      if (selectedClient) {
        const updatedClient = clients.find(c => c.id === selectedClient.id);
        if (updatedClient) {
          setSelectedClient(updatedClient);
        }
      }
      
      setCreateProjectDialogOpen(false);
      setSelectedClientForProject(null);
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Error creating project');
    }
  };

  // Function to navigate to the project page
  const handleNavigateToProject = (projectId: number) => {
    navigate('/dashboard', { state: { activePage: 'All Projects', projectId } });
  };

  interface ClientModalCardProps {
    client: Client & { projects?: Project[] };
  }

  function ClientModalCard({ client }: ClientModalCardProps) {
    return (
      <Card sx={{ maxWidth: 600, margin: 'auto' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" component="h2">
              {client.name}
            </Typography>
            <Box>
              <IconButton 
                size="small" 
                onClick={() => setEditClient(client)}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => setDeleteClient(client)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {client.contact_email && (
              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon color="action" />
                <Typography variant="body1">
                  {client.contact_email}
                </Typography>
              </Box>
            )}

            {client.phone && (
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon color="action" />
                <Typography variant="body1">
                  {client.phone}
                </Typography>
              </Box>
            )}
            
            {client.address && (
              <Box display="flex" alignItems="flex-start" gap={1}>
                <LocationIcon color="action" sx={{ mt: 0.5 }} />
                <Typography variant="body1">
                  {client.address}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon color="action" />
              <Typography variant="body1">
                Created: {client.created_at ? dayjs(client.created_at).format('MMM D, YYYY') : 'N/A'}
              </Typography>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Projects ({client.projects?.length || 0}):
                </Typography>
                {(client.projects?.length === 0 || !client.projects) && (
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedClientForProject(client);
                      setCreateProjectDialogOpen(true);
                    }}
                  >
                    Create Project
                  </Button>
                )}
              </Box>
              {client.projects && client.projects.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {client.projects.map(project => (
                    <Chip 
                      key={project.id} 
                      label={project.title} 
                      size="small" 
                      variant="outlined" 
                      onClick={() => handleNavigateToProject(project.id!)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No projects yet. Click "Create Project" to add one.
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Clients</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Client
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          id="search-input"
          label="Search clients..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or phone... (Ctrl+F)"
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredClients.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? 'No clients found' : 'No clients'}
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Projects</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{client.name}</Typography>
                    </TableCell>
                    <TableCell>
                      {client.contact_email && (
                        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{client.contact_email}</Typography>
                        </Box>
                      )}
                      {client.phone && (
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{client.phone}</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.projects && client.projects.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {client.projects.slice(0, 3).map(project => (
                            <Chip 
                              key={project.id} 
                              label={project.title} 
                              size="small" 
                              variant="outlined" 
                              onClick={() => handleNavigateToProject(project.id!)}
                              sx={{ cursor: 'pointer' }}
                            />
                          ))}
                          {client.projects.length > 3 && (
                            <Chip 
                              label={`+${client.projects.length - 3}`} 
                              size="small" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No projects</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.created_at ? dayjs(client.created_at).format('MMM D, YYYY') : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setSelectedClient(client);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => setDeleteClient(client)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <CreateClientDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onClientCreated={loadClients}
      />

      <CreateProjectDialog
        open={createProjectDialogOpen}
        onClose={() => {
          setCreateProjectDialogOpen(false);
          setSelectedClientForProject(null);
        }}
        onCreate={handleCreateProject}
        defaultClientId={selectedClientForProject?.id || undefined}
      />

      <EditClientDialog
        open={!!editClient}
        onClose={() => setEditClient(null)}
        client={editClient}
        onClientUpdated={loadClients}
      />

      <Dialog open={!!deleteClient} onClose={() => setDeleteClient(null)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete client "{deleteClient?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteClient(null)}>Cancel</Button>
          <Button onClick={handleDeleteClient} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={!!selectedClient} 
        onClose={() => setSelectedClient(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedClient && <ClientModalCard client={selectedClient} />}
      </Dialog>
    </Box>
  );
}

export default Clients;