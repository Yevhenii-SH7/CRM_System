import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Box } from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  type: 'login' | 'register' | 'forgot-password';
}

function AuthModal({ open, onClose, type }: AuthModalProps) {
  const [modalType, setModalType] = useState<AuthModalProps['type']>(type);

  useEffect(() => {
    setModalType(type);
  }, [type]);

  const handleBackToLogin = useCallback(() => {
    setModalType('login');
  }, []);

  const handleForgotPassword = useCallback(() => {
    setModalType('forgot-password');
  }, []);

  return (
    <Modal open={open} onClose={onClose}>
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450,
          minHeight: 350,
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          outline: 'none',
          '@media (max-width: 600px)': {
            width: 320,
          },
        }}
        data-testid="auth-box-content"
      >
        {modalType === 'login' ? (
          <LoginForm 
            onSuccess={onClose} 
            onForgotPassword={handleForgotPassword}
          />
        ) : modalType === 'register' ? (
          <RegisterForm onSuccess={onClose} />
        ) : (
          <ForgotPasswordForm 
            onSubmit={onClose} 
            onBackToLogin={handleBackToLogin}
          />
        )}
      </Box>
    </Modal>
  );
}

export default AuthModal;