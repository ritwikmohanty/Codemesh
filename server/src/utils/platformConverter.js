/**
 * Platform Data Conversion Utilities
 * Contains mapping functions to convert platform-specific data to unified formats
 */

/**
 * Codeforces-specific conversion utilities
 */
export const CodeforcesConverter = {
  /**
   * Convert Codeforces rating to unified difficulty
   * @param {number} rating - Codeforces problem rating
   * @returns {string} Unified difficulty level
   */
  ratingToDifficulty(rating) {
    if (!rating || rating < 800) return 'Easy';
    if (rating < 1200) return 'Easy';
    if (rating < 1700) return 'Medium';
    if (rating < 2200) return 'Hard';
    return 'Expert';
  },

  /**
   * Convert Codeforces verdict to unified status
   * @param {string} verdict - Codeforces verdict
   * @returns {string} Unified submission status
   */
  verdictToStatus(verdict) {
    const verdictMap = {
      'OK': 'Accepted',
      'WRONG_ANSWER': 'Wrong Answer',
      'TIME_LIMIT_EXCEEDED': 'Time Limit Exceeded',
      'MEMORY_LIMIT_EXCEEDED': 'Memory Limit Exceeded',
      'RUNTIME_ERROR': 'Runtime Error',
      'COMPILATION_ERROR': 'Compilation Error',
      'PRESENTATION_ERROR': 'Presentation Error',
      'PARTIAL': 'Partial',
      'SKIPPED': 'Skipped',
      'CHALLENGED': 'Challenged',
      'FAILED': 'Failed',
      'REJECTED': 'Rejected'
    };
    return verdictMap[verdict] || verdict;
  },

  /**
   * Convert Codeforces tags to unified categories
   * @param {Array<string>} tags - Codeforces problem tags
   * @returns {object} Object with unified categories and topics
   */
  tagsToCategories(tags) {
    if (!tags || !Array.isArray(tags)) return { category: 'DSA', topics: [] };

    const categoryMapping = {
      'implementation': 'Fundamentals',
      'math': 'Fundamentals', 
      'number theory': 'Fundamentals',
      'combinatorics': 'Fundamentals',
      'constructive algorithms': 'CP',
      'games': 'CP',
      'interactive': 'CP',
      'strings': 'DSA',
      'data structures': 'DSA',
      'trees': 'DSA',
      'graphs': 'DSA',
      'dp': 'DSA',
      'dynamic programming': 'DSA',
      'greedy': 'DSA',
      'two pointers': 'DSA',
      'binary search': 'DSA',
      'sortings': 'DSA',
      'dfs and similar': 'DSA',
      'bfs': 'DSA'
    };

    // Determine primary category
    let category = 'DSA'; // default
    for (const tag of tags) {
      if (categoryMapping[tag.toLowerCase()]) {
        category = categoryMapping[tag.toLowerCase()];
        break;
      }
    }

    // Normalize topic names
    const normalizedTopics = tags.map(tag => {
      const normalized = tag.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w]/g, '');
      return normalized;
    });

    return { category, topics: normalizedTopics };
  },

  /**
   * Convert Codeforces user rating to unified rating info
   * @param {number} rating - User's current rating
   * @param {number} maxRating - User's maximum rating
   * @returns {object} Unified rating information
   */
  userRatingToUnified(rating, maxRating) {
    const getRankTitle = (rating) => {
      if (!rating) return 'unrated';
      if (rating >= 3000) return 'legendary_grandmaster';
      if (rating >= 2600) return 'international_grandmaster';
      if (rating >= 2400) return 'grandmaster';
      if (rating >= 2300) return 'international_master';
      if (rating >= 2100) return 'master';
      if (rating >= 1900) return 'candidate_master';
      if (rating >= 1600) return 'expert';
      if (rating >= 1400) return 'specialist';
      if (rating >= 1200) return 'pupil';
      return 'newbie';
    };

    return {
      current: rating || 0,
      max: maxRating || rating || 0,
      rank: getRankTitle(rating),
      maxRank: getRankTitle(maxRating || rating)
    };
  },

  /**
   * Extract unified problem data from Codeforces problem object
   * @param {object} problem - Codeforces problem object
   * @returns {object} Unified problem data
   */
  problemToUnified(problem) {
    if (!problem) return null;

    const { category, topics } = this.tagsToCategories(problem.tags);
    
    return {
      id: `${problem.contestId || 'gym'}${problem.index || ''}`,
      name: problem.name,
      difficulty: this.ratingToDifficulty(problem.rating),
      rating: problem.rating || null,
      category,
      topics,
      url: problem.contestId ? 
        `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}` :
        `https://codeforces.com/gym/problem/${problem.contestId}/${problem.index}`
    };
  }
};

