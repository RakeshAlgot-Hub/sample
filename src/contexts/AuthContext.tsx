import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../services/api';
import { User } from '../types/auth';
import { LoginRequest, RegisterRequest } from '../types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (data: RegisterRequest) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (data: LoginRequest) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (data: RegisterRequest) => {
    try {
      const registeredUser = await authApi.register(data);
      return { user: registeredUser, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  };

  const signIn = async (data: LoginRequest) => {
    try {
      const loggedInUser = await authApi.login(data);
      setUser(loggedInUser);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

