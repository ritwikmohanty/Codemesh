import axios from 'axios';
import mongoose from 'mongoose';

/**
 * LeetCode Battle Service
 * Handles LeetCode-specific operations for battles
 */
class LeetCodeBattleService {
  constructor() {
    this.graphqlURL = 'https://leetcode.com/graphql';
    this.problemCache = null;
    this.problemCacheTime = null;
    this.PROBLEM_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    
    // Rate limiting
    this.rateLimit = {
      requestsPerSecond: 0.5, // Conservative for LeetCode
      lastRequestTime: 0
    };
    
    // Connect to CP Extension MongoDB for synced submissions check
    this.cpExtensionDb = null;
    this.cpExtensionSubmissionModel = null;
  }

  /**
   * Initialize connection to CP Extension database
   */
  async initCPExtensionDb() {
    if (this.cpExtensionDb && this.cpExtensionDb.readyState === 1) {
      return;
    }

    try {
      const cpExtensionUri = process.env.CP_EXTENSION_MONGODB_URI || 'mongodb://localhost:27017/cp-focus-hints';
      this.cpExtensionDb = await mongoose.createConnection(cpExtensionUri);
      
      // Define the submission schema matching CP Extension
      const submissionSchema = new mongoose.Schema({
        username: { type: String, required: true },
        titleSlug: { type: String, required: true },
        frontendId: String,
        title: String,
        difficulty: String,
        lastSubmittedAt: Date,
        numSubmitted: Number,
        questionStatus: String,
        lastResult: String,
        topicTags: [{
          name: String,
          nameTranslated: String,
          slug: String
        }],
        fetchedAt: { type: Date, default: Date.now }
      });
      
      this.cpExtensionSubmissionModel = this.cpExtensionDb.model('Submission', submissionSchema);
      console.log('Connected to CP Extension database for LeetCode sync check');
    } catch (error) {
      console.error('Failed to connect to CP Extension database:', error.message);
      // Continue without CP Extension DB - will skip sync check
    }
  }