/**
 * LeetCode-specific conversion utilities
 */
export const LeetCodeConverter = {
  /**
   * Convert LeetCode difficulty to unified difficulty
   * @param {string} difficulty - LeetCode difficulty (Easy/Medium/Hard)
   * @returns {string} Unified difficulty level
   */
  difficultyToUnified(difficulty) {
    const diffMap = {
      'Easy': 'Easy',
      'Medium': 'Medium',
      'Hard': 'Hard'
    };
    return diffMap[difficulty] || 'Medium';
  },

  /**
   * Convert LeetCode status to unified status
   * @param {string} status - LeetCode submission status
   * @returns {string} Unified submission status
   */
  statusToUnified(status) {
    const statusMap = {
      'Accepted': 'Accepted',
      'Wrong Answer': 'Wrong Answer',
      'Time Limit Exceeded': 'Time Limit Exceeded',
      'Memory Limit Exceeded': 'Memory Limit Exceeded',
      'Runtime Error': 'Runtime Error',
      'Compile Error': 'Compilation Error',
      'Output Limit Exceeded': 'Output Limit Exceeded'
    };
    return statusMap[status] || status;
  },

  /**
   * Convert LeetCode tags to unified categories
   * @param {Array<Object>} tags - LeetCode topic tags
   * @returns {object} Object with unified categories and topics
   */
  tagsToCategories(tags) {
    if (!tags || !Array.isArray(tags)) return { category: 'DSA', topics: [] };

    const tagNames = tags.map(tag => typeof tag === 'string' ? tag : tag.name || tag.tagName);

    const categoryMapping = {
      'math': 'Fundamentals',
      'bit manipulation': 'Fundamentals',
      'simulation': 'Fundamentals',
      'brainteaser': 'CP',
      'game theory': 'CP',
      'interactive': 'CP',
      'string': 'DSA',
      'array': 'DSA',
      'hash table': 'DSA',
      'tree': 'DSA',
      'graph': 'DSA',
      'dynamic programming': 'DSA',
      'greedy': 'DSA',
      'two pointers': 'DSA',
      'binary search': 'DSA',
      'sorting': 'DSA',
      'depth-first search': 'DSA',
      'breadth-first search': 'DSA',
      'backtracking': 'DSA',
      'stack': 'DSA',
      'queue': 'DSA',
      'heap': 'DSA',
      'linked list': 'DSA'
    };

    // Determine primary category
    let category = 'DSA'; // default
    for (const tag of tagNames) {
      const tagLower = tag.toLowerCase();
      if (categoryMapping[tagLower]) {
        category = categoryMapping[tagLower];
        break;
      }
    }

    // Normalize topic names
    const normalizedTopics = tagNames.map(tag => 
      tag.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '')
    );

    return { category, topics: normalizedTopics };
  },

  /**
   * Convert LeetCode contest rating to unified rating info
   * @param {number} rating - User's contest rating
   * @param {number} ranking - User's global ranking
   * @returns {object} Unified rating information
   */
  contestRatingToUnified(rating, ranking) {
    const getRankTitle = (rating) => {
      if (!rating || rating === 0) return 'unrated';
      if (rating >= 2500) return 'guardian';
      if (rating >= 2200) return 'knight';
      if (rating >= 1800) return 'expert';
      return 'rated';
    };

    return {
      current: rating || 0,
      max: rating || 0, // LeetCode doesn't track max rating separately
      rank: getRankTitle(rating),
      globalRanking: ranking || 0
    };
  },

  /**
   * Extract unified problem data from LeetCode problem object
   * @param {object} problem - LeetCode problem object
   * @returns {object} Unified problem data
   */
  problemToUnified(problem) {
    if (!problem) return null;

    const { category, topics } = this.tagsToCategories(problem.topicTags || []);
    
    return {
      id: problem.titleSlug || problem.questionFrontendId,
      name: problem.title,
      difficulty: this.difficultyToUnified(problem.difficulty),
      rating: null, // LeetCode doesn't have numeric ratings like Codeforces
      category,
      topics,
      url: `https://leetcode.com/problems/${problem.titleSlug || problem.questionFrontendId}`,
      isPaidOnly: problem.isPaidOnly || false
    };
  },

  /**
   * Convert submission calendar to heatmap format
   * @param {string} submissionCalendar - JSON string of submission calendar
   * @returns {object} Heatmap data
   */
  calendarToHeatmap(submissionCalendar) {
    if (!submissionCalendar) return {};
    
    try {
      const calendar = JSON.parse(submissionCalendar);
      const heatmap = {};
      
      Object.entries(calendar).forEach(([timestamp, count]) => {
        const date = new Date(parseInt(timestamp) * 1000);
        const dateKey = date.toISOString().split('T')[0];
        heatmap[dateKey] = count;
      });
      
      return heatmap;
    } catch (error) {
      console.error('Error parsing submission calendar:', error);
      return {};
    }
  }
};

