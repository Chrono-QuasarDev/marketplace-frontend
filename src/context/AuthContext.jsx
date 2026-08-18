/* eslint-disable react/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi, getStoredToken, setStoredToken, getStoredApiUrl, setStoredApiUrl } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getStoredToken());
  const [apiUrl, setApiUrlState] = useState(getStoredApiUrl());
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(null);

  const changeApiUrl = (newUrl) => {
    setStoredApiUrl(newUrl);
    setApiUrlState(getStoredApiUrl());
  };

  const refreshProfile = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      const profile = await usersApi.getProfile();
      setUser(profile);
      setIsBackendConnected(true);
      return profile;
    } catch (err) {
      console.warn('Failed to load user profile with current token:', err.message);
      if (err.status === 401) {
        setStoredToken(null);
        setTokenState('');
        setUser(null);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pingBackend = useCallback(async () => {
    try {
      const baseUrl = getStoredApiUrl();
      const res = await fetch(`${baseUrl}/products?size=1`, {
        headers: getStoredToken() ? { Authorization: `Bearer ${getStoredToken()}` } : {},
      });
      setIsBackendConnected(res.status < 600);
      return true;
    } catch (error) {
      console.warn('Backend connectivity check failed:', error);
      setIsBackendConnected(false);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshProfile();
    pingBackend();
  }, [refreshProfile, pingBackend, apiUrl]);

  const login = async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    if (res && res.token) {
      setTokenState(res.token);
      setUser(res.user);
      setIsBackendConnected(true);
    }
    return res;
  };

  const signup = async ({ username, email, password }) => {
    const res = await authApi.signup({ username, email, password });
    return res;
  };

  const logout = () => {
    authApi.logout();
    setTokenState('');
    setUser(null);
  };

  const updateUsername = async (newUsername) => {
    const res = await usersApi.updateProfile({ username: newUsername });
    if (res && res.user) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        apiUrl,
        setApiUrl: changeApiUrl,
        isBackendConnected,
        pingBackend,
        login,
        signup,
        logout,
        refreshProfile,
        updateUsername,
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
