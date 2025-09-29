import { createContext } from 'react';
import { User } from '../services/api';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);