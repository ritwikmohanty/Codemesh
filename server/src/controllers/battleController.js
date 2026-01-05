import BattleService from '../services/battle/BattleService.js';

const battleService = new BattleService();

/**
 * Battle Controller
 * Handles HTTP requests for battle-related operations
 */

/**
 * Create a new battle
 * POST /api/v1/battles
 */
export async function createBattle(req, res) {
  try {
    const { title, startTime, durationMinutes, minRating, maxRating, numProblems } = req.body;

    // Validate required fields
    if (!title || !startTime || !durationMinutes || !minRating || !maxRating || !numProblems) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: title, startTime, durationMinutes, minRating, maxRating, numProblems'
      });
    }

    const battle = await battleService.createBattle(req.user, {
      title,
      startTime,
      durationMinutes: parseInt(durationMinutes, 10),
      minRating: parseInt(minRating, 10),
      maxRating: parseInt(maxRating, 10),
      numProblems: parseInt(numProblems, 10)
    });

    res.status(201).json({
      success: true,
      message: 'Battle created successfully',
      data: {
        battleId: battle._id,
        joinToken: battle.joinToken
      }
    });

  } catch (error) {
    console.error('Create battle error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create battle'
    });
  }
}

/**
 * Join a battle using join token
 * POST /api/v1/battles/join/:joinToken
 */
export async function joinBattle(req, res) {
  try {
    const { joinToken } = req.params;

    if (!joinToken) {
      return res.status(400).json({
        success: false,
        message: 'Join token is required'
      });
    }

    const { battle, alreadyJoined } = await battleService.joinBattle(joinToken, req.user);

    res.json({
      success: true,
      message: alreadyJoined ? 'You are already in this battle' : 'Successfully joined the battle',
      data: {
        battleId: battle._id,
        alreadyJoined
      }
    });

  } catch (error) {
    console.error('Join battle error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to join battle'
    });
  }
}

/**
 * Get all battles for the current user
 * GET /api/v1/battles
 */
export async function getUserBattles(req, res) {
  try {
    const battles = await battleService.getUserBattles(req.user._id);

    res.json({
      success: true,
      data: battles,
      count: battles.length
    });

  } catch (error) {
    console.error('Get user battles error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get battles'
    });
  }
}

/**
 * Get a specific battle
 * GET /api/v1/battles/:id
 */
export async function getBattle(req, res) {
  try {
    const { id } = req.params;

    const battle = await battleService.getBattle(id, req.user._id);

    res.json({
      success: true,
      data: battle
    });

  } catch (error) {
    console.error('Get battle error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 
                       error.message.includes('access') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get battle'
    });
  }
}

/**
 * Get battle participants
 * GET /api/v1/battles/:id/participants
 */
export async function getBattleParticipants(req, res) {
  try {
    const { id } = req.params;

    const participants = await battleService.getBattleParticipants(id, req.user._id);

    res.json({
      success: true,
      data: participants
    });

  } catch (error) {
    console.error('Get battle participants error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get participants'
    });
  }
}

/**
 * Get battle problems (only after battle has started)
 * GET /api/v1/battles/:id/problems
 */
export async function getBattleProblems(req, res) {
  try {
    const { id } = req.params;

    const problems = await battleService.getBattleProblems(id, req.user._id);

    res.json({
      success: true,
      data: problems
    });

  } catch (error) {
    console.error('Get battle problems error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get problems'
    });
  }
}

/**
 * Get battle standings
 * GET /api/v1/battles/:id/standings
 */
export async function getBattleStandings(req, res) {
  try {
    const { id } = req.params;

    const standings = await battleService.getBattleStandings(id, req.user._id);

    res.json({
      success: true,
      data: standings
    });

  } catch (error) {
    console.error('Get battle standings error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get standings'
    });
  }
}

/**
 * Get battle submissions
 * GET /api/v1/battles/:id/submissions
 */
export async function getBattleSubmissions(req, res) {
  try {
    const { id } = req.params;

    const submissions = await battleService.getBattleSubmissions(id, req.user._id);

    res.json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error('Get battle submissions error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get submissions'
    });
  }
}

/**
 * Refresh submissions for a battle (poll Codeforces)
 * POST /api/v1/battles/:id/refresh
 */
export async function refreshSubmissions(req, res) {
  try {
    const { id } = req.params;

    const result = await battleService.refreshSubmissions(id, req.user._id);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Refresh submissions error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to refresh submissions'
    });
  }
}

/**
 * Start a battle (creator only)
 * POST /api/v1/battles/:id/start
 */
export async function startBattle(req, res) {
  try {
    const { id } = req.params;

    const battle = await battleService.startBattle(id, req.user._id);

    res.json({
      success: true,
      message: 'Battle started successfully',
      data: {
        battleId: battle._id,
        problemCount: battle.problems.length
      }
    });

  } catch (error) {
    console.error('Start battle error:', error);
    const statusCode = error.message.includes('creator') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to start battle'
    });
  }
}

/**
 * End a battle (creator only)
 * POST /api/v1/battles/:id/end
 */
export async function endBattle(req, res) {
  try {
    const { id } = req.params;

    const battle = await battleService.endBattle(id, req.user._id);

    res.json({
      success: true,
      message: 'Battle ended successfully',
      data: {
        battleId: battle._id
      }
    });

  } catch (error) {
    console.error('End battle error:', error);
    const statusCode = error.message.includes('creator') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to end battle'
    });
  }
}

/**
 * Cancel a battle (creator only)
 * DELETE /api/v1/battles/:id
 */
export async function cancelBattle(req, res) {
  try {
    const { id } = req.params;

    const result = await battleService.cancelBattle(id, req.user._id);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Cancel battle error:', error);
    const statusCode = error.message.includes('creator') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to cancel battle'
    });
  }
}

/**
 * Get current server time (for syncing with clients)
 * GET /api/v1/battles/time
 */
export async function getServerTime(req, res) {
  res.json({
    success: true,
    data: {
      serverTime: Date.now()
    }
  });
}
