/**
 * Base Platform Service - Abstract class defining the interface for all platform services
 * All platform-specific services must extend this class and implement these methods
 */
class BasePlatformService {
  constructor(platformName) {
    this.platformName = platformName;
    if (this.constructor === BasePlatformService) {
      throw new Error('BasePlatformService is an abstract class and cannot be instantiated directly');
    }
  }

  /**
   * Get user information from the platform
   * @param {string} handle - User's handle on the platform
   * @returns {Promise<Object>} User info object with rating, rank, etc.
   */
  async getUserInfo(handle) {
    throw new Error('getUserInfo method must be implemented by platform service');
  }

  /**
   * Get all submissions for a user from the platform
   * @param {string} handle - User's handle on the platform
   * @param {Object} options - Additional options like pagination, filters
   * @returns {Promise<Array>} Array of submission objects
   */
  async getAllSubmissions(handle, options = {}) {
    throw new Error('getAllSubmissions method must be implemented by platform service');
  }

  /**
   * Get rating history for a user from the platform
   * @param {string} handle - User's handle on the platform
   * @returns {Promise<Array>} Array of rating history objects
   */
  async getRatingHistory(handle) {
    throw new Error('getRatingHistory method must be implemented by platform service');
  }

  /**
   * Get problem information from the platform
   * @param {string} problemId - Problem ID on the platform
   * @returns {Promise<Object>} Problem object
   */
  async getProblemInfo(problemId) {
    throw new Error('getProblemInfo method must be implemented by platform service');
  }

  /**
   * Validate if a handle exists on the platform
   * @param {string} handle - User's handle on the platform
   * @returns {Promise<boolean>} True if handle exists
   */
  async validateHandle(handle) {
    throw new Error('validateHandle method must be implemented by platform service');
  }

  /**
   * Get platform-specific rate limits
   * @returns {Object} Rate limit configuration
   */
  getRateLimit() {
    return {
      requestsPerSecond: 1,
      burstLimit: 5
    };
  }

  /**
   * Handle API errors consistently across platforms
   * @param {Error} error - The error object
   * @param {string} operation - The operation that failed
   */
  handleError(error, operation) {
    console.error(`${this.platformName} API error during ${operation}:`, error.message);
    throw new Error(`Failed to ${operation} from ${this.platformName}: ${error.message}`);
  }
}

export default BasePlatformService;
