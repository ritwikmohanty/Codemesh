// import BasePlatformService from './BasePlatformService.js';
// import axios from 'axios';

// class LeetcodeService extends BasePlatformService {
//   constructor() {
//     super('leetcode');
//     this.baseURL = 'https://leetcode.com/graphql';
//     this.rateLimit = {
//       requestsPerSecond: 0.5, // More conservative for GraphQL
//       burstLimit: 3,
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
//    * Make GraphQL request with rate limiting and error handling
//    */
//   async makeRequest(query, variables = {}) {
//     await this.waitForRateLimit();
    
//     try {
//       const response = await axios.post(this.baseURL, {
//         query,
//         variables
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//           'Referer': 'https://leetcode.com'
//         },
//         timeout: 15000
//       });

//       if (response.data.errors) {
//         throw new Error(response.data.errors[0].message);
//       }

//       return response.data.data;
//     } catch (error) {
//       if (error.response?.status === 400) {
//         throw new Error('Invalid username or request parameters');
//       } else if (error.response?.status === 503) {
//         throw new Error('LeetCode API is temporarily unavailable');
//       }
//       throw error;
//     }
//   }

//   /**
//    * Get user information from LeetCode
//    */
//   async getUserInfo(handle) {
//     try {
//       // Use the comprehensive user profile query
//       const query = `
//         query getUserProfile($username: String!) {
//           allQuestionsCount {
//             difficulty
//             count
//           }
//           matchedUser(username: $username) {
//             username
//             profile {
//               realName
//               ranking
//               reputation
//               countryName
//               company
//               school
//               userAvatar
//               aboutMe
//             }
//             contributions {
//               points
//             }
//             submitStats {
//               acSubmissionNum {
//                 difficulty
//                 count
//                 submissions
//               }
//               totalSubmissionNum {
//                 difficulty
//                 count
//                 submissions
//               }
//             }
//           }
//           userContestRanking(username: $username) {
//             attendedContestsCount
//             rating
//             globalRanking
//             totalParticipants
//             topPercentage
//             badge {
//               name
//             }
//           }
//         }
//       `;

//       const data = await this.makeRequest(query, { username: handle });
//       const user = data.matchedUser;
//       const contestRanking = data.userContestRanking;

//       if (!user) {
//         throw new Error('User not found');
//       }

//       // Calculate total solved problems
//       const totalSolved = user.submitStats?.acSubmissionNum?.reduce((sum, item) => sum + item.count, 0) || 0;

//       return {
//         handle: user.username,
//         rating: contestRanking?.rating || 0,
//         maxRating: contestRanking?.rating || 0, // LeetCode doesn't track max rating separately
//         rank: this.getRankFromRating(contestRanking?.rating || 0),
//         avatar: user.profile?.userAvatar || null,
//         realName: user.profile?.realName || '',
//         country: user.profile?.countryName || '',
//         company: user.profile?.company || '',
//         school: user.profile?.school || '',
//         globalRanking: contestRanking?.globalRanking || null,
//         totalParticipants: contestRanking?.totalParticipants || null,
//         attendedContests: contestRanking?.attendedContestsCount || 0,
//         reputation: user.profile?.reputation || 0,
//         totalSolved,
//         contributions: user.contributions?.points || 0
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
//       // Get recent submissions with pagination support
//       const query = `
//         query getRecentSubmissions($username: String!, $limit: Int) {
//           recentSubmissionList(username: $username, limit: $limit) {
//             title
//             titleSlug
//             timestamp
//             statusDisplay
//             lang
//           }
//         }
//       `;

//       const data = await this.makeRequest(query, { 
//         username: handle, 
//         limit: options.limit || 2000  // Increased limit for more submissions
//       });

//       if (!data.recentSubmissionList) {
//         return [];
//       }

//       // Get additional user statistics
//       const statsQuery = `
//         query getUserStats($username: String!) {
//           matchedUser(username: $username) {
//             submitStats {
//               acSubmissionNum {
//                 difficulty
//                 count
//                 submissions
//               }
//               totalSubmissionNum {
//                 difficulty
//                 count
//                 submissions
//               }
//             }
//           }
//         }
//       `;

//       const statsData = await this.makeRequest(statsQuery, { username: handle });

