import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Leaderboard Service
 * Handles all API calls related to leaderboard functionality
 */

/**
 * Get global leaderboard with filters and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Leaderboard data
 */
export const getLeaderboard = async (options = {}) => {
  const { page = 1, limit = 50, tier = null, college = null, country = null, graduationYear = null } = options;
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (tier && tier !== 'All Tiers') params.append('tier', tier);
  if (college) params.append('college', college);
  if (country) params.append('country', country);
  if (graduationYear) params.append('graduationYear', graduationYear.toString());
  
  const response = await apiClient.get(`/leaderboard?${params.toString()}`);
  return response.data;
};

/**
 * Get top N users from leaderboard
 * @param {number} count - Number of top users to fetch
 * @param {Object} filters - Optional filters (tier, college, country, graduationYear)
 * @returns {Promise<Object>} Top users data
 */
export const getTopUsers = async (count = 10, filters = {}) => {
  const { tier = null, college = null, country = null, graduationYear = null } = filters;
  
  const params = new URLSearchParams();
  if (tier && tier !== 'All Tiers') params.append('tier', tier);
  if (college) params.append('college', college);
  if (country) params.append('country', country);
  if (graduationYear) params.append('graduationYear', graduationYear.toString());
  
  const queryString = params.toString();
  const url = `/leaderboard/top/${count}${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Get leaderboard statistics
 * @returns {Promise<Object>} Leaderboard stats
 */
export const getLeaderboardStats = async () => {
  const response = await apiClient.get('/leaderboard/stats');
  return response.data;
};

/**
 * Get leaderboard filtered by tier
 * @param {string} tier - Tier name
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Filtered leaderboard data
 */
export const getLeaderboardByTier = async (tier, options = {}) => {
  const { page = 1, limit = 50 } = options;
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  const response = await apiClient.get(`/leaderboard/tier/${tier}?${params.toString()}`);
  return response.data;
};

/**
 * Get user's leaderboard entry by username
 * @param {string} username - Username to lookup
 * @returns {Promise<Object>} User's leaderboard entry
 */
export const getUserLeaderboardEntry = async (username) => {
  const response = await apiClient.get(`/leaderboard/user/${username}`);
  return response.data;
};

/**
 * Get authenticated user's leaderboard entry
 * @returns {Promise<Object>} User's leaderboard entry
 */
export const getMyLeaderboardEntry = async () => {
  const response = await apiClient.get('/leaderboard/me');
  return response.data;
};

/**
 * Get users around a specific rank
 * @param {number} rank - Rank to get context for
 * @param {number} range - Range around the rank
 * @returns {Promise<Object>} Users around the rank
 */
export const getLeaderboardContext = async (rank, range = 5) => {
  const response = await apiClient.get(`/leaderboard/context/${rank}?range=${range}`);
  return response.data;
};

/**
 * Search users in leaderboard
 * @param {string} query - Search query
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Search results
 */
export const searchLeaderboard = async (query, options = {}) => {
  const { page = 1, limit = 20 } = options;
  
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString(),
  });
  
  const response = await apiClient.get(`/leaderboard/search?${params.toString()}`);
  return response.data;
};

/**
 * Get platform-specific leaderboard
 * @param {string} platform - Platform name ('codeforces' or 'leetcode')
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Platform leaderboard data
 */
export const getPlatformLeaderboard = async (platform, options = {}) => {
  const { page = 1, limit = 50, tier = null, college = null, country = null, graduationYear = null } = options;
  
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (tier && tier !== 'All Tiers') params.append('tier', tier);
  if (college) params.append('college', college);
  if (country && country !== 'All Countries') params.append('country', country);
  if (graduationYear && graduationYear !== 'All Years') params.append('graduationYear', graduationYear.toString());
  
  const response = await apiClient.get(`/leaderboard/platform/${platform}?${params.toString()}`);
  return response.data;
};

/**
 * Get top N users for a specific platform
 * @param {string} platform - Platform name ('codeforces' or 'leetcode')
 * @param {number} count - Number of top users to fetch
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} Top users for platform
 */
export const getTopUsersByPlatform = async (platform, count = 10, filters = {}) => {
  const { tier = null, college = null, country = null, graduationYear = null } = filters;
  
  const params = new URLSearchParams();
  if (tier && tier !== 'All Tiers') params.append('tier', tier);
  if (college) params.append('college', college);
  if (country && country !== 'All Countries') params.append('country', country);
  if (graduationYear && graduationYear !== 'All Years') params.append('graduationYear', graduationYear.toString());
  
  const queryString = params.toString();
  const url = `/leaderboard/platform/${platform}/top/${count}${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

/**
 * Recalculate authenticated user's rating
 * @returns {Promise<Object>} Updated rating data
 */
export const recalculateMyRating = async () => {
  const response = await apiClient.post('/leaderboard/recalculate');
  return response.data;
};
