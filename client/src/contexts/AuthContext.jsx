import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api, setAuthToken, removeAuthToken } from '../utils/api.jsx';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    }
  }, []);

  // Check for OAuth callback tokens in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (token && success === 'oauth_success') {
      setAuthToken(token);
      checkAuth();
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Authentication failed. Please try again.' });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.auth.getProfile();
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error) {
      removeAuthToken();
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.auth.signup(userData);
      setAuthToken(response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const signin = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.auth.signin(credentials);
      setAuthToken(response.token);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const signInWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    removeAuthToken();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signup,
        signin,
        signInWithGoogle,
        logout,
        clearError,
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
