import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service.js';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  role: null,
  isAdmin: false,
  isCustomer: false,
  isEmailVerified: false,
  hasRole: () => false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await authService.getMe();
      if (res && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      const userData = res.data?.user || res.data;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (customerData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register(customerData);
      const userData = res.data?.user || res.data;
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const role = user?.role || null;
  const isAdmin = role === 'admin';
  const isCustomer = role === 'customer';
  const isEmailVerified = Boolean(user?.isEmailVerified);
  const hasRole = (targetRole) => Boolean(role && role.toLowerCase() === String(targetRole).toLowerCase());

  const value = {
    user,
    isAuthenticated: Boolean(user),
    role,
    isAdmin,
    isCustomer,
    isEmailVerified,
    hasRole,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
