const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.message || 'Request failed', response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0, null);
  }
};

export const api = {
  auth: {
    signup: (userData) => apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    signin: (credentials) => apiRequest('/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    logout: () => apiRequest('/logout', {
      method: 'POST',
    }),
    getProfile: () => apiRequest('/profile'),
    refreshToken: () => apiRequest('/refresh', { method: 'POST' }),
  },
  onboarding: {
    getStatus: () => apiRequest('/onboarding/status'),
    complete: (onboardingData) => apiRequest('/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    }),
    checkUsername: (username) => apiRequest(`/onboarding/check-username?username=${encodeURIComponent(username)}`),
  },
};

export default { ApiError };