  /**
   * Rate limiting helper
   */
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.rateLimit.lastRequestTime;
    const minInterval = 1000 / this.rateLimit.requestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
    }
    this.rateLimit.lastRequestTime = Date.now();
  }

  /**
   * Make GraphQL request to LeetCode
   */
  async makeRequest(query, variables = {}) {
    await this.waitForRateLimit();
    
    try {
      const response = await axios.post(this.graphqlURL, {
        query,
        variables
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        },
        timeout: 15000
      });

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message || 'GraphQL query failed');
      }

      return response.data.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error('Invalid username or request parameters');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded - please try again later');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - LeetCode API might be slow');
      }
      throw error;
    }
  }

  /**
   * Check if user has synced LeetCode submissions (via CP Extension)
   * @param {string} leetcodeHandle - The user's LeetCode handle
   * @returns {Promise<boolean>} True if user has synced submissions
   */
  async hasUserSyncedSubmissions(leetcodeHandle) {
    try {
      await this.initCPExtensionDb();
      
      if (!this.cpExtensionSubmissionModel) {
        console.warn('CP Extension DB not available, skipping sync check');
        return true; // Skip check if DB not available
      }

      const count = await this.cpExtensionSubmissionModel.countDocuments({
        username: leetcodeHandle
      });

      return count > 0;
    } catch (error) {
      console.error('Error checking LeetCode sync status:', error.message);
      return true; // Skip check on error
    }
  }

  /**
   * Get all solved problems for a user from CP Extension database
   * @param {string} leetcodeHandle - The user's LeetCode handle
   * @returns {Promise<Set<string>>} Set of solved problem slugs
   */
  async getUserSolvedProblems(leetcodeHandle) {
    try {
      await this.initCPExtensionDb();
      
      if (!this.cpExtensionSubmissionModel) {
        return new Set();
      }

      const solvedProblems = await this.cpExtensionSubmissionModel.find({
        username: leetcodeHandle,
        questionStatus: 'ac'
      }).select('titleSlug').lean();

      return new Set(solvedProblems.map(p => p.titleSlug));
    } catch (error) {
      console.error('Error fetching solved problems:', error.message);
      return new Set();
    }
  }

  /**
   * Get recent submissions for a user (for polling during battle)
   * Uses LeetCode GraphQL API directly - gets last 20 submissions
   * @param {string} username - LeetCode username
   * @param {number} limit - Number of submissions to fetch (max 20)
   * @returns {Promise<Array>} Recent submissions with structure:
   *   { title, titleSlug, timestamp, statusDisplay, lang }
   */
  async getRecentSubmissions(username, limit = 20) {
    const query = `
      query ($username: String!, $limit: Int) {
        recentSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username, limit });
      const submissions = data.recentSubmissionList || [];
      
      console.log(`[LeetCodeService] Fetched ${submissions.length} recent submissions for ${username}`);
      if (submissions.length > 0) {
        console.log(`[LeetCodeService] Sample submission:`, JSON.stringify(submissions[0]));
      }
      
      return submissions;
    } catch (error) {
      console.error(`[LeetCodeService] Error fetching recent submissions for ${username}:`, error.message);
      return [];
    }
  }

  /**
   * Get all LeetCode problems with caching
   * @returns {Promise<Array>} Array of problems
   */
  async getAllProblemsWithCache() {
    const now = Date.now();

    // Return cached problems if still valid
    if (this.problemCache && this.problemCacheTime && 
        (now - this.problemCacheTime) < this.PROBLEM_CACHE_TTL) {
      return this.problemCache;
    }

    // Fetch fresh problems
    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            acRate
            difficulty
            frontendQuestionId: questionFrontendId
            paidOnly: isPaidOnly
            title
            titleSlug
            topicTags {
              name
              slug
            }
            hasSolution
            hasVideoSolution
          }
        }
      }
    `;

    try {
      // Fetch in batches
      let allProblems = [];
      let skip = 0;
      const limit = 100;
      
      // Fetch up to 3000 problems
      while (skip < 3000) {
        const data = await this.makeRequest(query, {
          categorySlug: '',
          skip,
          limit,
          filters: {}
        });

        const problems = data.problemsetQuestionList?.questions || [];
        if (problems.length === 0) break;
        
        allProblems = allProblems.concat(problems);
        skip += limit;
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Filter out paid-only problems
      allProblems = allProblems.filter(p => !p.paidOnly);
      
      this.problemCache = allProblems;
      this.problemCacheTime = now;
      
      console.log(`Cached ${allProblems.length} LeetCode problems`);
      return this.problemCache;
    } catch (error) {
      // If we have cached data, return it even if expired
      if (this.problemCache) {
        console.warn('Failed to refresh LeetCode problem cache, using stale data:', error.message);
        return this.problemCache;
      }
      throw error;
    }
  }

  /**
   * Choose random LeetCode problems that haven't been solved by participants
   * @param {Array<string>} difficulties - Array of difficulties (Easy, Medium, Hard)
   * @param {number} count - Number of problems to select
   * @param {Array<string>} handles - Participant LeetCode handles
   * @returns {Promise<Array>} Selected problems
   */
  async chooseProblems(difficulties, count, handles) {
    // Get all problems
    const allProblems = await this.getAllProblemsWithCache();

    // Get solved problems for all participants
    const solvedSet = new Set();

    for (const handle of handles) {
      try {
        const solved = await this.getUserSolvedProblems(handle);
        solved.forEach(slug => solvedSet.add(slug));
      } catch (error) {
        console.warn(`Could not fetch solved problems for ${handle}:`, error.message);
      }
    }

    // Filter problems
    const eligibleProblems = allProblems.filter(p => {
      // Must be in selected difficulties
      if (!difficulties.includes(p.difficulty)) {
        return false;
      }

      // Must not have been solved by any participant
      if (solvedSet.has(p.titleSlug)) {
        return false;
      }

      return true;
    });

    if (eligibleProblems.length < count) {
      throw new Error(`Not enough eligible LeetCode problems found. Found ${eligibleProblems.length}, need ${count}`);
    }

    // Shuffle and select
    const shuffled = eligibleProblems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(p => ({
      platform: 'leetcode',
      titleSlug: p.titleSlug,
      title: p.title,
      difficulty: p.difficulty,
      frontendId: p.frontendQuestionId,
      name: p.title
    }));
  }

  /**
   * Validate if a LeetCode handle exists
   * @param {string} username - LeetCode username
   * @returns {Promise<boolean>} True if valid
   */
  async validateHandle(username) {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
        }
      }
    `;

    try {
      const data = await this.makeRequest(query, { username });
      return !!data.matchedUser;
    } catch (error) {
      return false;
    }
  }
}

export default LeetCodeBattleService;
