import React, { useState } from 'react';
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

interface CreateClientDialogProps {
  open: boolean;
  onClose: () => void;
  onClientCreated?: () => void;
}

function CreateClientDialog({ open, onClose, onClientCreated }: CreateClientDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Client name is required');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    try {
      const clientData: Omit<Client, 'id' | 'created_at'> = {
        name: name.trim(),
        contact_email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        created_by: 1,
      };

      await clientAPI.createClient(clientData);
      onClientCreated?.();
      handleClose();
    } catch (error) {
      console.error('Error creating client:', error);
      setError('Error creating client');
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Client</DialogTitle>
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
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateClientDialog;