import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../utils/api.jsx';

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
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
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
    // Check if user is authenticated on app load
    checkAuth();
  }, []);

  // Check for OAuth callback success in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    // console.log('Current URL:', window.location.href);
    // console.log('Current path:', window.location.pathname); 
    // console.log('OAuth success:', success); 

    if (success === 'oauth_success') {
      // OAuth was successful, check auth to get user data
      checkAuth();
      
      // Clean up URL parameters without changing the path
      const currentPath = window.location.pathname;
      // console.log('Cleaning URL, staying on path:', currentPath); 
      window.history.replaceState({}, document.title, currentPath);
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
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.auth.signup(userData);
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
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const signInWithGoogle = (stayOnCurrentPage = false) => {
    // Get current path if we want to stay on the current page
    const currentPath = stayOnCurrentPage && window.location.pathname !== '/' 
      ? window.location.pathname 
      : '/';
    
    console.log('Starting Google OAuth from path:', currentPath); // Debug log
    
    // Pass redirect path as query parameter to the OAuth URL
    const redirectParam = currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
    const oauthUrl = `${API_URL}/auth/google${redirectParam}`;
    
    console.log('OAuth URL:', oauthUrl); // Debug log
    
    window.location.href = oauthUrl;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout request fails, clear the local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
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
        updateUser,
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

