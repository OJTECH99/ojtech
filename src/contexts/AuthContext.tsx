import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, studentAPI } from '@/lib/api';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isNewStudent?: boolean;
  sectionId?: string;
  progress?: {
    completedLessons: number;
    totalScore: number;
    currentLevel: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerStudent: (registrationCode: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      const mappedUser: User = {
        id: response.user.id,
        name: response.user.fullName,
        email: response.user.email,
        role: response.user.role.toLowerCase() as UserRole,
        isNewStudent: response.user.role === 'STUDENT' && !response.user.sectionId,
        sectionId: response.user.sectionId || undefined,
        progress: {
          completedLessons: 0,
          totalScore: 0,
          currentLevel: 'Getting Started',
        },
      };
      
      localStorage.setItem('user', JSON.stringify(mappedUser));
      setUser(mappedUser);
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const registerStudent = async (registrationCode: string) => {
    setIsLoading(true);
    try {
      await studentAPI.registerToSection({ registrationCode });
      
      if (user) {
        const updatedUser = {
          ...user,
          isNewStudent: false,
          sectionId: registrationCode,
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Invalid registration code';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    registerStudent,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};