//       return data.recentSubmissionList.map((submission, index) => ({
//         submissionIdOnPlatform: `${handle}-${submission.timestamp}-${index}`,
//         problemIdOnPlatform: submission.titleSlug,
//         problemName: submission.title,
//         contestId: null, // LeetCode doesn't have contest IDs for regular problems
//         verdict: this.mapVerdict(submission.statusDisplay),
//         language: submission.lang,
//         timestamp: new Date(parseInt(submission.timestamp) * 1000),
//         timeSpent: null, // Not provided by LeetCode API
//         memoryUsed: null, // Not provided by LeetCode API
//         passedTestCount: null,
//         tags: [], // Will be filled when we get problem details
//         difficultyRating: null, // LeetCode uses string difficulties, not numeric ratings
//         difficulty: this.mapLeetCodeDifficulty(submission.titleSlug), // Will need to be fetched separately
//         category: 'DSA', // Default for LeetCode
//         points: null,
//         problemType: 'PROGRAMMING',
//         isFirstAccepted: false,
//         attemptNumber: 1
//       }));
//     } catch (error) {
//       this.handleError(error, 'fetch submissions');
//     }
//   }

//   /**
//    * Get rating history for a user (contest history)
//    */
//   async getRatingHistory(handle) {
//     try {
//       const query = `
//         query userContestRankingInfo($username: String!) {
//           userContestRankingHistory(username: $username) {
//             attended
//             trendDirection
//             problemsSolved
//             totalProblems
//             finishTimeInSeconds
//             rating
//             ranking
//             contest {
//               title
//               startTime
//             }
//           }
//         }
//       `;

//       const data = await this.makeRequest(query, { username: handle });
      
//       if (!data.userContestRankingHistory) {
//         return [];
//       }

//       return data.userContestRankingHistory
//         .filter(contest => contest.attended)
//         .map(contest => ({
//           contestIdOnPlatform: contest.contest.title.toLowerCase().replace(/\s+/g, '-'),
//           contestName: contest.contest.title,
//           handle: handle,
//           rank: contest.ranking,
//           oldRating: 0, // Previous rating not directly available
//           newRating: contest.rating,
//           ratingChange: 0, // Will need to be calculated
//           problemsSolved: contest.problemsSolved,
//           penalty: contest.finishTimeInSeconds || 0,
//           maxRating: null,
//           newMaxRating: null,
//           rankTitle: this.getRankFromRating(contest.rating),
//           contestTimestamp: new Date(contest.contest.startTime * 1000)
//         }));
//     } catch (error) {
//       this.handleError(error, 'fetch rating history');
//     }
//   }

//   /**
//    * Get problem information
//    */
//   async getProblemInfo(problemId) {
//     try {
//       const query = `
//         query selectProblem($titleSlug: String!) {
//           question(titleSlug: $titleSlug) {
//             questionId
//             questionFrontendId
//             title
//             titleSlug
//             difficulty
//             isPaidOnly
//             topicTags {
//               name
//               slug
//             }
//             likes
//             dislikes
//             stats
//           }
//         }
//       `;

//       const data = await this.makeRequest(query, { titleSlug: problemId });
//       const problem = data.question;

//       if (!problem) {
//         throw new Error('Problem not found');
//       }

//       return {
//         problemIdOnPlatform: problem.titleSlug,
//         title: problem.title,
//         url: `https://leetcode.com/problems/${problem.titleSlug}/`,
//         tags: problem.topicTags?.map(tag => tag.name) || [],
//         difficultyRating: null, // LeetCode doesn't use numeric ratings
//         difficulty: problem.difficulty, // Keep as EASY/MEDIUM/HARD
//         category: this.categorizeByTags(problem.topicTags?.map(tag => tag.name) || []),
//         contestId: null,
//         type: 'PROGRAMMING',
//         points: null,
//         questionId: problem.questionId,
//         questionFrontendId: problem.questionFrontendId,
//         isPaidOnly: problem.isPaidOnly,
//         likes: problem.likes,
//         dislikes: problem.dislikes
//       };
//     } catch (error) {
//       this.handleError(error, 'fetch problem info');
//     }
//   }

//   /**
//    * Get user calendar and streak information
//    */
//   async getUserCalendar(handle, year = new Date().getFullYear()) {
//     try {
//       const query = `
//         query UserProfileCalendar($username: String!, $year: Int!) {
//           matchedUser(username: $username) {
//             userCalendar(year: $year) {
//               activeYears
//               streak
//               totalActiveDays
//               dccBadges {
//                 timestamp
//                 badge {
//                   name
//                   icon
//                 }
//               }
//               submissionCalendar
//             }
//           }
//         }
//       `;

