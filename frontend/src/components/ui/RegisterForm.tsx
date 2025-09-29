import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { 
  Typography, 
  TextField, 
  Button, 
  Box, 
  MenuItem, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton 
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import styles from './RegisterForm.module.css';
import { authAPI, RegisterData } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const RegisterSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "user"]).nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.role !== null, {
  message: "Please select a role",
  path: ["role"],
});

type RegisterFormData = z.infer<typeof RegisterSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFormSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!data.role) {
        throw new Error("Please select a role");
      }
      
      const registerData: RegisterData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      
      await authAPI.register(registerData);
      
      const loginResponse = await authAPI.login({
        email: registerData.email,
        password: registerData.password
      });
      
      login(loginResponse.user);
      setSuccess("Registration successful! Redirecting to dashboard...");
      
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h3" className={styles.title}>
        Register
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box component="form" className={styles.form} onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <TextField
          label="First name"
          type="text"
          variant="outlined"
          fullWidth
          {...register("first_name")}
          error={!!errors.first_name}
          helperText={errors.first_name?.message}
        />
        
        <TextField
          label="Last name"
          type="text"
          variant="outlined"
          fullWidth
          {...register("last_name")}
          error={!!errors.last_name}
          helperText={errors.last_name?.message}
        />
        
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  size="small"
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          label="Role"
          variant="outlined"
          fullWidth
          {...register("role")}
          error={!!errors.role}
          helperText={errors.role?.message}
          defaultValue=""
        >
          <MenuItem value="admin">Admin</MenuItem>
          <MenuItem value="user">User</MenuItem>
        </TextField>
        
        <Button
          type="submit"
          variant="contained"
          className={styles.submitButton}
          fullWidth
          disabled={isLoading}

        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Registering...
            </>
          ) : (
            'Register'
          )}
        </Button>
            </Box>
        </Box>
    )
}

export default RegisterForm