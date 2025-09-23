import { CListService } from './CListService.js';
import Contest from '../../models/Contest.js';

export class ContestAggregatorService {
  constructor() {
    this.services = [
      new CListService()
    ];
  }

  async fetchAllContests() {
    const allContests = [];
    
    for (const service of this.services) {
      try {
        console.log(`Fetching contests from ${service.platform}...`);
        const contests = await service.fetchContests();
        allContests.push(...contests);
        console.log(`Fetched ${contests.length} contests from ${service.platform}`);
      } catch (error) {
        console.error(`Error fetching from ${service.platform}:`, error.message);
      }
    }

    return allContests;
  }

  async syncContests() {
    try {
      console.log('Starting contest sync...');
      
      const contests = await this.fetchAllContests();
      let upsertedCount = 0;
      let updatedCount = 0;
      let createdCount = 0;

      for (const contestData of contests) {
        try {
          // Update contest status based on current time
          const now = new Date();
          const startTime = new Date(contestData.startAt);
          const endTime = new Date(contestData.endAt);
          
          let status;
          if (now < startTime) {
            status = { name: 'Upcoming', color: '#3B82F6' };
          } else if (now >= startTime && now <= endTime) {
            status = { name: 'Live', color: '#EF4444' };
          } else {
            status = { name: 'Completed', color: '#10B981' };
          }

          const contestDoc = {
            platform: contestData.platform.toLowerCase(),
            contestIdOnPlatform: contestData.contestIdOnPlatform || contestData.platformId, // fallback for legacy
            name: contestData.name,
            url: contestData.url,
            startTime: new Date(contestData.startAt),
            endTime: new Date(contestData.endAt),
            duration: contestData.duration,
            durationSeconds: contestData.durationSeconds,
            difficulty: contestData.difficulty,
            status: status,
            participants: contestData.participants,
            registrationOpen: contestData.registrationOpen,
            type: contestData.type,
            lastUpdated: new Date()
          };

          const existingContest = await Contest.findOne({
            platform: contestDoc.platform,
            contestIdOnPlatform: contestDoc.contestIdOnPlatform
          });

          if (existingContest) {
            await Contest.findByIdAndUpdate(existingContest._id, contestDoc);
            updatedCount++;
          } else {
            await Contest.create(contestDoc);
            createdCount++;
          }
          upsertedCount++;
        } catch (error) {
          console.error(`Error upserting contest ${contestData.name}:`, error.message);
        }
      }

      console.log(`Contest sync completed: ${createdCount} created, ${updatedCount} updated, ${upsertedCount} total processed`);
      return { 
        total: upsertedCount, 
        created: createdCount, 
        updated: updatedCount,
        contests: contests 
      };
    } catch (error) {
      console.error('Error syncing contests:', error);
      throw error;
    }
  }

  async getContests(filters = {}) {
    try {
      const query = {};
      
      // Platform filter
      if (filters.platform && filters.platform !== 'all') {
        query.platform = filters.platform.toLowerCase();
      }
      
      // Status filter
      if (filters.status) {
        const now = new Date();
        if (filters.status === 'upcoming') {
          query.startTime = { $gt: now };
        } else if (filters.status === 'live') {
          query.startTime = { $lte: now };
          query.endTime = { $gte: now };
        } else if (filters.status === 'past') {
          query.endTime = { $lt: now };
        }
      }

      // Difficulty filter
      if (filters.difficulty && filters.difficulty !== 'all') {
        query.difficulty = filters.difficulty;
      }

      // Get contests from database
      const contests = await Contest.find(query)
        .sort({ startTime: 1 })
        .limit(filters.limit || 3000)
        .lean(); // Use lean() for better performance

      // Transform to frontend format
      return contests.map(contest => this.transformContestForFrontend(contest));
    } catch (error) {
      console.error('Error getting contests:', error);
      throw error;
    }
  }

  transformContestForFrontend(contest) {
    return {
      id: `${contest.platform}-${contest.contestIdOnPlatform}`,
      platform: contest.platform.charAt(0).toUpperCase() + contest.platform.slice(1),
      contestIdOnPlatform: contest.contestIdOnPlatform,
      name: contest.name,
      url: contest.url,
      startAt: contest.startTime.toISOString(),
      endAt: contest.endTime.toISOString(),
      duration: contest.duration,
      durationSeconds: contest.durationSeconds,
      status: contest.status,
      difficulty: contest.difficulty,
      participants: contest.participants,
      registrationOpen: contest.registrationOpen,
      type: contest.type
    };
  }

  // Method to update contest statuses (can be called periodically)
  async updateContestStatuses() {
    try {
      const now = new Date();
      
      // Update upcoming contests that have started
      await Contest.updateMany(
        { 
          'status.name': 'Upcoming',
          startTime: { $lte: now },
          endTime: { $gte: now }
        },
        { 
          $set: { 
            'status.name': 'Live',
            'status.color': '#EF4444',
            lastUpdated: now
          }
        }
      );

      // Update live contests that have ended
      await Contest.updateMany(
        { 
          'status.name': 'Live',
          endTime: { $lt: now }
        },
        { 
          $set: { 
            'status.name': 'Completed',
            'status.color': '#10B981',
            lastUpdated: now
          }
        }
      );

      console.log('Contest statuses updated successfully');
    } catch (error) {
      console.error('Error updating contest statuses:', error);
      throw error;
    }
  }

  // Get contest statistics
  async getContestStats() {
    try {
      const stats = await Contest.aggregate([
        {
          $group: {
            _id: '$platform',
            total: { $sum: 1 },
            upcoming: {
              $sum: {
                $cond: [{ $eq: ['$status.name', 'Upcoming'] }, 1, 0]
              }
            },
            live: {
              $sum: {
                $cond: [{ $eq: ['$status.name', 'Live'] }, 1, 0]
              }
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status.name', 'Completed'] }, 1, 0]
              }
            }
          }
        }
      ]);

      const totalStats = await Contest.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            upcoming: {
              $sum: {
                $cond: [{ $eq: ['$status.name', 'Upcoming'] }, 1, 0]
              }
            },
            live: {
              $sum: {
                $cond: [{ $eq: ['$status.name', 'Live'] }, 1, 0]
              }
            },
            completed: {
              $sum: {
                $cond: [{ $eq: ['$status.name', 'Completed'] }, 1, 0]
              }
            }
          }
        }
      ]);

      return {
        byPlatform: stats,
        total: totalStats[0] || { total: 0, upcoming: 0, live: 0, completed: 0 }
      };
    } catch (error) {
      console.error('Error getting contest stats:', error);
      throw error;
    }
  }
}
  