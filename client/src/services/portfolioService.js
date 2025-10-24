import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies if needed
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  // Try multiple token storage locations
  const token = localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                sessionStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Making request to:', config.url, 'with token:', token ? 'present' : 'missing');
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Authentication failed:', error.response.data);
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Get authenticated user's portfolio
 */
export const getMyPortfolio = async () => {
  try {
    const response = await apiClient.get('/portfolio');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch portfolio';
    console.error('Portfolio fetch error:', error.response?.data || error.message);
    throw new Error(message);
  }
};

/**
 * Get public portfolio by username
 */
export const getPortfolioByUsername = async (username) => {
  try {
    const response = await apiClient.get(`/portfolio/${username}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch portfolio';
    throw new Error(message);
  }
};

/**
 * Sync platform data
 */
export const syncPlatformData = async (platform, handle) => {
  try {
    const response = await apiClient.post('/platform/sync', {
      platform,
      handle,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to sync platform data';
    throw new Error(message);
  }
};

/**
 * Get platform-specific data
 */
export const getPlatformData = async (platform) => {
  try {
    const response = await apiClient.get(`/platform/${platform}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch platform data';
    throw new Error(message);
  }
};

export default {
  getMyPortfolio,
  getPortfolioByUsername,
  syncPlatformData,
  getPlatformData,
};
