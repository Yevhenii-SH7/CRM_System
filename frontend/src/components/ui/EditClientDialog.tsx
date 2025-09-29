import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import { clientAPI, Client } from '../../services/api';

interface EditClientDialogProps {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated?: () => void;
}

function EditClientDialog({ open, onClose, client, onClientUpdated }: EditClientDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (client && open) {
      setName(client.name || '');
      setEmail(client.contact_email || '');
      setPhone(client.phone || '');
      setAddress(client.address || '');
      setError('');
    }
  }, [client, open]);

  const handleSave = async () => {
    if (!client) return;
    
    if (!name.trim()) {
      setError('Client name is required');
      return;
    }

    // Email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      const clientData: Partial<Client> = {
        name: name.trim(),
        contact_email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      };

      await clientAPI.updateClient(client.id!, clientData);
      onClientUpdated?.();
      handleClose();
    } catch (error) {
      console.error('Error updating client:', error);
      setError('Error updating client');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Client</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <TextField
          fullWidth
          label="Client Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          error={!name.trim() && error !== ''}
        />
        
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
        />
        
        <TextField
          fullWidth
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          margin="normal"
        />
        
        <TextField
          fullWidth
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditClientDialog;