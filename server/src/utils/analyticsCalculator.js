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
