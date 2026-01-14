import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedAdmin = localStorage.getItem('admin');

    if (token && savedAdmin) {
      try {
        const parsedAdmin = JSON.parse(savedAdmin);
        setAdmin(parsedAdmin);
        setIsAuthenticated(true);
        // Verify token by fetching current admin
        authService
          .getCurrentAdmin()
          .then((response) => {
            if (response.success) {
              setAdmin(response.data);
              localStorage.setItem('admin', JSON.stringify(response.data));
            } else {
              logout();
            }
          })
          .catch(() => {
            logout();
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('admin', JSON.stringify(response.data));
        setAdmin(response.data);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the backend is running.',
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  const isSuperAdmin = () => {
    return admin?.adminType === 'SuperAdmin';
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
