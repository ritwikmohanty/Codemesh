import webpush from 'web-push';
import Contest from '../models/Contest.js';
import NotificationSetting from '../models/NotificationSetting.js';

// Configure web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@codemesh.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export const startNotificationScheduler = () => {
  console.log('Notification scheduler started');
  
  // Check for notifications every 5 minutes
  setInterval(async () => {
    await checkAndSendNotifications();
  }, 5 * 60 * 1000); // 5 minutes
  
  console.log('Notification scheduler interval set up');
};

const checkAndSendNotifications = async () => {
  try {
    console.log('Checking for contest notifications...');
    
    // Get all active notification preferences
    const preferences = await NotificationSetting.find({
      enabled: true,
      methods: 'push',
      pushSubscription: { $exists: true }
    });

    if (preferences.length === 0) {
      return;
    }

    const now = new Date();
    
    // Check each preference for matching contests
    for (const preference of preferences) {
      try {
        await processUserNotifications(preference, now);
      } catch (error) {
        console.error(`Error processing notifications for user ${preference.userId}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in notification scheduler:', error);
  }
};

const processUserNotifications = async (preference, now) => {
  // Calculate the time window for notifications
  const reminderMs = preference.reminderTime * 60 * 1000; // Convert minutes to milliseconds
  const notificationTime = new Date(now.getTime() + reminderMs);
  const windowStart = new Date(notificationTime.getTime() - 2.5 * 60 * 1000); // 2.5 minutes before
  const windowEnd = new Date(notificationTime.getTime() + 2.5 * 60 * 1000); // 2.5 minutes after

  // Build contest query based on user preferences
  const contestQuery = {
    startTime: { $gte: windowStart, $lte: windowEnd },
    'status.name': 'Upcoming'
  };

  // Apply platform filter - fix field name
  if (!preference.platforms.includes('all')) {
    contestQuery.platform = { $in: preference.platforms.map(p => p.toLowerCase()) };
  }

  // Apply difficulty filter
  if (!preference.difficulties.includes('all')) {
    contestQuery.difficulty = { $in: preference.difficulties.map(d => capitalize(d)) };
  }

  // Find matching contests
  const contests = await Contest.find(contestQuery);

  // Apply duration filter (need to check in code since it's calculated)
  const filteredContests = contests.filter(contest => {
    if (preference.durations.includes('all')) return true;
    
    const durationHours = contest.durationSeconds / 3600;
    return preference.durations.some(duration => {
      return (duration === 'short' && durationHours < 2) ||
             (duration === 'medium' && durationHours >= 2 && durationHours <= 5) ||
             (duration === 'long' && durationHours > 5);
    });
  });

  // Send notifications for each matching contest
  for (const contest of filteredContests) {
    await sendContestNotification(preference, contest, now);
  }
};

const sendContestNotification = async (preference, contest, now) => {
  try {
    // Check if we've already sent a notification for this contest to this user
    const notificationKey = `${preference.userId}-${contest._id}`;
    
    // In a production app, you'd store sent notifications in a separate collection
    // For now, we'll skip this check to avoid complexity
    
    const timeUntilStart = Math.round((contest.startTime.getTime() - now.getTime()) / (60 * 1000));
    const timeText = formatTimeUntilStart(timeUntilStart);
    
    // Create personalized message
    let title = 'Contest Reminder';
    let body = `${contest.name} starts ${timeText}!`;
    
    if (preference.personalizedMessages && preference.userName) {
      title = `Hey ${preference.userName}!`;
      body = `${contest.name} starts ${timeText}!`;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        contestId: contest._id,
        platform: contest.platform,
        url: '/calendar',
        contestUrl: contest.url
      },
      actions: [
        {
          action: 'view',
          title: 'View Contest'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: true,
      timestamp: Date.now()
    });

    await webpush.sendNotification(preference.pushSubscription, payload);
    console.log(`Notification sent to user ${preference.userId} for contest ${contest.name}`);
    
  } catch (error) {
    console.error(`Failed to send notification for contest ${contest.name}:`, error);
    
    // If the subscription is invalid, remove it
    if (error.statusCode === 410 || error.statusCode === 404) {
      await NotificationSetting.findOneAndUpdate(
        { userId: preference.userId },
        { $unset: { pushSubscription: 1 } }
      );
      console.log(`Removed invalid push subscription for user ${preference.userId}`);
    }
  }
};

const formatTimeUntilStart = (minutes) => {
  if (minutes < 60) {
    return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.round(minutes / 1440);
    return `in ${days} day${days !== 1 ? 's' : ''}`;
  }
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
