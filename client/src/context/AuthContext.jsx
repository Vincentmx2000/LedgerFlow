import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => api.getToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = api.getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // Token expired or invalid
          api.setToken(null);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        api.setToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login({ email, password });
      if (data.token) {
        api.setToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const data = await api.register(userData);
      if (data.token) {
        api.setToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