//       const data = await this.makeRequest(query, { username: handle, year });
//       return data.matchedUser?.userCalendar || null;
//     } catch (error) {
//       this.handleError(error, 'fetch user calendar');
//     }
//   }

//   /**
//    * Get user skill statistics by tags
//    */
//   async getUserSkillStats(handle) {
//     try {
//       const query = `
//         query skillStats($username: String!) {
//           matchedUser(username: $username) {
//             tagProblemCounts {
//               advanced {
//                 tagName
//                 tagSlug
//                 problemsSolved
//               }
//               intermediate {
//                 tagName
//                 tagSlug
//                 problemsSolved
//               }
//               fundamental {
//                 tagName
//                 tagSlug
//                 problemsSolved
//               }
//             }
//           }
//         }
//       `;

//       const data = await this.makeRequest(query, { username: handle });
//       return data.matchedUser?.tagProblemCounts || null;
//     } catch (error) {
//       this.handleError(error, 'fetch skill stats');
//     }
//   }

//   /**
//    * Get user language statistics
//    */
//   async getUserLanguageStats(handle) {
//     try {
//       const query = `
//         query languageStats($username: String!) {
//           matchedUser(username: $username) {
//             languageProblemCount {
//               languageName
//               problemsSolved
//             }
//           }
//         }
//       `;

//       const data = await this.makeRequest(query, { username: handle });
//       return data.matchedUser?.languageProblemCount || [];
//     } catch (error) {
//       this.handleError(error, 'fetch language stats');
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
//    * Map LeetCode status to standard format
//    */
//   mapVerdict(status) {
//     const verdictMap = {
//       'Accepted': 'Accepted',
//       'Wrong Answer': 'Wrong Answer',
//       'Time Limit Exceeded': 'Time Limit Exceeded',
//       'Memory Limit Exceeded': 'Memory Limit Exceeded',
//       'Runtime Error': 'Runtime Error',
//       'Compile Error': 'Compilation Error',
//       'Output Limit Exceeded': 'Presentation Error',
//       'Compilation Error': 'Compilation Error',
//       'Runtime Error (NZEC)': 'Runtime Error',
//       'TLE': 'Time Limit Exceeded',
//       'MLE': 'Memory Limit Exceeded',
//       'WA': 'Wrong Answer',
//       'AC': 'Accepted'
//     };
//     return verdictMap[status] || status;
//   }

//   /**
//    * Map LeetCode difficulty strings to our format
//    */
//   mapLeetCodeDifficulty(titleSlug) {
//     // This would need a separate API call to get problem details
//     // For now, return default - will be updated when problem info is fetched
//     return 'Medium';
//   }

//   /**
//    * Get rank from rating
//    */
//   getRankFromRating(rating) {
//     if (rating >= 2200) return 'Guardian';
//     if (rating >= 2000) return 'Knight';
//     if (rating >= 1800) return 'Expert';
//     if (rating >= 1600) return 'Specialist';
//     return 'Newbie';
//   }

//   /**
//    * Categorize problem based on tags
//    */
//   categorizeByTags(tags) {
//     const cpTags = [
//       'Math',
//       'Number Theory',
//       'Combinatorics',
//       'Geometry',
//       'Game Theory',
//       'Interactive'
//     ];
    
//     const fundamentalTags = [
//       'Array',
//       'String',
//       'Hash Table',
//       'Sorting',
//       'Greedy',
//       'Simulation'
//     ];
    
//     const dsaTags = [
//       'Linked List',
//       'Stack',
//       'Queue',
//       'Tree',
//       'Binary Tree',
//       'Binary Search Tree',
//       'Heap',
//       'Graph',
//       'Dynamic Programming',
//       'Backtracking',
//       'Divide and Conquer',
//       'Binary Search',
//       'Two Pointers',
//       'Sliding Window',
//       'Depth-First Search',
//       'Breadth-First Search'
//     ];
    
//     // Priority: CP > DSA > Fundamentals
//     if (tags.some(tag => cpTags.includes(tag))) return 'CP';
//     if (tags.some(tag => dsaTags.includes(tag))) return 'DSA';
//     if (tags.some(tag => fundamentalTags.includes(tag))) return 'Fundamentals';
    
//     return 'DSA';
//   }

//   /**
//    * Get rate limit configuration
//    */
//   getRateLimit() {
//     return this.rateLimit;
//   }
// }

// export default LeetcodeService;
