// import BasePlatformService from './BasePlatformService.js';
// import axios from 'axios';

// class CodeforcesService extends BasePlatformService {
//   constructor() {
//     super('codeforces');
//     this.baseURL = 'https://codeforces.com/api';
//     this.rateLimit = {
//       requestsPerSecond: 1,
//       burstLimit: 5,
//       lastRequestTime: 0
//     };
//   }

//   /**
//    * Rate limiting helper
//    */
//   async waitForRateLimit() {
//     const now = Date.now();
//     const timeSinceLastRequest = now - this.rateLimit.lastRequestTime;
//     const minInterval = 1000 / this.rateLimit.requestsPerSecond;

//     if (timeSinceLastRequest < minInterval) {
//       await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastRequest));
//     }
//     this.rateLimit.lastRequestTime = Date.now();
//   }

//   /**
//    * Make API request with rate limiting and error handling
//    */
//   async makeRequest(endpoint, params = {}) {
//     await this.waitForRateLimit();
    
//     try {
//       const response = await axios.get(`${this.baseURL}${endpoint}`, {
//         params,
//         timeout: 10000
//       });

//       if (response.data.status !== 'OK') {
//         throw new Error(response.data.comment || 'API request failed');
//       }

//       return response.data.result;
//     } catch (error) {
//       if (error.response?.status === 400) {
//         throw new Error('Invalid handle or request parameters');
//       } else if (error.response?.status === 503) {
//         throw new Error('Codeforces API is temporarily unavailable');
//       }
//       throw error;
//     }
//   }

//   /**
//    * Get user information from Codeforces
//    */
//   async getUserInfo(handle) {
//     try {
//       const userInfo = await this.makeRequest('/user.info', { handles: handle });
//       const user = userInfo[0];

//       return {
//         handle: user.handle,
//         rating: user.rating || 0,
//         maxRating: user.maxRating || 0,
//         rank: user.rank || 'unrated',
//         maxRank: user.maxRank || 'unrated',
//         avatar: user.avatar || null,
//         titlePhoto: user.titlePhoto || null,
//         firstName: user.firstName || '',
//         lastName: user.lastName || '',
//         country: user.country || '',
//         city: user.city || '',
//         organization: user.organization || '',
//         contribution: user.contribution || 0,
//         friendOfCount: user.friendOfCount || 0,
//         lastOnlineTimeSeconds: user.lastOnlineTimeSeconds || null,
//         registrationTimeSeconds: user.registrationTimeSeconds || null
//       };
//     } catch (error) {
//       this.handleError(error, 'fetch user info');
//     }
//   }

//   /**
//    * Get all submissions for a user
//    */
//   async getAllSubmissions(handle, options = {}) {
//     try {
//       const submissions = await this.makeRequest('/user.status', { 
//         handle,
//         from: options.from || 1,
//         count: options.count || 10000
//       });

//       return submissions.map(submission => ({
//         submissionIdOnPlatform: submission.id.toString(),
//         problemIdOnPlatform: `${submission.problem.contestId}${submission.problem.index}`,
//         problemName: submission.problem.name,
//         contestId: submission.contestId?.toString() || null,
//         verdict: this.mapVerdict(submission.verdict),
//         language: submission.programmingLanguage,
//         timestamp: new Date(submission.creationTimeSeconds * 1000),
//         timeSpent: submission.timeConsumedMillis || null,
//         memoryUsed: submission.memoryConsumedBytes || null,
//         passedTestCount: submission.passedTestCount || 0,
//         testset: submission.testset || '',
//         relativeTimeSeconds: submission.relativeTimeSeconds || null,
//         tags: submission.problem.tags || [],
//         difficultyRating: submission.problem.rating || null,
//         difficulty: this.mapDifficulty(submission.problem.rating),
//         category: this.categorizeByTags(submission.problem.tags || []),
//         points: submission.problem.points || null,
//         problemType: submission.problem.type || 'PROGRAMMING',
//         isFirstAccepted: false, // Will be calculated during processing
//         attemptNumber: 1 // Will be calculated during processing
//       }));
//     } catch (error) {
//       this.handleError(error, 'fetch submissions');
//     }
//   }

//   /**
//    * Get rating history for a user
//    */
//   async getRatingHistory(handle) {
//     try {
//       const ratingChanges = await this.makeRequest('/user.rating', { handle });

//       return ratingChanges.map(change => ({
//         contestIdOnPlatform: change.contestId.toString(),
//         contestName: change.contestName,
//         handle: change.handle,
//         rank: change.rank,
//         oldRating: change.oldRating,
//         newRating: change.newRating,
//         ratingChange: change.newRating - change.oldRating,
//         problemsSolved: 0, // Default value, not provided by CF API
//         penalty: 0, // Default value, not provided by CF API
//         maxRating: null, // Will be calculated during processing
//         newMaxRating: null, // Will be calculated during processing
//         rankTitle: this.getRankTitle(change.newRating),
//         contestTimestamp: new Date(change.ratingUpdateTimeSeconds * 1000)
//       }));
//     } catch (error) {
//       this.handleError(error, 'fetch rating history');
//     }
//   }

