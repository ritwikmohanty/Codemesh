import Battle from '../../models/Battle.js';
import BattleSubmission from '../../models/BattleSubmission.js';
import User from '../../models/User.js';
import PlatformData from '../../models/PlatformData.js';
import CodeforcesService from '../platform/CodeforcesServiceV2.js';
import LeetCodeBattleService from './LeetCodeBattleService.js';
import { nanoid } from 'nanoid';

const codeforcesService = new CodeforcesService();
const leetcodeBattleService = new LeetCodeBattleService();

/**
 * Battle Service
 * Handles all battle-related business logic
 * Supports both Codeforces and LeetCode platforms
 */
class BattleService {
  constructor() {
    this.problemCache = null;
    this.problemCacheTime = null;
    this.PROBLEM_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Create a new battle
   * @param {Object} user - The user creating the battle
   * @param {Object} details - Battle creation details
   * @returns {Promise<Object>} Created battle
   */
  async createBattle(user, details) {
    const { 
      title, 
      startTime, 
      durationMinutes, 
      minRating, 
      maxRating, 
      numProblems,
      platforms = ['codeforces'],
      leetcodeDifficulty = ['Easy', 'Medium']
    } = details;

    // Validate start time is in the future
    const startTimeDate = new Date(startTime);
    if (startTimeDate.getTime() < Date.now() + 30 * 1000) {
      throw new Error('Start time must be at least 30 seconds in the future');
    }

    // Validate duration
    if (durationMinutes < 10 || durationMinutes > 300) {
      throw new Error('Duration must be between 10 and 300 minutes');
    }

    // Validate platforms
    if (!platforms || platforms.length === 0) {
      throw new Error('At least one platform must be selected');
    }

    // Validate Codeforces-specific settings
    if (platforms.includes('codeforces')) {
      if (minRating > maxRating) {
        throw new Error('Minimum rating cannot be greater than maximum rating');
      }

      if (minRating < 800 || maxRating > 3500) {
        throw new Error('Rating must be between 800 and 3500');
      }
    }

    // Validate LeetCode-specific settings
    if (platforms.includes('leetcode')) {
      if (!leetcodeDifficulty || leetcodeDifficulty.length === 0) {
        throw new Error('At least one LeetCode difficulty must be selected');
      }
    }

    // Validate problem count
    if (numProblems < 1 || numProblems > 10) {
      throw new Error('Number of problems must be between 1 and 10');
    }

    // Get user's verified platform handles
    const codeforcesHandle = platforms.includes('codeforces') 
      ? await this.getUserCodeforcesHandle(user) 
      : null;
    const leetcodeHandle = platforms.includes('leetcode')
      ? await this.getUserLeetCodeHandle(user)
      : null;

    // Validate required platforms
    if (platforms.includes('codeforces') && !codeforcesHandle) {
      throw new Error('You must link and verify your Codeforces account before creating a battle with Codeforces');
    }
    
    if (platforms.includes('leetcode') && !leetcodeHandle) {
      throw new Error('You must link and verify your LeetCode account before creating a battle with LeetCode');
    }

    // Check LeetCode sync status if LeetCode is selected
    if (platforms.includes('leetcode')) {
      const hasSynced = await leetcodeBattleService.hasUserSyncedSubmissions(leetcodeHandle);
      if (!hasSynced) {
        throw new Error('You must sync your LeetCode submissions using the CP Focus extension before creating a battle with LeetCode');
      }
    }

    // Calculate problems per platform
    const problemsPerPlatform = {};
    const platformCount = platforms.length;
    const baseCount = Math.floor(numProblems / platformCount);
    let remainder = numProblems % platformCount;
    
    for (const platform of platforms) {
      problemsPerPlatform[platform] = baseCount + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }

    // Generate unique join token
    const joinToken = nanoid(12);

    // Create battle
    const battle = new Battle({
      title: title.trim(),
      createdBy: user._id,
      startTime: startTimeDate,
      durationMinutes,
      platforms,
      minRating: minRating || 800,
      maxRating: maxRating || 1400,
      leetcodeDifficulty,
      numProblems,
      problemsPerPlatform,
      joinToken,
      participants: [{
        user: user._id,
        codeforcesHandle,
        leetcodeHandle,
        joinedAt: new Date()
      }]
    });

    await battle.save();

    return battle;
  }

  /**
   * Join a battle using join token
   * @param {string} joinToken - The battle join token
   * @param {Object} user - The user joining
   * @returns {Promise<Object>} The battle
   */
  async joinBattle(joinToken, user) {
    const battle = await Battle.findOne({ joinToken });

    if (!battle) {
      throw new Error('Battle not found or join token is invalid');
    }

    if (battle.status !== 'pending') {
      // If already a participant, allow them to view the battle even if started
      if (battle.isParticipant(user._id)) {
        return { battle, alreadyJoined: true, platforms: battle.platforms };
      }
      throw new Error('You can only join battles that have not started yet');
    }

    // Check if user is already a participant
    if (battle.isParticipant(user._id)) {
      return { battle, alreadyJoined: true, platforms: battle.platforms };
    }

    const platforms = battle.platforms || ['codeforces'];

    // Get user's verified platform handles based on battle platforms
    const codeforcesHandle = platforms.includes('codeforces') 
      ? await this.getUserCodeforcesHandle(user)
      : null;
    const leetcodeHandle = platforms.includes('leetcode')
      ? await this.getUserLeetCodeHandle(user)
      : null;

    // Validate required platforms
    if (platforms.includes('codeforces') && !codeforcesHandle) {
      throw new Error('You must link and verify your Codeforces account before joining this battle');
    }

    if (platforms.includes('leetcode') && !leetcodeHandle) {
      throw new Error('You must link and verify your LeetCode account before joining this battle');
    }

    // Check LeetCode sync status if LeetCode is selected
    if (platforms.includes('leetcode')) {
      const hasSynced = await leetcodeBattleService.hasUserSyncedSubmissions(leetcodeHandle);
      if (!hasSynced) {
        throw new Error('You must sync your LeetCode submissions using the CP Focus extension before joining this battle. Please ensure you have at least one submission synced.');
      }
    }

    // Add user as participant
    battle.participants.push({
      user: user._id,
      codeforcesHandle,
      leetcodeHandle,
      joinedAt: new Date()
    });

    await battle.save();

    return { battle, alreadyJoined: false, platforms };
  }

  /**
   * Get user's Codeforces handle from PlatformData (verified platforms only)
   * @param {Object} user - The user object
   * @returns {Promise<string|null>} Codeforces handle or null
   */
  async getUserCodeforcesHandle(user) {
    try {
      const platformData = await PlatformData.findOne({
        user: user._id,
        platform: 'codeforces',
        isActive: true,
        isVerified: true
      }).select('handle').lean();

      return platformData?.handle || null;
    } catch (error) {
      console.error('Error fetching Codeforces handle:', error);
      return null;
    }
  }

  /**
   * Get user's LeetCode handle from PlatformData (verified platforms only)
   * @param {Object} user - The user object
   * @returns {Promise<string|null>} LeetCode handle or null
   */
  async getUserLeetCodeHandle(user) {
    try {
      const platformData = await PlatformData.findOne({
        user: user._id,
        platform: 'leetcode',
        isActive: true,
        isVerified: true
      }).select('handle').lean();

      return platformData?.handle || null;
    } catch (error) {
      console.error('Error fetching LeetCode handle:', error);
      return null;
    }
  }

  /**
   * Check if user has synced LeetCode submissions via CP Extension
   * @param {Object} user - The user object
   * @returns {Promise<boolean>} True if user has synced submissions
   */
  async checkUserLeetCodeSync(user) {
    const leetcodeHandle = await this.getUserLeetCodeHandle(user);
    if (!leetcodeHandle) {
      return false;
    }
    return leetcodeBattleService.hasUserSyncedSubmissions(leetcodeHandle);
  }

  /**
   * Get all battles for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} User's battles
   */
  async getUserBattles(userId) {
    const battles = await Battle.find({
      'participants.user': userId
    })
      .populate('createdBy', 'username name avatarUrl')
      .populate('participants.user', 'username name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    return battles;
  }

  /**
   * Get battle by ID with access check
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID
   * @returns {Promise<Object>} The battle
   */
  async getBattle(battleId, userId) {
    const battle = await Battle.findById(battleId)
      .populate('createdBy', 'username name avatarUrl')
      .populate('participants.user', 'username name avatarUrl')
      .lean();

    if (!battle) {
      throw new Error('Battle not found');
    }

    // Check if user has access
    const isParticipant = battle.participants.some(
      p => p.user._id.toString() === userId.toString()
    );
    const isCreator = battle.createdBy._id.toString() === userId.toString();

    if (!isParticipant && !isCreator) {
      throw new Error('You do not have access to this battle');
    }

    return battle;
  }

  /**
   * Get battle participants
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID
   * @returns {Promise<Array>} Participants
   */
  async getBattleParticipants(battleId, userId) {
    const battle = await this.getBattle(battleId, userId);
    return battle.participants;
  }

  /**
   * Get battle problems (only after battle has started)
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID
   * @returns {Promise<Array>} Problems
   */
  async getBattleProblems(battleId, userId) {
    const battle = await this.getBattle(battleId, userId);

    if (battle.status === 'pending') {
      throw new Error('Problems are only available after the battle starts');
    }

    return battle.problems;
  }

  /**
   * Start a battle - selects problems and changes status
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID (must be creator)
   * @returns {Promise<Object>} Updated battle
   */
  async startBattle(battleId, userId) {
    const battle = await Battle.findById(battleId);

    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.createdBy.toString() !== userId.toString()) {
      throw new Error('Only the battle creator can start the battle');
    }

    if (battle.status !== 'pending') {
      throw new Error('Battle has already started or completed');
    }

    const platforms = battle.platforms || ['codeforces'];
    let allProblems = [];

    // Choose problems from each platform
    if (platforms.includes('codeforces')) {
      const cfHandles = battle.participants
        .map(p => p.codeforcesHandle)
        .filter(h => h);
      
      const cfProblems = await this.chooseCodeforcesProblems(
        battle.minRating,
        battle.maxRating,
        battle.problemsPerPlatform?.codeforces || Math.ceil(battle.numProblems / platforms.length),
        cfHandles
      );
      allProblems = allProblems.concat(cfProblems);
    }

    if (platforms.includes('leetcode')) {
      const lcHandles = battle.participants
        .map(p => p.leetcodeHandle)
        .filter(h => h);
      
      const lcProblems = await leetcodeBattleService.chooseProblems(
        battle.leetcodeDifficulty || ['Easy', 'Medium'],
        battle.problemsPerPlatform?.leetcode || Math.floor(battle.numProblems / platforms.length),
        lcHandles
      );
      allProblems = allProblems.concat(lcProblems);
    }

    // Update battle with problems and start
    battle.problems = allProblems.map(p => {
      if (p.platform === 'leetcode') {
        return {
          platform: 'leetcode',
          titleSlug: p.titleSlug,
          title: p.title,
          name: p.name || p.title,
          difficulty: p.difficulty,
          frontendId: p.frontendId,
          addedAt: new Date()
        };
      } else {
        return {
          platform: 'codeforces',
          contestId: p.contestId,
          index: p.index,
          name: p.name,
          rating: p.rating,
          addedAt: new Date()
        };
      }
    });
    battle.status = 'in_progress';
    battle.startTime = new Date(); // Update start time to now

    await battle.save();

    return battle;
  }

  /**
   * End a battle
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID (must be creator)
   * @returns {Promise<Object>} Updated battle
   */
  async endBattle(battleId, userId) {
    const battle = await Battle.findById(battleId);

    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.createdBy.toString() !== userId.toString()) {
      throw new Error('Only the battle creator can end the battle');
    }

    if (battle.status !== 'in_progress') {
      throw new Error('Battle must be in progress to end it');
    }

    battle.status = 'completed';
    battle.endedAt = new Date();

    await battle.save();

    return battle;
  }

