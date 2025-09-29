import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { authAPI } from "../../services/api";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSubmit?: (data: ForgotPasswordFormData) => void;
  onBackToLogin?: () => void;
}

const ForgotPasswordForm = ({ onSubmit, onBackToLogin }: ForgotPasswordFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await authAPI.requestPasswordReset(data.email);
      
      setSuccess("If an account exists with this email, you will receive password reset instructions.");
      
      onSubmit?.(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset instructions';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Forgot Password
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <TextField
          label="Email Address"
          type="email"
          variant="outlined"
          fullWidth
          margin="normal"
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
          disabled={isLoading}
        />

        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          disabled={isLoading}
          sx={{ mt: 2, mb: 2 }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Sending...
            </>
          ) : (
            'Send Reset Instructions'
          )}
        </Button>
      </Box>
      
      <Box sx={{ textAlign: 'center' }}>
        <Link 
          href="#" 
          variant="body2" 
          onClick={(e) => {
            e.preventDefault();
            onBackToLogin?.();
          }}
        >
          Back to Login
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;