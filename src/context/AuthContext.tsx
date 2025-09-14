import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  _id: string;
  email: string;
  role: string;
  fullName: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedUser = localStorage.getItem('adminUser');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data?.data?.token) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.user));
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    loading,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};