  /**
   * Cancel a battle
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID (must be creator)
   * @returns {Promise<Object>} Result
   */
  async cancelBattle(battleId, userId) {
    const battle = await Battle.findById(battleId);

    if (!battle) {
      throw new Error('Battle not found');
    }

    if (battle.createdBy.toString() !== userId.toString()) {
      throw new Error('Only the battle creator can cancel the battle');
    }

    if (battle.status === 'completed') {
      throw new Error('Cannot cancel a completed battle');
    }

    battle.status = 'cancelled';
    await battle.save();

    return { success: true, message: 'Battle cancelled successfully' };
  }

  /**
   * Get battle standings
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID
   * @returns {Promise<Object>} Standings with problem stats
   */
  async getBattleStandings(battleId, userId) {
    const battle = await this.getBattle(battleId, userId);

    if (battle.status === 'pending') {
      throw new Error('Standings are only available after the battle starts');
    }

    const submissions = await BattleSubmission.find({ battle: battleId }).lean();

    const standings = [];
    
    // Track solve counts per problem
    const problemSolveCount = {};
    
    // Initialize problem solve counts
    for (const problem of battle.problems) {
      const isLeetCode = problem.platform === 'leetcode';
      const problemKey = isLeetCode 
        ? problem.titleSlug 
        : `${problem.contestId}${problem.index}`;
      problemSolveCount[problemKey] = 0;
    }

    for (const participant of battle.participants) {
      const participantUserId = participant.user._id ? participant.user._id.toString() : participant.user.toString();
      
      const userSubmissions = submissions.filter(
        s => s.user.toString() === participantUserId
      );



      let solved = 0;
      let penalty = 0;
      const problemData = {};

      for (const problem of battle.problems) {
        const isLeetCode = problem.platform === 'leetcode';
        const problemKey = isLeetCode 
          ? problem.titleSlug 
          : `${problem.contestId}${problem.index}`;

        // Filter submissions for this problem
        const problemSubmissions = userSubmissions.filter(s => {
          if (isLeetCode) {
            return s.titleSlug === problem.titleSlug;
          } else {
            return s.contestId === problem.contestId && s.problemIndex === problem.index;
          }
        });



        // Sort by submission time
        const sortedSubmissions = problemSubmissions.sort(
          (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
        );

        // Check for accepted submission (different verdict for each platform)
        const correctSubmission = sortedSubmissions.find(s => 
          isLeetCode ? s.verdict === 'Accepted' : s.verdict === 'OK'
        );

        if (correctSubmission) {
          // Count wrong submissions BEFORE the first correct one
          const wrongBeforeCorrect = sortedSubmissions.filter(s => {
            const subTime = new Date(s.submittedAt);
            const correctTime = new Date(correctSubmission.submittedAt);
            if (subTime >= correctTime) return false;
            
            if (isLeetCode) {
              return s.verdict !== 'Accepted';
            } else {
              // For Codeforces, count all non-OK verdicts as wrong attempts
              return s.verdict !== 'OK';
            }
          });

          solved++;
          problemSolveCount[problemKey]++;
          
          // ICPC style penalty: time from start (in minutes) + 20 minutes per wrong submission
          const solveTimeMs = new Date(correctSubmission.submittedAt) - new Date(battle.startTime);
          const solveTimeMinutes = Math.floor(solveTimeMs / 60000);
          const wrongPenalty = wrongBeforeCorrect.length * 20;
          penalty += solveTimeMinutes + wrongPenalty;



          problemData[problemKey] = {
            solved: true,
            wrongSubmissions: wrongBeforeCorrect.length,
            solveTimeMinutes: solveTimeMinutes,
            penalty: solveTimeMinutes + wrongPenalty
          };
        } else {
          // Count all wrong submissions (for display purposes)
          const wrongSubmissions = problemSubmissions.filter(s => {
            if (isLeetCode) {
              return s.verdict !== 'Accepted';
            }
            return s.verdict !== 'OK';
          });

          problemData[problemKey] = {
            solved: false,
            wrongSubmissions: wrongSubmissions.length,
            solveTimeMinutes: 0,
            penalty: 0
          };
        }
      }

      standings.push({
        odId: participant.user._id || participant.user,
        user: participant.user,
        codeforcesHandle: participant.codeforcesHandle,
        leetcodeHandle: participant.leetcodeHandle,
        solved,
        penalty,
        problemData
      });
    }

    // Sort by solved (descending), then by penalty (ascending) - ICPC style
    standings.sort((a, b) => {
      if (a.solved !== b.solved) {
        return b.solved - a.solved;
      }
      return a.penalty - b.penalty;
    });



    // Return standings along with problem solve counts
    return {
      standings,
      problemStats: problemSolveCount
    };
  }

  /**
   * Get battle submissions
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID
   * @returns {Promise<Array>} Submissions
   */
  async getBattleSubmissions(battleId, userId) {
    const battle = await this.getBattle(battleId, userId);

    if (battle.status === 'pending') {
      throw new Error('Submissions are only available after the battle starts');
    }

    const submissions = await BattleSubmission.find({ battle: battleId })
      .populate('user', 'username name avatarUrl')
      .sort({ submittedAt: 1 })
      .lean();

    return submissions;
  }

  /**
   * Refresh submissions for a battle (poll Codeforces API)
   * @param {string} battleId - The battle ID
   * @param {string} userId - The requesting user's ID
   * @returns {Promise<Object>} Result
   */
  async refreshSubmissions(battleId, userId) {
    const battle = await this.getBattle(battleId, userId);

    if (battle.status !== 'in_progress') {
      throw new Error('Can only refresh submissions for battles in progress');
    }

    await this.pollSubmissions(battle);

    return { success: true, message: 'Submissions refreshed successfully' };
  }

  /**
   * Poll submissions from all platforms for all participants
   * @param {Object} battle - The battle document
   */
  async pollSubmissions(battle) {
    console.log(`Polling submissions for battle ${battle._id}`);

    const platforms = battle.platforms || ['codeforces'];
    
    // Poll Codeforces submissions
    if (platforms.includes('codeforces')) {
      await this.pollCodeforcesSubmissions(battle);
    }
    
    // Poll LeetCode submissions
    if (platforms.includes('leetcode')) {
      await this.pollLeetCodeSubmissions(battle);
    }
  }

  /**
   * Poll Codeforces submissions for battle participants
   * @param {Object} battle - The battle document
   */
  async pollCodeforcesSubmissions(battle) {
    const startTime = new Date(battle.startTime);
    const endTime = new Date(startTime.getTime() + battle.durationMinutes * 60 * 1000);

    // Get existing CF submission IDs to avoid duplicates
    const existingSubmissions = await BattleSubmission.find({ 
      battle: battle._id,
      platform: 'codeforces'
    }).select('submissionId').lean();
    const existingIds = new Set(existingSubmissions.map(s => s.submissionId));

    // Get CF problems for this battle
    const cfProblems = battle.problems.filter(p => p.platform === 'codeforces' || !p.platform);

    for (const participant of battle.participants) {
      if (!participant.codeforcesHandle) continue;
      
      try {
        // Get user's recent submissions from Codeforces
        const cfSubmissions = await codeforcesService.getAllSubmissions(
          participant.codeforcesHandle,
          { from: 1, count: 100 }
        );

        // Filter submissions for this battle's problems and time range
        const relevantSubmissions = cfSubmissions.filter(sub => {
          const subTime = new Date(sub.creationTimeSeconds * 1000);
          
          // Check if submission is within battle time range
          if (subTime < startTime || subTime > endTime) {
            return false;
          }

          // Check if submission is for one of the battle problems
          const isForBattleProblem = cfProblems.some(
            p => p.contestId === sub.problem.contestId && p.index === sub.problem.index
          );

          if (!isForBattleProblem) {
            return false;
          }

          // Check if we already have this submission
          if (existingIds.has(`cf_${sub.id}`)) {
            return false;
          }

          // Skip submissions still being tested
          if (!sub.verdict || sub.verdict === 'TESTING') {
            return false;
          }

          return true;
        });

        if (relevantSubmissions.length === 0) {
          continue;
        }

        // Get the user ID - handle both populated and non-populated cases
        const userId = participant.user._id ? participant.user._id : participant.user;

        // Create submission documents
        const newSubmissions = relevantSubmissions.map(sub => ({
          battle: battle._id,
          user: userId,
          platform: 'codeforces',
          submissionId: `cf_${sub.id}`,
          cfSubmissionId: sub.id.toString(),
          contestId: sub.problem.contestId,
          problemIndex: sub.problem.index,
          verdict: sub.verdict,
          passedTestCount: sub.passedTestCount || 0,
          programmingLanguage: sub.programmingLanguage || '',
          submittedAt: new Date(sub.creationTimeSeconds * 1000),
          rawData: sub
        }));

        console.log(`[Poll CF] Creating ${newSubmissions.length} submissions for user ${userId}, handle: ${participant.codeforcesHandle}`);

        if (newSubmissions.length > 0) {
          await BattleSubmission.insertMany(newSubmissions, { ordered: false }).catch(err => {
            // Ignore duplicate key errors
            if (err.code !== 11000) throw err;
          });
          console.log(`Inserted ${newSubmissions.length} CF submissions for ${participant.codeforcesHandle}`);
        }

      } catch (error) {
        console.error(`Error polling CF submissions for ${participant.codeforcesHandle}:`, error.message);
      }
    }
  }

  /**
   * Poll LeetCode submissions for battle participants
   * Uses the recentSubmissionList GraphQL query for recent 20 submissions
   * @param {Object} battle - The battle document
   */
  async pollLeetCodeSubmissions(battle) {
    const startTime = new Date(battle.startTime);
    const endTime = new Date(startTime.getTime() + battle.durationMinutes * 60 * 1000);

    // Get LC problems for this battle
    const lcProblems = battle.problems.filter(p => p.platform === 'leetcode');
    const lcProblemSlugs = new Set(lcProblems.map(p => p.titleSlug));



    for (const participant of battle.participants) {
      const leetcodeHandle = participant.leetcodeHandle;
      
      // Skip if no leetcode handle
      if (!leetcodeHandle) {
        continue;
      }
      
      // Get the user ID - handle both populated and non-populated cases
      const userId = participant.user._id ? participant.user._id : participant.user;
      
      try {
        // Get user's recent submissions from LeetCode (last 20)
        const lcSubmissions = await leetcodeBattleService.getRecentSubmissions(
          leetcodeHandle,
          20
        );



        // Filter submissions for this battle's problems and time range
        const relevantSubmissions = [];
        
        for (const sub of lcSubmissions) {
          // Skip submissions with error status from LeetCode API
          if (sub.statusDisplay === 'Internal Error' || !sub.statusDisplay) {
            continue;
          }
          
          const subTime = new Date(parseInt(sub.timestamp) * 1000);
          
          // Check if submission is within battle time range
          if (subTime < startTime || subTime > endTime) {
            continue;
          }

          // Check if submission is for one of the battle problems
          if (!lcProblemSlugs.has(sub.titleSlug)) {
            continue;
          }

          // Create unique ID: lc_{handle}_{titleSlug}_{timestamp}
          // This format ensures uniqueness per user per problem per submission time
          const submissionId = `lc_${leetcodeHandle}_${sub.titleSlug}_${sub.timestamp}`;

          relevantSubmissions.push({
            ...sub,
            _generatedSubmissionId: submissionId
          });
        }

        if (relevantSubmissions.length === 0) {
          continue;
        }



        // Use bulkWrite with upsert to handle both new insertions and updates
        const bulkOps = relevantSubmissions.map(sub => ({
          updateOne: {
            filter: { 
              battle: battle._id, 
              submissionId: sub._generatedSubmissionId 
            },
            update: {
              $set: {
                user: userId,
                platform: 'leetcode',
                submissionId: sub._generatedSubmissionId,
                titleSlug: sub.titleSlug,
                verdict: sub.statusDisplay,
                programmingLanguage: sub.lang || '',
                submittedAt: new Date(parseInt(sub.timestamp) * 1000),
                rawData: {
                  title: sub.title,
                  titleSlug: sub.titleSlug,
                  timestamp: sub.timestamp,
                  statusDisplay: sub.statusDisplay,
                  lang: sub.lang
                }
              },
              $setOnInsert: {
                battle: battle._id,
                createdAt: new Date()
              }
            },
            upsert: true
          }
        }));

        try {
          await BattleSubmission.bulkWrite(bulkOps, { ordered: false });
        } catch (err) {
          console.error(`[Poll LC] BulkWrite error for ${leetcodeHandle}:`, err.message);
        }

      } catch (error) {
        console.error(`[Poll LC] Error polling submissions for ${leetcodeHandle}:`, error.message);
      }
    }
  }

  /**
   * Choose random Codeforces problems that haven't been solved by participants
   * @param {number} minRating - Minimum problem rating
   * @param {number} maxRating - Maximum problem rating
   * @param {number} count - Number of problems to select
   * @param {Array<string>} handles - Participant Codeforces handles
   * @returns {Promise<Array>} Selected problems
   */
  async chooseCodeforcesProblems(minRating, maxRating, count, handles) {
    // Get all problems from Codeforces
    const allProblems = await this.getProblemsWithCache();

    // Get solved problems for all participants
    const solvedSet = new Set();

    for (const handle of handles) {
      try {
        const submissions = await codeforcesService.getAllSubmissions(handle, { count: 1000 });
        
        for (const sub of submissions) {
          if (sub.verdict === 'OK') {
            solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
          }
        }
      } catch (error) {
        console.warn(`Could not fetch submissions for ${handle}:`, error.message);
      }
    }

    // Filter problems
    const eligibleProblems = allProblems.filter(p => {
      // Must have a rating in the specified range
      if (!p.rating || p.rating < minRating || p.rating > maxRating) {
        return false;
      }

      // Must be a programming problem (not interactive or special)
      if (p.type !== 'PROGRAMMING') {
        return false;
      }

      // Must not have special tag
      if (p.tags && p.tags.includes('*special')) {
        return false;
      }

      // Must not have been solved by any participant
      if (solvedSet.has(`${p.contestId}${p.index}`)) {
        return false;
      }

      return true;
    });

    if (eligibleProblems.length < count) {
      throw new Error(`Not enough eligible problems found. Found ${eligibleProblems.length}, need ${count}`);
    }

    // Shuffle and select, add platform field
    const shuffled = eligibleProblems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(p => ({
      platform: 'codeforces',
      contestId: p.contestId,
      index: p.index,
      name: p.name,
      rating: p.rating
    }));
  }

  /**
   * Get problems from Codeforces with caching
   * @returns {Promise<Array>} Problems array
   */
  async getProblemsWithCache() {
    const now = Date.now();

    // Return cached problems if still valid
    if (this.problemCache && this.problemCacheTime && 
        (now - this.problemCacheTime) < this.PROBLEM_CACHE_TTL) {
      return this.problemCache;
    }

    // Fetch fresh problems
    try {
      const response = await codeforcesService.makeRequest('/problemset.problems');
      this.problemCache = response.problems || [];
      this.problemCacheTime = now;
      return this.problemCache;
    } catch (error) {
      // If we have cached data, return it even if expired
      if (this.problemCache) {
        console.warn('Failed to refresh problem cache, using stale data:', error.message);
        return this.problemCache;
      }
      throw error;
    }
  }

  /**
   * Get pending battles that should have started (for scheduler)
   * @returns {Promise<Array>} Battles that should be started
   */
  async getPendingBattlesToStart() {
    const now = new Date();
    
    return Battle.find({
      status: 'pending',
      startTime: { $lte: now }
    });
  }

  /**
   * Get in-progress battles that should be ended (for scheduler)
   * @returns {Promise<Array>} Battles that should be ended
   */
  async getInProgressBattlesToEnd() {
    const now = new Date();

    const battles = await Battle.find({ status: 'in_progress' });

    return battles.filter(battle => {
      const endTime = new Date(battle.startTime.getTime() + battle.durationMinutes * 60 * 1000);
      return now >= endTime;
    });
  }

  /**
   * Auto-start a battle (called by scheduler)
   * @param {Object} battle - The battle to start
   */
  async autoStartBattle(battle) {
    try {
      console.log(`Auto-starting battle ${battle._id}: ${battle.title}`);

      const platforms = battle.platforms || ['codeforces'];
      let allProblems = [];

      // Choose problems from each platform
      if (platforms.includes('codeforces')) {
        const cfHandles = battle.participants
          .map(p => p.codeforcesHandle)
          .filter(h => h);
        
        const cfProblems = await this.chooseCodeforcesProblems(
          battle.minRating,
          battle.maxRating,
          battle.problemsPerPlatform?.codeforces || Math.ceil(battle.numProblems / platforms.length),
          cfHandles
        );
        allProblems = allProblems.concat(cfProblems);
      }

      if (platforms.includes('leetcode')) {
        const lcHandles = battle.participants
          .map(p => p.leetcodeHandle)
          .filter(h => h);
        
        const lcProblems = await leetcodeBattleService.chooseProblems(
          battle.leetcodeDifficulty || ['Easy', 'Medium'],
          battle.problemsPerPlatform?.leetcode || Math.floor(battle.numProblems / platforms.length),
          lcHandles
        );
        allProblems = allProblems.concat(lcProblems);
      }

      battle.problems = allProblems.map(p => {
        if (p.platform === 'leetcode') {
          return {
            platform: 'leetcode',
            titleSlug: p.titleSlug,
            title: p.title,
            name: p.name || p.title,
            difficulty: p.difficulty,
            frontendId: p.frontendId,
            addedAt: new Date()
          };
        } else {
          return {
            platform: 'codeforces',
            contestId: p.contestId,
            index: p.index,
            name: p.name,
            rating: p.rating,
            addedAt: new Date()
          };
        }
      });
      battle.status = 'in_progress';

      await battle.save();
      console.log(`Battle ${battle._id} started successfully with ${allProblems.length} problems`);

    } catch (error) {
      console.error(`Failed to auto-start battle ${battle._id}:`, error.message);
    }
  }

  /**
   * Auto-end a battle (called by scheduler)
   * @param {Object} battle - The battle to end
   */
  async autoEndBattle(battle) {
    try {
      console.log(`Auto-ending battle ${battle._id}: ${battle.title}`);

      // Poll final submissions before ending
      await this.pollSubmissions(battle);

      battle.status = 'completed';
      battle.endedAt = new Date();

      await battle.save();
      console.log(`Battle ${battle._id} ended successfully`);

    } catch (error) {
      console.error(`Failed to auto-end battle ${battle._id}:`, error.message);
    }
  }
}

export default BattleService;
