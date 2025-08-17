import axios from 'axios';
import { BaseContestService } from './BaseContestService.js';

export class CodeforcesService extends BaseContestService {
  constructor() {
    super('codeforces');
    this.apiUrl = 'https://codeforces.com/api/contest.list';
  }

  async fetchContests() {
    try {
      const response = await axios.get(this.apiUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'CodeMesh-Contest-Calendar'
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Codeforces API error: ${response.data.comment || 'Unknown error'}`);
      }

      // Get all upcoming and currently running contests
      const contests = response.data.result
        .filter(contest => {
          // Include contests that are before start or currently running
          return contest.phase === 'BEFORE' || contest.phase === 'CODING';
        })
        .map(contest => this.normalizeContest(contest));

      console.log(`Found ${contests.length} active Codeforces contests`);
      return contests;
    } catch (error) {
      console.error('Error fetching Codeforces contests:', error.message);
      throw error;
    }
  }

  normalizeContest(rawContest) {
    const startTime = new Date(rawContest.startTimeSeconds * 1000);
    const endTime = new Date((rawContest.startTimeSeconds + rawContest.durationSeconds) * 1000);
    
    return {
      id: `codeforces-${rawContest.id}`,
      platform: 'Codeforces',
      contestIdOnPlatform: rawContest.id.toString(),
      name: rawContest.name,
      url: `https://codeforces.com/contest/${rawContest.id}`,
      startAt: startTime.toISOString(),
      endAt: endTime.toISOString(),
      duration: this.formatDuration(rawContest.durationSeconds),
      durationSeconds: rawContest.durationSeconds,
      status: this.getContestStatus(startTime, endTime),
      difficulty: this.determineDifficulty(rawContest),
      participants: null,
      registrationOpen: rawContest.phase === 'BEFORE',
      type: rawContest.type
    };
  }

  determineDifficulty(contest) {
    const name = contest.name.toLowerCase();
    
    if (name.includes('div. 3') || name.includes('educational')) {
      return 'Easy';
    } else if (name.includes('div. 2')) {
      return 'Medium';
    } else if (name.includes('div. 1')) {
      return 'Hard';
    } else {
      return 'Medium';
    }
  }
}
