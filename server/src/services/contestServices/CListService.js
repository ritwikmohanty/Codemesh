import axios from 'axios';
import { BaseContestService } from './BaseContestService.js';

// Add this line at the top if not already present in your project entrypoint:
// import dotenv from 'dotenv'; dotenv.config();

export class CListService extends BaseContestService {
  constructor() {
    super('clist');
    this.apiUrl = process.env.CLIST_API_URL;
    this.apiKey = process.env.CLIST_API_KEY;
    
    // Platform mappings
    this.platformHosts = {
      'codeforces': 'codeforces.com',
      'codechef': 'codechef.com',
      'leetcode': 'leetcode.com',
      'hackerrank': 'hackerrank.com',
      'geeksforgeeks': 'geeksforgeeks.org',
      'code360': 'naukri.com/code360',
      'hackerearth': 'hackerearth.com',
      'atcoder': 'atcoder.jp'
    };

    this.hostToPlatform = Object.fromEntries(
      Object.entries(this.platformHosts).map(([platform, host]) => [host, platform])
    );
  }

  async fetchContests() {
    try {
      const allContests = [];
      
      // Fetch contests for each platform
      for (const [platform, host] of Object.entries(this.platformHosts)) {
        try {
          console.log(`Fetching contests from ${platform} via CList...`);
          const contests = await this.fetchContestsForPlatform(host, platform);
          allContests.push(...contests);
          console.log(`Found ${contests.length} contests from ${platform}`);
        } catch (error) {
          console.error(`Error fetching ${platform} contests:`, error.message);
        }
      }

      console.log(`Total contests fetched from CList: ${allContests.length}`);
      return allContests;
    } catch (error) {
      console.error('Error fetching contests from CList:', error.message);
      throw error;
    }
  }

  async fetchContestsForPlatform(host, platform) {
    try {
      const response = await axios.get(this.apiUrl, {
        params: {
          upcoming: true,
          host: host,
          limit: 100
        },
        headers: {
          'Authorization': `ApiKey ${this.apiKey}`,
          'User-Agent': 'CodeMesh-Contest-Calendar'
        },
        timeout: 15000
      });

      if (!response.data || !response.data.objects) {
        return [];
      }

      return response.data.objects
        .filter(contest => this.isValidContest(contest))
        .map(contest => this.normalizeContest(contest, platform));
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn(`Rate limited for ${platform}, retrying after delay...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.fetchContestsForPlatform(host, platform);
      }
      throw error;
    }
  }

  isValidContest(contest) {
    // Filter out invalid or unwanted contests
    if (!contest.start || !contest.end || !contest.event) {
      return false;
    }

    const startTime = new Date(contest.start);
    const endTime = new Date(contest.end);
    const now = new Date();

    // Only include upcoming and currently running contests
    return endTime > now;
  }

  normalizeContest(rawContest, platform) {
    // Parse start and end as UTC
    const startTime = new Date(rawContest.start + 'Z');
    const endTime = new Date(rawContest.end + 'Z');
    
    return {
      id: `${platform}-${rawContest.id}`,
      platform: this.capitalizePlatform(platform),
      contestIdOnPlatform: rawContest.id.toString(),
      name: rawContest.event,
      url: rawContest.href || `https://${rawContest.host}`,
      startAt: startTime.toISOString(), // always UTC
      endAt: endTime.toISOString(),     // always UTC
      duration: this.formatDuration(rawContest.duration),
      durationSeconds: rawContest.duration,
      status: this.getContestStatus(startTime, endTime),
      difficulty: this.determineDifficulty(rawContest, platform),
      participants: rawContest.n_statistics || null,
      registrationOpen: this.isRegistrationOpen(rawContest, platform),
      type: this.getContestType(rawContest, platform)
    };
  }

  capitalizePlatform(platform) {
    const platformNames = {
      'codeforces': 'Codeforces',
      'codechef': 'CodeChef',
      'leetcode': 'LeetCode',
      'hackerrank': 'HackerRank',
      'geeksforgeeks': 'GeeksforGeeks',
      'code360': 'Code360',
      'hackerearth': 'HackerEarth',
      'atcoder': 'AtCoder'
    };
    return platformNames[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
  }

  determineDifficulty(contest, platform) {
    const name = contest.event.toLowerCase();
    
    // Platform-specific difficulty detection
    if (platform === 'codeforces') {
      if (name.includes('div. 3') || name.includes('educational')) {
        return 'Easy';
      } else if (name.includes('div. 2')) {
        return 'Medium';
      } else if (name.includes('div. 1')) {
        return 'Hard';
      }
    } else if (platform === 'atcoder') {
      if (name.includes('beginner') || name.includes('abc')) {
        return 'Easy';
      } else if (name.includes('regular') || name.includes('arc')) {
        return 'Medium';
      } else if (name.includes('grand') || name.includes('agc')) {
        return 'Hard';
      }
    } else if (platform === 'leetcode') {
      if (name.includes('weekly')) {
        return 'Medium';
      } else if (name.includes('biweekly')) {
        return 'Medium';
      }
    }

    // Generic difficulty detection
    if (name.includes('beginner') || name.includes('easy') || name.includes('div. 3')) {
      return 'Easy';
    } else if (name.includes('hard') || name.includes('advanced') || name.includes('div. 1')) {
      return 'Hard';
    }

    return 'Medium'; // Default
  }

  isRegistrationOpen(contest, platform) {
    const now = new Date();
    const startTime = new Date(contest.start);
    
    // Generally, registration is open for upcoming contests
    return startTime > now;
  }

  getContestType(contest, platform) {
    const name = contest.event.toLowerCase();
    
    if (platform === 'codeforces') {
      if (name.includes('educational')) return 'Educational';
      if (name.includes('div. 1')) return 'Div. 1';
      if (name.includes('div. 2')) return 'Div. 2';
      if (name.includes('div. 3')) return 'Div. 3';
      if (name.includes('global')) return 'Global';
    } else if (platform === 'leetcode') {
      if (name.includes('weekly')) return 'Weekly';
      if (name.includes('biweekly')) return 'Biweekly';
    } else if (platform === 'atcoder') {
      if (name.includes('beginner')) return 'ABC';
      if (name.includes('regular')) return 'ARC';
      if (name.includes('grand')) return 'AGC';
    } else if (platform === 'codechef') {
      if (name.includes('long')) return 'Long';
      if (name.includes('cook')) return 'Cook-Off';
      if (name.includes('lunch')) return 'Lunchtime';
    }

    return 'Contest';
  }
}
