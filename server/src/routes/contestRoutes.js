import express from 'express';
import { ContestAggregatorService } from '../services/contestServices/ContestAggregatorService.js';

const router = express.Router();
const contestService = new ContestAggregatorService();

// Get all contests with optional filters
router.get('/contests', async (req, res) => {
  try {
    const { platform, status, difficulty, limit } = req.query;
    
    const filters = {
      platform,
      status,
      difficulty,
      limit: limit ? parseInt(limit) : 100
    };

    const contests = await contestService.getContests(filters);
    
    res.json({
      success: true,
      data: contests,
      count: contests.length
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contests',
      error: error.message
    });
  }
});

// Manually trigger contest sync
router.post('/contests/sync', async (req, res) => {
  try {
    const result = await contestService.syncContests();
    
    res.json({
      success: true,
      message: `Successfully synced contests: ${result.created} created, ${result.updated} updated`,
      data: {
        total: result.total,
        created: result.created,
        updated: result.updated
      }
    });
  } catch (error) {
    console.error('Error syncing contests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync contests',
      error: error.message
    });
  }
});

// Update contest statuses
router.post('/contests/update-statuses', async (req, res) => {
  try {
    await contestService.updateContestStatuses();
    
    res.json({
      success: true,
      message: 'Contest statuses updated successfully'
    });
  } catch (error) {
    console.error('Error updating contest statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contest statuses',
      error: error.message
    });
  }
});

// Get contest statistics
router.get('/contests/stats', async (req, res) => {
  try {
    const stats = await contestService.getContestStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching contest stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contest stats',
      error: error.message
    });
  }
});

// // Add calendar export endpoint for future api use
// router.get('/:id/calendar', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { format = 'ics' } = req.query;

//     const contest = await Contest.findById(id);
//     if (!contest) {
//       return res.status(404).json({
//         success: false,
//         message: 'Contest not found'
//       });
//     }

//     // Generate calendar event data
//     const calendarData = {
//       id: contest._id,
//       name: contest.name,
//       platform: contest.platform,
//       difficulty: contest.difficulty,
//       duration: contest.duration,
//       startAt: contest.startTime,
//       endAt: contest.endTime,
//       url: contest.url,
//       participants: contest.participants
//     };

//     if (format === 'ics') {
//       const icsContent = generateICSContent(calendarData);
      
//       res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
//       res.setHeader('Content-Disposition', `attachment; filename="${contest.name.replace(/[^a-zA-Z0-9]/g, '_')}_contest.ics"`);
      
//       return res.send(icsContent);
//     }

//     // Return JSON data for other formats
//     res.json({
//       success: true,
//       data: calendarData
//     });

//   } catch (error) {
//     console.error('Error generating calendar export:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// });

// // Helper function to generate ICS content (same as client-side but for server)
// const generateICSContent = (contest) => {
//   const formatDateForICS = (date) => {
//     return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
//   };

//   const escapeICSText = (text) => {
//     return text
//       .replace(/\\/g, '\\\\')
//       .replace(/,/g, '\\,')
//       .replace(/;/g, '\\;')
//       .replace(/\n/g, '\\n')
//       .replace(/\r/g, '');
//   };

//   const startDate = new Date(contest.startAt);
//   const endDate = new Date(contest.endAt);
//   const now = new Date();

//   const description = [
//     `Platform: ${contest.platform}`,
//     `Difficulty: ${contest.difficulty}`,
//     `Duration: ${contest.duration}`,
//   ];

//   if (contest.participants) {
//     description.push(`Expected Participants: ${contest.participants.toLocaleString()}`);
//   }

//   description.push('');
//   description.push('Join the contest and test your programming skills!');

//   if (contest.url) {
//     description.push('');
//     description.push(`Contest Link: ${contest.url}`);
//   }

//   const icsContent = [
//     'BEGIN:VCALENDAR',
//     'VERSION:2.0',
//     'PRODID:-//CodeMesh//Contest Calendar//EN',
//     'CALSCALE:GREGORIAN',
//     'METHOD:PUBLISH',
//     'BEGIN:VEVENT',
//     `UID:contest-${contest.id}-${contest.platform}@codemesh.dev`,
//     `DTSTART:${formatDateForICS(startDate)}`,
//     `DTEND:${formatDateForICS(endDate)}`,
//     `DTSTAMP:${formatDateForICS(now)}`,
//     `SUMMARY:${escapeICSText(contest.name)}`,
//     `DESCRIPTION:${escapeICSText(description.join('\\n'))}`,
//     `URL:${contest.url || ''}`,
//     `LOCATION:${contest.platform} - Online`,
//     `CATEGORIES:Programming Contest,${contest.platform},${contest.difficulty}`,
//     'STATUS:CONFIRMED',
//     'TRANSP:OPAQUE',
//     'END:VEVENT',
//     'END:VCALENDAR'
//   ].join('\r\n');

//   return icsContent;
// };

export default router;
