// Utility functions for calendar event generation

/**
 * Format date for ICS format (YYYYMMDDTHHMMSSZ)
 */
const formatDateForICS = (date) => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Escape text for ICS format
 */
const escapeICSText = (text) => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
};

/**
 * Generate ICS file content for a contest
 */
export const generateICSContent = (contest) => {
  const startDate = new Date(contest.startAt);
  const endDate = new Date(contest.endAt);
  const now = new Date();
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CodeMesh//Contest Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:contest-${contest.id}-${contest.platform}@codemesh.dev`,
    `DTSTART:${formatDateForICS(startDate)}`,
    `DTEND:${formatDateForICS(endDate)}`,
    `DTSTAMP:${formatDateForICS(now)}`,
    `SUMMARY:${escapeICSText(contest.name)}`,
    `DESCRIPTION:${escapeICSText(generateEventDescription(contest))}`,
    `URL:${contest.url || ''}`,
    `LOCATION:${contest.platform} - Online`,
    `CATEGORIES:Programming Contest,${contest.platform},${contest.difficulty}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icsContent;
};

/**
 * Generate event description
 */
const generateEventDescription = (contest) => {
  const parts = [
    `Platform: ${contest.platform}`,
    `Difficulty: ${contest.difficulty}`,
    `Duration: ${contest.duration}`,
  ];
  
  if (contest.participants) {
    parts.push(`Expected Participants: ${contest.participants.toLocaleString()}`);
  }
  
  parts.push('');
  parts.push('Join the contest and test your programming skills!');
  
  if (contest.url) {
    parts.push('');
    parts.push(`Contest Link: ${contest.url}`);
  }
  
  return parts.join('\\n');
};

/**
 * Download ICS file
 */
export const downloadICSFile = (contest) => {
  const icsContent = generateICSContent(contest);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${contest.name.replace(/[^a-zA-Z0-9]/g, '_')}_contest.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Generate Google Calendar URL
 */
export const generateGoogleCalendarURL = (contest) => {
  const startDate = new Date(contest.startAt);
  const endDate = new Date(contest.endAt);
  
  const formatDateForGoogle = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: contest.name,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
    details: generateEventDescription(contest).replace(/\\n/g, '\n'),
    location: `${contest.platform} - Online`,
    sprop: 'website:codemesh.dev',
    sf: 'true',
    output: 'xml'
  });
  
  if (contest.url) {
    params.set('details', params.get('details') + `\n\nContest Link: ${contest.url}`);
  }
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Outlook Calendar URL
 */
export const generateOutlookCalendarURL = (contest) => {
  const startDate = new Date(contest.startAt);
  const endDate = new Date(contest.endAt);
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: contest.name,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: generateEventDescription(contest).replace(/\\n/g, '\n'),
    location: `${contest.platform} - Online`
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

/**
 * Open calendar URL in new tab
 */
export const openCalendarURL = (url) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Add to calendar with multiple options
 */
export const addToCalendar = (contest, provider = 'ics') => {
  switch (provider) {
    case 'google':
      openCalendarURL(generateGoogleCalendarURL(contest));
      break;
    case 'outlook':
      openCalendarURL(generateOutlookCalendarURL(contest));
      break;
    case 'ics':
    default:
      downloadICSFile(contest);
      break;
  }
};
