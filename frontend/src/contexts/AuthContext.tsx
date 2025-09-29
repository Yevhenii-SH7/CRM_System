import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext, AuthContextType } from './authContextDef';
import { User } from '../services/api';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        console.log('Retrieved user from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    console.log('Saving user to context and localStorage:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}