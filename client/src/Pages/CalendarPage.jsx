import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarBody,
  CalendarHeader,
  CalendarItem,
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
} from '@/components/ui/kibo-ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, Bell, Calendar, Filter } from 'lucide-react';
import Navbar from '../Components/Navbar';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Contest platforms
const platforms = [
  { id: 'all', name: 'All Platforms' },
  { id: 'codeforces', name: 'Codeforces' },
  { id: 'codechef', name: 'CodeChef' },
  { id: 'atcoder', name: 'AtCoder' },
  { id: 'leetcode', name: 'LeetCode' },
  { id: 'hackerrank', name: 'HackerRank' },
];

// Contest difficulties
const difficulties = [
  { id: 'all', name: 'All Difficulties' },
  { id: 'easy', name: 'Easy' },
  { id: 'medium', name: 'Medium' },
  { id: 'hard', name: 'Hard' },
];

// Contest durations
const durations = [
  { id: 'all', name: 'All Durations' },
  { id: 'short', name: 'Short (< 2 hours)' },
  { id: 'medium', name: 'Medium (2-5 hours)' },
  { id: 'long', name: 'Long (> 5 hours)' },
];

const CalendarPage = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);

  // Helper function to safely parse dates
  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    
    // If it's already a Date object
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // If it's a string or number, try to parse it
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Enhanced formatTime function with error handling
  const formatTime = (date) => {
    const parsedDate = parseDate(date);
    
    if (!parsedDate) {
      return 'Invalid Date';
    }
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short',
      }).format(parsedDate);
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
  };

  // Process and normalize contest data from API
  const processContestData = (rawContests) => {
    return rawContests.map(contest => ({
      ...contest,
      startAt: parseDate(contest.startAt),
      endAt: parseDate(contest.endAt),
      // Ensure status object exists with default values
      status: contest.status || { name: 'Unknown', color: '#6B7280' },
      // Ensure required fields exist
      platform: contest.platform || 'Unknown',
      difficulty: contest.difficulty || 'Medium',
      duration: contest.duration || '0h',
      participants: contest.participants || null
    })).filter(contest => contest.startAt && contest.endAt); // Filter out contests with invalid dates
  };

  // Fetch contests from API
  const fetchContests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/contests`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const processedContests = processContestData(data.data);
        setContests(processedContests);
        console.log(`Loaded ${processedContests.length} contests from database`);
      } else {
        throw new Error(data.message || 'Failed to fetch contests');
      }
    } catch (err) {
      console.error('Error fetching contests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual sync
  const syncContests = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/contests/sync`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Sync completed:', data.data);
        // Refresh contests after sync
        await fetchContests();
      } else {
        throw new Error(data.message || 'Failed to sync contests');
      }
    } catch (err) {
      console.error('Error syncing contests:', err);
      setError(err.message);
    }
  };

  // Fetch contests on component mount
  useEffect(() => {
    fetchContests();
    
    // Set up periodic refresh every 30 minutes
    const interval = setInterval(fetchContests, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter contests based on selected criteria
  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
      // Ensure contest has valid dates before filtering
      if (!contest.startAt || !contest.endAt) {
        return false;
      }
      
      const platformMatch = selectedPlatform === 'all' || contest.platform === platforms.find(p => p.id === selectedPlatform)?.name;
      const difficultyMatch = selectedDifficulty === 'all' || contest.difficulty === difficulties.find(d => d.id === selectedDifficulty)?.name;
      
      // Parse duration more safely
      const durationHours = parseInt(contest.duration) || 0;
      const durationMatch = selectedDuration === 'all' || 
        (selectedDuration === 'short' && durationHours < 2) ||
        (selectedDuration === 'medium' && durationHours >= 2 && durationHours <= 5) ||
        (selectedDuration === 'long' && durationHours > 5);
      
      return platformMatch && difficultyMatch && durationMatch;
    });
  }, [contests, selectedPlatform, selectedDifficulty, selectedDuration]);

  // Enhanced ContestItem with error boundaries
  const ContestItem = ({ feature }) => {
    // Validate feature data before rendering
    if (!feature || !feature.startAt || !feature.endAt) {
      return null;
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <div className="cursor-pointer">
            <CalendarItem feature={feature} />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {feature.name || 'Unknown Contest'}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{feature.platform || 'Unknown'}</Badge>
                <Badge variant="secondary">{feature.difficulty || 'Medium'}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>{formatTime(feature.startAt)} - {formatTime(feature.endAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4" />
                <span>{timezone}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Duration: {feature.duration || '0h'} 
                {feature.participants && ` | Participants: ${feature.participants.toLocaleString()}`}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button size="sm" className="flex-1">
              Add to Calendar
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Bell className="h-4 w-4 mr-1" />
              Notify Me
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Contest Calendar</h1>
              <p className="text-muted-foreground">
                Stay up to date with programming contests across all platforms
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchContests}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button 
                onClick={syncContests}
                disabled={loading}
                size="sm"
              >
                {loading ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">
                Error loading contests: {error}
              </p>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-card rounded-lg border-border border p-6 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(duration => (
                    <SelectItem key={duration.id} value={duration.id}>
                      {duration.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">EST</SelectItem>
                  <SelectItem value="America/Los_Angeles">PST</SelectItem>
                  <SelectItem value="Europe/London">GMT</SelectItem>
                  <SelectItem value="Asia/Kolkata">IST</SelectItem>
                  <SelectItem value="Asia/Tokyo">JST</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
              <Label htmlFor="notifications">Notifications</Label>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {loading ? (
              'Loading contests from database...'
            ) : (
              `Showing ${filteredContests.length} of ${contests.length} contests from database`
            )}
          </div>
        </div>

        {/* Calendar and Upcoming Contests Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading contests...</p>
            </div>
          </div>
        ) : (
          <div className="sm:flex sm:space-x-4 space-y-4 sm:space-y-0">
            {/* Calendar Section */}
            <div className="">
              <div className="bg-card rounded-lg border-border border shadow-md overflow-hidden max-w-5xl mx-auto lg:mx-0">
                <CalendarProvider>
                  <CalendarDate>
                    <CalendarDatePicker>
                      <CalendarMonthPicker />
                      <CalendarYearPicker start={2024} end={2030} />
                    </CalendarDatePicker>
                    <CalendarDatePagination />
                  </CalendarDate>
                  
                  <CalendarHeader />
                  
                  <div className="min-h-0 flex-1">
                    <CalendarBody features={filteredContests}>
                      {({ feature }) => <ContestItem feature={feature} key={feature.id} />}
                    </CalendarBody>
                  </div>
                </CalendarProvider>
              </div>
            </div>

            {/* Upcoming Contests Sidebar */}
            <div className="md:min-w-[300px]">
              <div className="bg-card rounded-lg border-border border shadow-md  p-4 lg:sticky lg:top-4 h-full">
                <h2 className="text-lg lg:text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5" />
                  Upcoming Contests
                </h2>
                <div className="space-y-3 max-h-[72vh] lg:max-h-[82vh] overflow-y-auto scrollbar-hide">
                  {filteredContests
                    .filter(contest => {
                      const startDate = parseDate(contest.startAt);
                      return startDate && startDate > new Date();
                    })
                    .sort((a, b) => {
                      const dateA = parseDate(a.startAt);
                      const dateB = parseDate(b.startAt);
                      if (!dateA || !dateB) return 0;
                      return dateA - dateB;
                    })
                    .slice(0, 15)
                    .map(contest => (
                      <div key={contest.id} className="bg-muted/50 rounded-lg border-border border p-3 hover:bg-muted/70 transition-colors">
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm leading-tight line-clamp-2">{contest.name || 'Unknown Contest'}</h3>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">{contest.platform || 'Unknown'}</Badge>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{contest.difficulty || 'Medium'}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{formatTime(contest.startAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration: {contest.duration || '0h'}</span>
                            </div>
                            {contest.participants && (
                              <div className="text-xs opacity-75">{contest.participants.toLocaleString()} participants</div>
                            )}
                          </div>
                          <div className="flex gap-1 pt-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs flex-1">
                              <Bell className="h-3 w-3 mr-1" />
                              Notify
                            </Button>
                            <Button size="sm" className="h-7 px-2 text-xs flex-1">
                              Register
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {filteredContests.filter(contest => {
                    const startDate = parseDate(contest.startAt);
                    return startDate && startDate > new Date();
                  }).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming contests found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
