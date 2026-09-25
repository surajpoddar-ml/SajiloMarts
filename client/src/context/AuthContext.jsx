import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service.js';
import { APP_CONSTANTS } from '../constants/appConstants.js';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  role: null,
  isAdmin: false,
  isCustomer: false,
  isEmailVerified: false,
  hasRole: () => false,
  isLoading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER) : null;
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshUser = useCallback(async () => {
    const hasToken = typeof localStorage !== 'undefined' && localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    if (!hasToken) {
      setUser(null);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res && (res.data || res.user)) {
        const userData = res.data?.user || res.data;
        setUser(userData);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(userData));
        }
      } else {
        setUser(null);
      }
    } catch {
      // If unauthorized or network error, reset user state
      setUser(null);
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
      }
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleSessionExpired = (event) => {
      setUser(null);
      setError(event.detail?.message || 'Session expired. Please log in again.');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('sajilomarts:session-expired', handleSessionExpired);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sajilomarts:session-expired', handleSessionExpired);
      }
    };
  }, [refreshUser]);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      const userData = res.data?.user || res.data;
      const token = res.data?.token || res.token;
      if (token && typeof localStorage !== 'undefined') {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
      }
      if (userData && typeof localStorage !== 'undefined') {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(userData));
      }
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
      const token = res.data?.token || res.token;
      if (token && typeof localStorage !== 'undefined') {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
      }
      if (userData && typeof localStorage !== 'undefined') {
        localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(userData));
      }
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
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
      }
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
