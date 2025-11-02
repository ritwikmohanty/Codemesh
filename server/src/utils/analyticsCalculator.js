/**
 * Analytics Calculator Utility
 * Contains pure functions for calculating dashboard statistics from raw submission data
 */

/**
 * Calculate heatmap data from submissions
 * @param {Array} submissions - Array of submission objects
 * @returns {Object} Heatmap data with date strings as keys and submission counts as values
 */
export function calculateHeatmap(submissions) {
  const heatmapData = {};
  
  submissions.forEach(submission => {
    const date = new Date(submission.timestamp);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    heatmapData[dateKey] = (heatmapData[dateKey] || 0) + 1;
  });
  
  return heatmapData;
}

/**
 * Calculate platform-specific heatmap data
 * @param {Array} submissions - Array of submission objects
 * @param {string} platform - Platform name to filter by
 * @returns {Object} Platform-specific heatmap data
 */
export function calculatePlatformHeatmap(submissions, platform) {
  const platformSubmissions = submissions.filter(sub => sub.platform === platform);
  return calculateHeatmap(platformSubmissions);
}

/**
 * Calculate streak information from heatmap data
 * @param {Object} heatmapData - Heatmap data object with date keys
 * @returns {Object} Object containing currentStreak, maxStreak, and activeDays
 */
