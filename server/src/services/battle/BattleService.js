import Battle from '../../models/Battle.js';
import BattleSubmission from '../../models/BattleSubmission.js';
import User from '../../models/User.js';
import PlatformData from '../../models/PlatformData.js';
import CodeforcesService from '../platform/CodeforcesServiceV2.js';
import { nanoid } from 'nanoid';

const codeforcesService = new CodeforcesService();

/**
 * Battle Service
 * Handles all battle-related business logic
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
    const { title, startTime, durationMinutes, minRating, maxRating, numProblems } = details;

    // Validate start time is in the future
    const startTimeDate = new Date(startTime);
    if (startTimeDate.getTime() < Date.now() + 30 * 1000) {
      throw new Error('Start time must be at least 30 seconds in the future');
    }

    // Validate duration
    if (durationMinutes < 10 || durationMinutes > 300) {
      throw new Error('Duration must be between 10 and 300 minutes');
    }

    // Validate rating range
    if (minRating > maxRating) {
      throw new Error('Minimum rating cannot be greater than maximum rating');
    }

    if (minRating < 800 || maxRating > 3500) {
      throw new Error('Rating must be between 800 and 3500');
    }

    // Validate problem count
    if (numProblems < 1 || numProblems > 10) {
      throw new Error('Number of problems must be between 1 and 10');
    }

    // Get user's verified Codeforces handle
    const codeforcesHandle = await this.getUserCodeforcesHandle(user);
    if (!codeforcesHandle) {
      throw new Error('You must link and verify your Codeforces account before creating a battle');
    }

    // Generate unique join token
    const joinToken = nanoid(12);

    // Create battle
    const battle = new Battle({
      title: title.trim(),
      createdBy: user._id,
      startTime: startTimeDate,
      durationMinutes,
      minRating,
      maxRating,
      numProblems,
      joinToken,
      participants: [{
        user: user._id,
        codeforcesHandle,
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
        return { battle, alreadyJoined: true };
      }
      throw new Error('You can only join battles that have not started yet');
    }

    // Check if user is already a participant
    if (battle.isParticipant(user._id)) {
      return { battle, alreadyJoined: true };
    }

    // Get user's verified Codeforces handle
    const codeforcesHandle = await this.getUserCodeforcesHandle(user);
    if (!codeforcesHandle) {
      throw new Error('You must link and verify your Codeforces account before joining a battle');
    }

    // Add user as participant
    battle.participants.push({
      user: user._id,
      codeforcesHandle,
      joinedAt: new Date()
    });

    await battle.save();

    return { battle, alreadyJoined: false };
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

    // Get all participant handles
    const participantHandles = battle.participants.map(p => p.codeforcesHandle);

    // Choose problems that participants haven't solved
    const problems = await this.chooseProblems(
      battle.minRating,
      battle.maxRating,
      battle.numProblems,
      participantHandles
    );

    // Update battle with problems and start
    battle.problems = problems.map(p => ({
      contestId: p.contestId,
      index: p.index,
      name: p.name,
      rating: p.rating,
      addedAt: new Date()
    }));
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
   * @returns {Promise<Array>} Standings
   */
  async getBattleStandings(battleId, userId) {
    const battle = await this.getBattle(battleId, userId);

    if (battle.status === 'pending') {
      throw new Error('Standings are only available after the battle starts');
    }

    const submissions = await BattleSubmission.find({ battle: battleId }).lean();

    const standings = [];

    for (const participant of battle.participants) {
      const userSubmissions = submissions.filter(
        s => s.user.toString() === participant.user._id.toString()
      );

      let solved = 0;
      let penalty = 0;
      const problemData = {};

      for (const problem of battle.problems) {
        const problemSubmissions = userSubmissions.filter(
          s => s.contestId === problem.contestId && s.problemIndex === problem.index
        );

        // Sort by submission time
        const sortedSubmissions = problemSubmissions.sort(
          (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
        );

        const correctSubmission = sortedSubmissions.find(s => s.verdict === 'OK');

        if (correctSubmission) {
          const wrongBeforeCorrect = sortedSubmissions.filter(
            s => s.verdict !== 'OK' && 
                 new Date(s.submittedAt) < new Date(correctSubmission.submittedAt) &&
                 s.passedTestCount > 0
          );

          solved++;
          
          // Calculate penalty: time from start + 10 minutes per wrong submission
          const timeDiff = Math.floor(
            (new Date(correctSubmission.submittedAt) - new Date(battle.startTime)) / 60000
          );
          penalty += timeDiff + wrongBeforeCorrect.length * 10;

          problemData[`${problem.contestId}${problem.index}`] = {
            solved: true,
            wrongSubmissions: wrongBeforeCorrect.length,
            solveTimeMinutes: timeDiff
          };
        } else {
          const wrongSubmissions = problemSubmissions.filter(
            s => s.verdict !== 'OK' && s.passedTestCount > 0
          );

          problemData[`${problem.contestId}${problem.index}`] = {
            solved: false,
            wrongSubmissions: wrongSubmissions.length,
            solveTimeMinutes: 0
          };
        }
      }

      standings.push({
        user: participant.user,
        codeforcesHandle: participant.codeforcesHandle,
        solved,
        penalty,
        problemData
      });
    }

    // Sort by solved (descending), then by penalty (ascending)
    standings.sort((a, b) => {
      if (a.solved !== b.solved) {
        return b.solved - a.solved;
      }
      return a.penalty - b.penalty;
    });

    return standings;
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
   * Poll submissions from Codeforces for all participants
   * @param {Object} battle - The battle document
   */
  async pollSubmissions(battle) {
    console.log(`Polling submissions for battle ${battle._id}`);

    const startTime = new Date(battle.startTime);
    const endTime = new Date(startTime.getTime() + battle.durationMinutes * 60 * 1000);

    // Get existing submission IDs to avoid duplicates
    const existingSubmissions = await BattleSubmission.find({ battle: battle._id })
      .select('cfSubmissionId')
      .lean();
    const existingIds = new Set(existingSubmissions.map(s => s.cfSubmissionId));

    for (const participant of battle.participants) {
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
          const isForBattleProblem = battle.problems.some(
            p => p.contestId === sub.problem.contestId && p.index === sub.problem.index
          );

          if (!isForBattleProblem) {
            return false;
          }

          // Check if we already have this submission
          if (existingIds.has(sub.id.toString())) {
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

        // Get user ID for this participant from PlatformData
        const platformData = await PlatformData.findOne({
          platform: 'codeforces',
          handle: participant.codeforcesHandle,
          isActive: true
        }).select('user').lean();

        if (!platformData) {
          console.warn(`User not found for handle ${participant.codeforcesHandle}`);
          continue;
        }

        // Create submission documents
        const newSubmissions = relevantSubmissions.map(sub => ({
          battle: battle._id,
          user: platformData.user,
          cfSubmissionId: sub.id.toString(),
          contestId: sub.problem.contestId,
          problemIndex: sub.problem.index,
          verdict: sub.verdict,
          passedTestCount: sub.passedTestCount || 0,
          programmingLanguage: sub.programmingLanguage || '',
          submittedAt: new Date(sub.creationTimeSeconds * 1000),
          rawData: sub
        }));

        if (newSubmissions.length > 0) {
          await BattleSubmission.insertMany(newSubmissions, { ordered: false });
          console.log(`Inserted ${newSubmissions.length} submissions for ${participant.codeforcesHandle}`);
        }

      } catch (error) {
        console.error(`Error polling submissions for ${participant.codeforcesHandle}:`, error.message);
        // Continue with other participants
      }
    }
  }

  /**
   * Choose random problems that haven't been solved by participants
   * @param {number} minRating - Minimum problem rating
   * @param {number} maxRating - Maximum problem rating
   * @param {number} count - Number of problems to select
   * @param {Array<string>} handles - Participant Codeforces handles
   * @returns {Promise<Array>} Selected problems
   */
  async chooseProblems(minRating, maxRating, count, handles) {
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

    // Shuffle and select
    const shuffled = eligibleProblems.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
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

      const participantHandles = battle.participants.map(p => p.codeforcesHandle);

      const problems = await this.chooseProblems(
        battle.minRating,
        battle.maxRating,
        battle.numProblems,
        participantHandles
      );

      battle.problems = problems.map(p => ({
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
        addedAt: new Date()
      }));
      battle.status = 'in_progress';

      await battle.save();
      console.log(`Battle ${battle._id} started successfully`);

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
