import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/auth.service';
import { setAccessToken, registerLogoutCallback } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(credentials);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const registeredUser = await authService.register(userData);
      setUser(registeredUser);
      return registeredUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Attempt silent refresh on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user: refreshedUser } = await authService.silentRefresh();
        setUser(refreshedUser);
      } catch (err) {
        console.log('No active session (silent refresh failed/not found)');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
    registerLogoutCallback(logout);
  }, [logout]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
