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
 * Battle Service
 * Handles all API calls related to battle functionality
 */

/**
 * Get all battles for the current user
 * @returns {Promise<Object>} User's battles
 */
export const getUserBattles = async () => {
  const response = await apiClient.get('/battles');
  return response.data;
};

/**
 * Get a specific battle by ID
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Battle data
 */
export const getBattle = async (battleId) => {
  const response = await apiClient.get(`/battles/${battleId}`);
  return response.data;
};

/**
 * Create a new battle
 * @param {Object} battleDetails - Battle creation details
 * @returns {Promise<Object>} Created battle data
 */
export const createBattle = async (battleDetails) => {
  const response = await apiClient.post('/battles', battleDetails);
  return response.data;
};

/**
 * Join a battle using join token
 * @param {string} joinToken - Battle join token
 * @returns {Promise<Object>} Join result
 */
export const joinBattle = async (joinToken) => {
  const response = await apiClient.post(`/battles/join/${joinToken}`);
  return response.data;
};

/**
 * Get battle participants
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Participants data
 */
export const getBattleParticipants = async (battleId) => {
  const response = await apiClient.get(`/battles/${battleId}/participants`);
  return response.data;
};

/**
 * Get battle problems (only available after battle starts)
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Problems data
 */
export const getBattleProblems = async (battleId) => {
  const response = await apiClient.get(`/battles/${battleId}/problems`);
  return response.data;
};

/**
 * Get battle standings
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Standings data
 */
export const getBattleStandings = async (battleId) => {
  const response = await apiClient.get(`/battles/${battleId}/standings`);
  return response.data;
};

/**
 * Get battle submissions
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Submissions data
 */
export const getBattleSubmissions = async (battleId) => {
  const response = await apiClient.get(`/battles/${battleId}/submissions`);
  return response.data;
};

/**
 * Refresh submissions for a battle (poll Codeforces)
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Refresh result
 */
export const refreshSubmissions = async (battleId) => {
  const response = await apiClient.post(`/battles/${battleId}/refresh`);
  return response.data;
};

/**
 * Start a battle (creator only)
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Start result
 */
export const startBattle = async (battleId) => {
  const response = await apiClient.post(`/battles/${battleId}/start`);
  return response.data;
};

/**
 * End a battle (creator only)
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} End result
 */
export const endBattle = async (battleId) => {
  const response = await apiClient.post(`/battles/${battleId}/end`);
  return response.data;
};

/**
 * Cancel a battle (creator only)
 * @param {string} battleId - Battle ID
 * @returns {Promise<Object>} Cancel result
 */
export const cancelBattle = async (battleId) => {
  const response = await apiClient.delete(`/battles/${battleId}`);
  return response.data;
};

/**
 * Get server time for synchronization
 * @returns {Promise<Object>} Server time
 */
export const getServerTime = async () => {
  const response = await apiClient.get('/battles/time');
  return response.data;
};

/**
 * Get battle info by join token (to check platform requirements before joining)
 * @param {string} joinToken - Battle join token
 * @returns {Promise<Object>} Battle info
 */
export const getBattleByJoinToken = async (joinToken) => {
  const response = await apiClient.get(`/battles/info/${joinToken}`);
  return response.data;
};

/**
 * Check if user has synced LeetCode submissions via CP Extension
 * @returns {Promise<Object>} Sync status
 */
export const checkLeetCodeSyncStatus = async () => {
  const response = await apiClient.get('/battles/check-leetcode-sync');
  return response.data;
};

export default {
  getUserBattles,
  getBattle,
  createBattle,
  joinBattle,
  getBattleParticipants,
  getBattleProblems,
  getBattleStandings,
  getBattleSubmissions,
  refreshSubmissions,
  startBattle,
  endBattle,
  cancelBattle,
  getServerTime,
  getBattleByJoinToken,
  checkLeetCodeSyncStatus,
};
