export class BaseContestService {
  constructor(platform) {
    this.platform = platform;
  }

  // Abstract method to be implemented by platform-specific services
  async fetchContests() {
    throw new Error('fetchContests method must be implemented');
  }

  // Normalize contest data to a common format
  normalizeContest(rawContest) {
    throw new Error('normalizeContest method must be implemented');
  }

  // Determine contest status based on current time
  getContestStatus(startTime, endTime) {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return { name: 'Upcoming', color: '#3B82F6' };
    } else if (now >= start && now <= end) {
      return { name: 'Live', color: '#EF4444' };
    } else {
      return { name: 'Completed', color: '#10B981' };
    }
  }

  // Format duration from seconds to human-readable format
  formatDuration(durationSeconds) {
    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }
}