//   /**
//    * Get problem information
//    */
//   async getProblemInfo(problemId) {
//     try {
//       // Extract contest ID and problem index from problemId (e.g., "1234A" -> contestId: 1234, index: "A")
//       const match = problemId.match(/^(\d+)([A-Z]+\d*)$/);
//       if (!match) {
//         throw new Error('Invalid problem ID format');
//       }

//       const [, contestId, index] = match;
//       const problems = await this.makeRequest('/problemset.problems');
      
//       const problem = problems.problems.find(p => 
//         p.contestId.toString() === contestId && p.index === index
//       );

//       if (!problem) {
//         throw new Error('Problem not found');
//       }

//       return {
//         problemIdOnPlatform: problemId,
//         title: problem.name,
//         url: `https://codeforces.com/problem/${contestId}/${index}`,
//         tags: problem.tags || [],
//         difficultyRating: problem.rating || null,
//         difficulty: this.mapDifficulty(problem.rating),
//         category: this.categorizeByTags(problem.tags || []),
//         contestId: contestId,
//         type: problem.type || 'PROGRAMMING',
//         points: problem.points || null
//       };
//     } catch (error) {
//       this.handleError(error, 'fetch problem info');
//     }
//   }

//   /**
//    * Validate if a handle exists
//    */
//   async validateHandle(handle) {
//     try {
//       await this.getUserInfo(handle);
//       return true;
//     } catch (error) {
//       return false;
//     }
//   }

//   /**
//    * Map Codeforces verdict to standard format
//    */
//   mapVerdict(verdict) {
//     const verdictMap = {
//       'OK': 'Accepted',
//       'WRONG_ANSWER': 'Wrong Answer',
//       'TIME_LIMIT_EXCEEDED': 'Time Limit Exceeded',
//       'MEMORY_LIMIT_EXCEEDED': 'Memory Limit Exceeded',
//       'RUNTIME_ERROR': 'Runtime Error',
//       'COMPILATION_ERROR': 'Compilation Error',
//       'PRESENTATION_ERROR': 'Presentation Error',
//       'PARTIAL': 'Partial',
//       'SKIPPED': 'Skipped',
//       'CHALLENGED': 'Challenged',
//       'FAILED': 'Failed',
//       'REJECTED': 'Rejected'
//     };
//     return verdictMap[verdict] || verdict;
//   }

//   /**
//    * Map problem rating to difficulty
//    */
//   mapDifficulty(rating) {
//     if (!rating) return 'Medium';
//     if (rating < 1200) return 'Easy';
//     if (rating < 1600) return 'Medium';
//     if (rating < 2400) return 'Hard';
//     return 'Expert';
//   }

//   /**
//    * Get rank title based on rating
//    */
//   getRankTitle(rating) {
//     if (rating >= 3000) return 'legendary grandmaster';
//     if (rating >= 2600) return 'international grandmaster';
//     if (rating >= 2400) return 'grandmaster';
//     if (rating >= 2300) return 'international master';
//     if (rating >= 2100) return 'master';
//     if (rating >= 1900) return 'candidate master';
//     if (rating >= 1600) return 'expert';
//     if (rating >= 1400) return 'specialist';
//     if (rating >= 1200) return 'pupil';
//     return 'newbie';
//   }

//   /**
//    * Categorize problem based on tags
//    */
//   categorizeByTags(tags) {
//     const cpTags = [
//       'constructive algorithms',
//       'games',
//       'interactive',
//       'math',
//       'number theory',
//       'combinatorics',
//       'geometry',
//       'probabilities'
//     ];
    
//     const fundamentalTags = [
//       'implementation',
//       'brute force',
//       'strings',
//       'sortings',
//       'greedy'
//     ];
    
//     const dsaTags = [
//       'data structures',
//       'trees',
//       'graphs',
//       'shortest paths',
//       'dfs and similar',
//       'bfs',
//       'dp',
//       'divide and conquer',
//       'binary search',
//       'two pointers'
//     ];
    
//     // Priority: CP > DSA > Fundamentals
//     if (tags.some(tag => cpTags.includes(tag))) return 'CP';
//     if (tags.some(tag => dsaTags.includes(tag))) return 'DSA';
//     if (tags.some(tag => fundamentalTags.includes(tag))) return 'Fundamentals';
    
//     // Default categorization based on rating if no tags match
//     return 'DSA';
//   }

//   /**
//    * Get rate limit configuration
//    */
//   getRateLimit() {
//     return this.rateLimit;
//   }
// }

// export default CodeforcesService;
