import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import styles from "./LoginForm.module.css";
import { authAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void;
  onSuccess?: () => void;
  onForgotPassword?: () => void;
}

function LoginForm({ onSubmit, onSuccess, onForgotPassword }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(data);
      console.log('Login response:', response);
      
      if (response && response.user && response.user.id) {
        login(response.user);
        onSubmit?.(data);
        onSuccess?.();
      } else {
        console.error('Invalid login response:', response);
        setError('Invalid response from server. Please try again.');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={styles.container}>
      <Typography variant="h3" className={styles.title}>
        Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" className={styles.form} onSubmit={handleSubmit(handleFormSubmit)} noValidate>

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
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowPassword}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Link 
            href="#" 
            variant="body2" 
            color="primary"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword?.();
            }}
          >
            Forgot password?
          </Link>
        </Box>

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
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm;