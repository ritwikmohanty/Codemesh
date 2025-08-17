import axios from 'axios';
import { BaseContestService } from './BaseContestService.js';

export class LeetCodeService extends BaseContestService {
  constructor() {
    super('leetcode');
    this.apiUrl = 'https://leetcode.com/graphql/';
    this.query = {
      query: `
        query upcomingContests {
          upcomingContests {
            title
            titleSlug
            startTime
            duration
            __typename
          }
        }
      `
    };
  }

  async fetchContests() {
    try {
      const response = await axios.post(this.apiUrl, this.query, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CodeMesh-Contest-Calendar'
        }
      });

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from LeetCode API');
      }

      const contests = response.data.data.upcomingContests || [];
      
      return contests.map(contest => this.normalizeContest(contest));
    } catch (error) {
      console.error('Error fetching LeetCode contests:', error.message);
      throw error;
    }
  }

  normalizeContest(rawContest) {
    const startTime = new Date(rawContest.startTime * 1000);
    const endTime = new Date((rawContest.startTime + rawContest.duration) * 1000);
    
    return {
      id: `leetcode-${rawContest.titleSlug}`,
      platform: 'LeetCode',
      contestIdOnPlatform: rawContest.titleSlug || rawContest.title.toLowerCase().replace(/\s+/g, '-'),
      name: rawContest.title,
      url: `https://leetcode.com/contest/${rawContest.titleSlug}/`,
      startAt: startTime.toISOString(),
      endAt: endTime.toISOString(),
      duration: this.formatDuration(rawContest.duration),
      durationSeconds: rawContest.duration,
      status: this.getContestStatus(startTime, endTime),
      difficulty: this.determineDifficulty(rawContest),
      participants: null,
      registrationOpen: true, // LeetCode contests are generally open for registration
      type: this.getContestType(rawContest.title)
    };
  }

  determineDifficulty(contest) {
    const title = contest.title.toLowerCase();
    
    if (title.includes('weekly')) {
      return 'Medium';
    } else if (title.includes('biweekly')) {
      return 'Medium';
    } else if (title.includes('beginner') || title.includes('easy')) {
      return 'Easy';
    } else if (title.includes('hard') || title.includes('advanced')) {
      return 'Hard';
    } else {
      return 'Medium'; // Default for LeetCode contests
    }
  }

  getContestType(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('weekly')) {
      return 'Weekly';
    } else if (titleLower.includes('biweekly')) {
      return 'Biweekly';
    } else if (titleLower.includes('global')) {
      return 'Global';
    } else {
      return 'Contest';
    }
  }
}