/**
 * Generic conversion utilities that work across platforms
 */
export const UnifiedConverter = {
  /**
   * Calculate unified difficulty distribution from submissions
   * @param {Array} submissions - Array of platform submissions with unified difficulty
   * @returns {object} Difficulty distribution
   */
  calculateDifficultyDistribution(submissions) {
    const distribution = {
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0
    };

    submissions.forEach(submission => {
      if (submission.unified?.difficulty) {
        const diff = submission.unified.difficulty.toLowerCase();
        if (distribution.hasOwnProperty(diff)) {
          distribution[diff]++;
        }
      }
    });

    return distribution;
  },

  /**
   * Calculate unified topic distribution
   * @param {Array} submissions - Array of platform submissions with unified topics
   * @returns {object} Topic distribution
   */
  calculateTopicDistribution(submissions) {
    const topicCount = {};

    submissions.forEach(submission => {
      if (submission.unified?.topics && Array.isArray(submission.unified.topics)) {
        submission.unified.topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }
    });

    return topicCount;
  },

  /**
   * Calculate activity heatmap data
   * @param {Array} submissions - Array of platform submissions with timestamps
   * @returns {object} Heatmap data with date keys
   */
  calculateActivityHeatmap(submissions) {
    const heatmapData = {};

    submissions.forEach(submission => {
      const timestamp = submission.quickAccess?.timestamp || submission.timestamp;
      if (timestamp) {
        const dateKey = new Date(timestamp).toISOString().split('T')[0];
        heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
      }
    });

    return heatmapData;
  },

  /**
   * Calculate CodeMesh unified rating based on multiple platform ratings
   * @param {Array} platformRatings - Array of {platform, rating, maxRating} objects
   * @returns {number} Unified CodeMesh rating
   */
  calculateCodeMeshRating(platformRatings) {
    if (!platformRatings || platformRatings.length === 0) return 0;

    // Weighted average based on platform importance and user's performance
    let totalWeightedRating = 0;
    let totalWeight = 0;

    const platformWeights = {
      'codeforces': 1.0,
      'leetcode': 0.8,
      'codechef': 0.9,
      'atcoder': 1.0,
      'hackerrank': 0.6,
      'geeksforgeeks': 0.5
    };

    platformRatings.forEach(({ platform, rating, maxRating }) => {
      const weight = platformWeights[platform] || 0.5;
      const normalizedRating = this.normalizePlatformRating(platform, rating, maxRating);
      
      totalWeightedRating += normalizedRating * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalWeightedRating / totalWeight) : 0;
  },

  /**
   * Normalize platform-specific ratings to a common scale (0-4000)
   * @param {string} platform - Platform name
   * @param {number} rating - Current rating
   * @param {number} maxRating - Maximum rating
   * @returns {number} Normalized rating
   */
  normalizePlatformRating(platform, rating, maxRating) {
    const useRating = Math.max(rating || 0, maxRating || 0);
    
    switch (platform.toLowerCase()) {
      case 'codeforces':
        return useRating; // Already on 0-4000+ scale
      case 'leetcode':
        // LeetCode rating roughly 1000-3000, normalize to CF scale
        return Math.min(useRating * 1.3, 4000);
      case 'codechef':
        // CodeChef rating roughly 1000-3500, similar to CF
        return Math.min(useRating * 1.1, 4000);
      case 'atcoder':
        // AtCoder rating roughly 0-4000+, similar to CF
        return useRating;
      default:
        // For unknown platforms, assume similar to CF but cap lower
        return Math.min(useRating, 3000);
    }
  }
};

/**
 * Platform-specific converters registry
 */
export const PlatformConverters = {
  codeforces: CodeforcesConverter,
  leetcode: LeetCodeConverter,
  // Add other platform converters here as they're implemented
  // codechef: CodeChefConverter,
};

/**
 * Get converter for specific platform
 * @param {string} platform - Platform name
 * @returns {object} Platform-specific converter
 */
export function getConverter(platform) {
  return PlatformConverters[platform.toLowerCase()] || null;
}