export function calculateStreaks(heatmapData) {
  const dates = Object.keys(heatmapData).sort();
  
  if (dates.length === 0) {
    return { currentStreak: 0, maxStreak: 0, activeDays: dates.length };
  }
  
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  // Check if today has activity for current streak calculation
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Calculate max streak by finding consecutive days
  for (let i = 0; i < dates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const dayDiff = (currDate - prevDate) / (24 * 60 * 60 * 1000);
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  maxStreak = Math.max(maxStreak, tempStreak);
  
  // Calculate current streak (from today backwards)
  if (heatmapData[today] || heatmapData[yesterday]) {
    const startDate = heatmapData[today] ? today : yesterday;
    let checkDate = new Date(startDate);
    
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (heatmapData[dateKey]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  return {
    currentStreak,
    maxStreak,
    activeDays: dates.length
  };
}

/**
 * Calculate topic distribution from accepted submissions
 * @param {Array} submissions - Array of submission objects
 * @param {boolean} acceptedOnly - Whether to count only accepted submissions
 * @returns {Object} Object with topic names as keys and counts as values
 */
export function calculateTopicDistribution(submissions, acceptedOnly = true) {
  const topicCounts = {};
  
  const filteredSubmissions = acceptedOnly 
    ? submissions.filter(sub => sub.verdict === 'Accepted')
    : submissions;
  
  // Use Set to avoid counting same problem multiple times per topic
  const problemTopicPairs = new Set();
  
  filteredSubmissions.forEach(submission => {
    if (submission.tags && Array.isArray(submission.tags)) {
      submission.tags.forEach(tag => {
        const pairKey = `${submission.problemIdOnPlatform}-${tag}`;
        if (!problemTopicPairs.has(pairKey)) {
          problemTopicPairs.add(pairKey);
          topicCounts[tag] = (topicCounts[tag] || 0) + 1;
        }
      });
    }
  });
  
  return topicCounts;
}

/**
 * Calculate platform-specific topic distribution
 * @param {Array} submissions - Array of submission objects
 * @param {string} platform - Platform name to filter by
 * @param {boolean} acceptedOnly - Whether to count only accepted submissions
 * @returns {Object} Platform-specific topic distribution
 */
export function calculatePlatformTopicDistribution(submissions, platform, acceptedOnly = true) {
  const platformSubmissions = submissions.filter(sub => sub.platform === platform);
  return calculateTopicDistribution(platformSubmissions, acceptedOnly);
}

/**
 * Calculate difficulty distribution from submissions
 * @param {Array} submissions - Array of submission objects
 * @param {boolean} acceptedOnly - Whether to count only accepted submissions
 * @returns {Object} Object with difficulty levels as keys and counts as values
 */
export function calculateDifficultyDistribution(submissions, acceptedOnly = true) {
  const difficultyCounts = {
    easy: 0,
    medium: 0,
    hard: 0,
    expert: 0
  };
  
  const filteredSubmissions = acceptedOnly 
    ? submissions.filter(sub => sub.verdict === 'Accepted')
    : submissions;
  
  // Use Set to avoid counting same problem multiple times
  const solvedProblems = new Set();
  
  filteredSubmissions.forEach(submission => {
    const problemKey = `${submission.platform}-${submission.problemIdOnPlatform}`;
    
    if (!solvedProblems.has(problemKey)) {
      solvedProblems.add(problemKey);
      
      const difficulty = submission.difficulty?.toLowerCase() || 'medium';
      if (difficultyCounts.hasOwnProperty(difficulty)) {
        difficultyCounts[difficulty]++;
      }
    }
  });
  
  return difficultyCounts;
}

/**
 * Calculate category distribution (CP, DSA, Fundamentals)
 * @param {Array} submissions - Array of submission objects
 * @param {boolean} acceptedOnly - Whether to count only accepted submissions
 * @returns {Object} Object with category names as keys and counts as values
 */
export function calculateCategoryDistribution(submissions, acceptedOnly = true) {
  const categoryCounts = {
    CP: 0,
    DSA: 0,
    Fundamentals: 0
  };
  
  const filteredSubmissions = acceptedOnly 
    ? submissions.filter(sub => sub.verdict === 'Accepted')
    : submissions;
  
  // Use Set to avoid counting same problem multiple times
  const solvedProblems = new Set();
  
  filteredSubmissions.forEach(submission => {
    const problemKey = `${submission.platform}-${submission.problemIdOnPlatform}`;
    
    if (!solvedProblems.has(problemKey)) {
      solvedProblems.add(problemKey);
      
      const category = submission.category || 'DSA';
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      }
    }
  });
  
  return categoryCounts;
}

/**
 * Calculate language usage distribution
 * @param {Array} submissions - Array of submission objects
 * @param {boolean} acceptedOnly - Whether to count only accepted submissions
 * @returns {Object} Object with language names as keys and counts as values
 */
export function calculateLanguageDistribution(submissions, acceptedOnly = true) {
  const languageCounts = {};
  
  const filteredSubmissions = acceptedOnly 
    ? submissions.filter(sub => sub.verdict === 'Accepted')
    : submissions;
  
  filteredSubmissions.forEach(submission => {
    if (submission.language) {
      languageCounts[submission.language] = (languageCounts[submission.language] || 0) + 1;
    }
  });
  
  return languageCounts;
}

/**
 * Calculate accuracy and average attempts per problem
 * @param {Array} submissions - Array of submission objects
 * @returns {Object} Object containing accuracy percentage and average attempts
 */
export function calculateAccuracyStats(submissions) {
  if (submissions.length === 0) {
    return { accuracy: 0, averageAttempts: 0 };
  }
  
  const problemAttempts = {};
  const problemAccepted = new Set();
  
  // Group submissions by problem
  submissions.forEach(submission => {
    const problemKey = `${submission.platform}-${submission.problemIdOnPlatform}`;
    
    if (!problemAttempts[problemKey]) {
      problemAttempts[problemKey] = 0;
    }
    problemAttempts[problemKey]++;
    
    if (submission.verdict === 'Accepted') {
      problemAccepted.add(problemKey);
    }
  });
  
  const totalProblems = Object.keys(problemAttempts).length;
  const solvedProblems = problemAccepted.size;
  const totalAttempts = Object.values(problemAttempts).reduce((sum, attempts) => sum + attempts, 0);
  
  const accuracy = totalProblems > 0 ? (solvedProblems / totalProblems) * 100 : 0;
  const averageAttempts = totalProblems > 0 ? totalAttempts / totalProblems : 0;
  
  return {
    accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
    averageAttempts: Math.round(averageAttempts * 100) / 100
  };
}

/**
 * Calculate platform-specific accuracy stats
 * @param {Array} submissions - Array of submission objects
 * @param {string} platform - Platform name to filter by
 * @returns {Object} Platform-specific accuracy statistics
 */
export function calculatePlatformAccuracyStats(submissions, platform) {
  const platformSubmissions = submissions.filter(sub => sub.platform === platform);
  return calculateAccuracyStats(platformSubmissions);
}

/**
 * Get recent submissions (last N submissions)
 * @param {Array} submissions - Array of submission objects
 * @param {number} limit - Number of recent submissions to return
 * @returns {Array} Array of recent submission objects
 */
export function getRecentSubmissions(submissions, limit = 10) {
  return submissions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

/**
 * Calculate overall statistics summary
 * @param {Array} submissions - Array of submission objects
 * @returns {Object} Comprehensive statistics object
 */
export function calculateOverallStats(submissions) {
  const heatmapData = calculateHeatmap(submissions);
  const streaks = calculateStreaks(heatmapData);
  const topicDistribution = calculateTopicDistribution(submissions);
  const difficultyDistribution = calculateDifficultyDistribution(submissions);
  const categoryDistribution = calculateCategoryDistribution(submissions);
  const languageDistribution = calculateLanguageDistribution(submissions);
  const accuracyStats = calculateAccuracyStats(submissions);
  
  const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'Accepted');
  const totalSolved = new Set(acceptedSubmissions.map(sub => 
    `${sub.platform}-${sub.problemIdOnPlatform}`
  )).size;
  
  return {
    totalSolved,
    totalSubmissions: submissions.length,
    ...streaks,
    ...difficultyDistribution,
    ...categoryDistribution,
    ...accuracyStats,
    topicDistribution,
    languageDistribution,
    heatmapData
  };
}

/* ============================================
 * CODEMESH MASTER RATING CALCULATION FUNCTIONS
 * ============================================ */

/**
 * Platform rating weights for CodeMesh Master Rating
 * Higher weight = more prestigious platform
 */
const PLATFORM_WEIGHTS = {
  codeforces: 1.0,    // Most prestigious competitive programming platform
  leetcode: 0.85,      // Popular interview prep platform
  atcoder: 0.95,       // High-quality competitive programming
  codechef: 0.90,      // Established CP platform
  hackerrank: 0.70,    // Interview prep and contests
  geeksforgeeks: 0.65, // Practice-focused
  code360: 0.65,       // Practice-focused
  hackerearth: 0.75    // Contests and hackathons
};

/**
 * Maximum rating values for each platform (for normalization)
 */
const PLATFORM_MAX_RATINGS = {
  codeforces: 4000,
  leetcode: 3500,
  atcoder: 4000,
  codechef: 4000,
  hackerrank: 2500,
  geeksforgeeks: 2000,
  code360: 2000,
  hackerearth: 3000
};

/**
 * Normalize platform-specific rating to a common scale (0-4000)
 * @param {string} platform - Platform name
 * @param {number} rating - Current rating on the platform
 * @returns {number} Normalized rating (0-4000)
 */
export function normalizePlatformRating(platform, rating) {
  if (!rating || rating <= 0) return 0;
  
  const maxRating = PLATFORM_MAX_RATINGS[platform.toLowerCase()] || 2000;
  
  // Normalize to 0-4000 scale
  const normalized = (rating / maxRating) * 4000;
  
  return Math.min(normalized, 4000);
}

/**
 * Calculate weighted average of platform ratings (Core Rating)
 * @param {Array} platformRatings - Array of {platform, rating, maxRating} objects
 * @returns {number} Weighted average rating
 */
export function calculateWeightedPlatformRating(platformRatings) {
  if (!platformRatings || platformRatings.length === 0) {
    return 0;
  }
  
  let totalWeightedRating = 0;
  let totalWeight = 0;
  
  platformRatings.forEach(({ platform, rating, maxRating }) => {
    const platformKey = platform.toLowerCase();
    const weight = PLATFORM_WEIGHTS[platformKey] || 0.5;
    
    // Use max rating if available, otherwise current rating
    const effectiveRating = maxRating || rating || 0;
    
    // Normalize the rating
    const normalizedRating = normalizePlatformRating(platformKey, effectiveRating);
    
    totalWeightedRating += normalizedRating * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? totalWeightedRating / totalWeight : 0;
}

/**
 * Calculate contest experience bonus (logarithmic scale)
 * Rewards long-term participation in contests
 * @param {number} totalContests - Total number of contests participated
 * @returns {number} Bonus rating points (0-200)
 */
export function calculateContestExperienceBonus(totalContests) {
  if (!totalContests || totalContests <= 0) {
    return 0;
  }
  
  // Logarithmic scaling: log2(contests + 1) * 20
  // Examples:
  // 0 contests = 0 bonus
  // 10 contests = ~69 bonus
  // 50 contests = ~113 bonus
  // 100 contests = ~133 bonus
  // 500 contests = ~179 bonus
  const bonus = Math.log2(totalContests + 1) * 20;
  
  // Cap at 200 points
  return Math.min(bonus, 200);
}

/**
 * Calculate accuracy bonus based on acceptance rate
 * Rewards users with high first-submission accuracy
 * @param {number} acceptanceRate - Global acceptance rate (0-100)
 * @returns {number} Bonus rating points (0-150)
 */
export function calculateAccuracyBonus(acceptanceRate) {
  if (!acceptanceRate || acceptanceRate <= 0) {
    return 0;
  }
  
  // Bonus kicks in after 40% accuracy
  // Linear scaling from 40% to 95% accuracy
  // Examples:
  // 40% = 0 bonus
  // 50% = ~27 bonus
  // 60% = ~55 bonus
  // 75% = ~95 bonus
  // 85% = ~122 bonus
  // 95% = ~150 bonus
  
  if (acceptanceRate < 40) {
    return 0;
  }
  
  const normalizedAccuracy = Math.min(acceptanceRate, 95);
  const bonus = ((normalizedAccuracy - 40) / 55) * 150;
  
  return Math.max(0, Math.min(bonus, 150));
}

/**
 * Calculate practice volume bonus (logarithmic scale)
 * Rewards users who solve many unique problems
 * @param {number} totalSolved - Total unique problems solved
 * @returns {number} Bonus rating points (0-100)
 */
export function calculatePracticeVolumeBonus(totalSolved) {
  if (!totalSolved || totalSolved <= 0) {
    return 0;
  }
  
  // Logarithmic scaling: log10(solved + 1) * 33
  // Examples:
  // 10 problems = ~34 bonus
  // 50 problems = ~56 bonus
  // 100 problems = ~66 bonus
  // 500 problems = ~89 bonus
  // 1000 problems = ~99 bonus
  const bonus = Math.log10(totalSolved + 1) * 33;
  
  // Cap at 100 points
  return Math.min(bonus, 100);
}

/**
 * Calculate CodeMesh Master Rating
 * This is the main function that combines all rating components
 * @param {Object} params - Rating calculation parameters
 * @param {Array} params.platformRatings - Array of {platform, rating, maxRating} objects
 * @param {number} params.totalContests - Total contests participated
 * @param {number} params.acceptanceRate - Global acceptance rate (0-100)
 * @param {number} params.totalSolved - Total unique problems solved
 * @returns {Object} Object containing masterRating and breakdown
 */
export function calculateCodeMeshMasterRating({
  platformRatings = [],
  totalContests = 0,
  acceptanceRate = 0,
  totalSolved = 0
}) {
  // Core rating (weighted platform average)
  const coreRating = calculateWeightedPlatformRating(platformRatings);
  
  // Bonus components
  const contestBonus = calculateContestExperienceBonus(totalContests);
  const accuracyBonus = calculateAccuracyBonus(acceptanceRate);
  const practiceBonus = calculatePracticeVolumeBonus(totalSolved);
  
  // Final master rating
  const masterRating = Math.round(
    coreRating + contestBonus + accuracyBonus + practiceBonus
  );
  
  return {
    masterRating,
    breakdown: {
      coreRating: Math.round(coreRating),
      contestBonus: Math.round(contestBonus),
      accuracyBonus: Math.round(accuracyBonus),
      practiceBonus: Math.round(practiceBonus)
    },
    components: {
      platformRatings: platformRatings.map(pr => ({
        platform: pr.platform,
        rating: pr.rating,
        normalized: Math.round(normalizePlatformRating(pr.platform, pr.maxRating || pr.rating))
      })),
      totalContests,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      totalSolved
    }
  };
}

/**
 * Extract platform ratings from user's platform data
 * @param {Array} platformDataArray - Array of PlatformData documents
 * @returns {Array} Array of {platform, rating, maxRating} objects
 */
export function extractPlatformRatings(platformDataArray) {
  if (!platformDataArray || platformDataArray.length === 0) {
    return [];
  }
  
  return platformDataArray
    .filter(pd => pd.isActive && pd.quickAccess)
    .map(pd => ({
      platform: pd.platform,
      rating: pd.quickAccess.currentRating || 0,
      maxRating: pd.quickAccess.maxRating || pd.quickAccess.currentRating || 0
    }))
    .filter(pr => pr.rating > 0); // Only include platforms with actual ratings
}

/**
 * Count total contests from rating history
 * @param {Array} ratingHistoryArray - Array of PlatformRatingHistory documents
 * @returns {number} Total number of unique contests
 */
export function countTotalContests(ratingHistoryArray) {
  if (!ratingHistoryArray || ratingHistoryArray.length === 0) {
    return 0;
  }
  
  // Use Set to ensure unique contests
  const uniqueContests = new Set(
    ratingHistoryArray.map(rh => `${rh.platform}-${rh.platformContestId}`)
  );
  
  return uniqueContests.size;
}

/**
 * Calculate global acceptance rate from all platform submissions
 * @param {Array} submissionsArray - Array of PlatformSubmission documents
 * @returns {number} Acceptance rate (0-100)
 */
export function calculateGlobalAcceptanceRate(submissionsArray) {
  if (!submissionsArray || submissionsArray.length === 0) {
    return 0;
  }
  
  let totalSubmissions = 0;
  let acceptedSubmissions = 0;
  
  submissionsArray.forEach(sub => {
    totalSubmissions++;
    
    // Check for accepted verdicts (platform-specific)
    const verdict = sub.quickAccess?.verdict?.toLowerCase() || '';
    if (verdict === 'ok' || verdict === 'accepted' || verdict === 'ac') {
      acceptedSubmissions++;
    }
  });
  
  return totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
}

/**
 * Count total unique problems solved across all platforms
 * @param {Array} submissionsArray - Array of PlatformSubmission documents
 * @returns {number} Total unique problems solved
 */
export function countTotalUniqueSolved(submissionsArray) {
  if (!submissionsArray || submissionsArray.length === 0) {
    return 0;
  }
  
  const solvedProblems = new Set();
  
  submissionsArray.forEach(sub => {
    const verdict = sub.quickAccess?.verdict?.toLowerCase() || '';
    if (verdict === 'ok' || verdict === 'accepted' || verdict === 'ac') {
      const problemKey = `${sub.platform}-${sub.quickAccess.problemId}`;
      solvedProblems.add(problemKey);
    }
  });
  
  return solvedProblems.size;
}
