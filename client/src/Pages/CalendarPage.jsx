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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, Globe, Bell, Calendar, Filter, ChevronDown, X, Settings, User, Download, Plus } from 'lucide-react';
// import Navbar from '../Components/Navbar.jsx';
import { useAuth } from '../contexts/AuthContext';
import { addToCalendar, generateGoogleCalendarURL, generateOutlookCalendarURL } from '../utils/calendarUtils';
import { AppSidebar } from '../components/sidebar/app-sidebar.jsx';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Contest platforms
const platforms = [
  { id: 'all', name: 'All Platforms' },
  { id: 'codeforces', name: 'Codeforces' },
  { id: 'codechef', name: 'CodeChef' },
  { id: 'atcoder', name: 'AtCoder' },
  { id: 'leetcode', name: 'LeetCode' },
  { id: 'hackerrank', name: 'HackerRank' },
  { id: 'geeksforgeeks', name: 'GeeksforGeeks' },
  { id: 'code360', name: 'Code360' },
  { id: 'hackerearth', name: 'HackerEarth' },
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

// Notification timing options
const notificationTimes = [
  { id: '15', name: '15 minutes before' },
  { id: '30', name: '30 minutes before' },
  { id: '60', name: '1 hour before' },
  { id: '120', name: '2 hours before' },
  { id: '360', name: '6 hours before' },
  { id: '720', name: '12 hours before' },
  { id: '1440', name: '1 day before' },
  { id: 'custom', name: 'Custom time' }
];

const CalendarPage = () => {
  const { user, isAuthenticated } = useAuth(); // Add auth context
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['all']);
  const [selectedDifficulties, setSelectedDifficulties] = useState(['all']);
  const [selectedDurations, setSelectedDurations] = useState(['all']);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  
  // Notification preferences state
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    enabled: false,
    methods: ['push'],
    platforms: ['all'],
    difficulties: ['all'],
    durations: ['all'],
    reminderTime: '60',
    customTime: '',
    customUnit: 'minutes',
    userHandle: '',
    userName: '',
    personalizedMessages: true
  });

  // Additional state for push notifications
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscription, setPushSubscription] = useState(null);

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
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/contests`, {
        credentials: 'include' // Include cookies
      });
      
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
        method: 'POST',
        credentials: 'include' // Include cookies
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

  // Check if push notifications are supported
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
      initializeServiceWorker();
    }
  }, []);

  // Initialize service worker and check for existing subscription
  const initializeServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        setPushSubscription(subscription);
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  // Load notification preferences on mount and when auth state changes
  useEffect(() => {
    loadNotificationPreferences();
  }, [isAuthenticated]); // Reload when auth state changes

  const loadNotificationPreferences = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/notifications/preferences`, {
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // For authenticated users, use their name from the user object
          const preferences = {
            ...data.data,
            userName: isAuthenticated && user ? user.name : data.data.userName,
            userHandle: isAuthenticated && user ? user.username : data.data.userHandle
          };
          setNotificationPreferences(preferences);
          setNotificationsEnabled(data.data.enabled);
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from server
      const vapidResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/notifications/vapid-public-key`, {
        credentials: 'include' // Include cookies
      });
      const vapidData = await vapidResponse.json();
      
      if (!vapidData.success || !vapidData.publicKey) {
        throw new Error('Unable to get VAPID public key');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey)
      });

      setPushSubscription(subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  };

  // Fetch contests based on selected criteria
  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
      // Ensure contest has valid dates before filtering
      if (!contest.startAt || !contest.endAt) {
        return false;
      }
      
      // Platform filter - handle multiple selections
      const platformMatch = selectedPlatforms.includes('all') || 
        selectedPlatforms.some(platform => contest.platform.toLowerCase() === platform.toLowerCase());
      
      // Difficulty filter - handle multiple selections
      const difficultyMatch = selectedDifficulties.includes('all') || 
        selectedDifficulties.some(difficulty => contest.difficulty === capitalize(difficulty));
      
      // Parse duration more safely - extract hours from duration string
      let durationHours = 0;
      if (contest.durationSeconds) {
        durationHours = contest.durationSeconds / 3600;
      } else if (contest.duration) {
        // Extract hours from duration string like "2h 30m" or "90m"
        const hourMatch = contest.duration.match(/(\d+)h/);
        const minuteMatch = contest.duration.match(/(\d+)m/);
        durationHours = (hourMatch ? parseInt(hourMatch[1]) : 0) + 
                      (minuteMatch ? parseInt(minuteMatch[1]) / 60 : 0);
      }
      
      // Duration filter - handle multiple selections
      const durationMatch = selectedDurations.includes('all') || 
        selectedDurations.some(duration => {
          return (duration === 'short' && durationHours < 2) ||
                 (duration === 'medium' && durationHours >= 2 && durationHours <= 5) ||
                 (duration === 'long' && durationHours > 5);
        });
      
      return platformMatch && difficultyMatch && durationMatch;
    });
  }, [contests, selectedPlatforms, selectedDifficulties, selectedDurations]);

  // Handle platform selection
  const handlePlatformChange = (platformId, checked) => {
    if (platformId === 'all') {
      setSelectedPlatforms(['all']);
    } else {
      setSelectedPlatforms(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (checked) {
          return [...newSelection, platformId];
        } else {
          const filtered = newSelection.filter(id => id !== platformId);
          return filtered.length === 0 ? ['all'] : filtered;
        }
      });
    }
  };

  // Handle difficulty selection
  const handleDifficultyChange = (difficultyId, checked) => {
    if (difficultyId === 'all') {
      setSelectedDifficulties(['all']);
    } else {
      setSelectedDifficulties(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (checked) {
          return [...newSelection, difficultyId];
        } else {
          const filtered = newSelection.filter(id => id !== difficultyId);
          return filtered.length === 0 ? ['all'] : filtered;
        }
      });
    }
  };

  // Handle duration selection
  const handleDurationChange = (durationId, checked) => {
    if (durationId === 'all') {
      setSelectedDurations(['all']);
    } else {
      setSelectedDurations(prev => {
        const newSelection = prev.filter(id => id !== 'all');
        if (checked) {
          return [...newSelection, durationId];
        } else {
          const filtered = newSelection.filter(id => id !== durationId);
          return filtered.length === 0 ? ['all'] : filtered;
        }
      });
    }
  };

  // Get display text for multi-select dropdowns
  const getPlatformDisplayText = () => {
    if (selectedPlatforms.includes('all')) return 'All Platforms';
    if (selectedPlatforms.length === 1) {
      const platform = platforms.find(p => p.id === selectedPlatforms[0]);
      return platform?.name || 'Select platforms';
    }
    return `${selectedPlatforms.length} platforms selected`;
  };

  const getDifficultyDisplayText = () => {
    if (selectedDifficulties.includes('all')) return 'All Difficulties';
    if (selectedDifficulties.length === 1) {
      const difficulty = difficulties.find(d => d.id === selectedDifficulties[0]);
      return difficulty?.name || 'Select difficulties';
    }
    return `${selectedDifficulties.length} difficulties selected`;
  };

  const getDurationDisplayText = () => {
    if (selectedDurations.includes('all')) return 'All Durations';
    if (selectedDurations.length === 1) {
      const duration = durations.find(d => d.id === selectedDurations[0]);
      return duration?.name || 'Select durations';
    }
    return `${selectedDurations.length} durations selected`;
  };

  // Multi-select dropdown component
  const MultiSelectDropdown = ({ items, selectedItems, onItemChange, displayText, placeholder }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span className="truncate">{displayText}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            className="flex items-center space-x-2 cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
            <Checkbox
              id={item.id}
              checked={selectedItems.includes(item.id)}
              onCheckedChange={(checked) => onItemChange(item.id, checked)}
            />
            <label
              htmlFor={item.id}
              className="flex-1 cursor-pointer"
            >
              {item.name}
            </label>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Enhanced ContestItem with error boundaries
  const ContestItem = ({ feature }) => {
    // Validate feature data before rendering
    if (!feature || !feature.startAt || !feature.endAt) {
      return null;
    }

    // Handle add to calendar
    const handleAddToCalendar = (provider) => {
      try {
        addToCalendar(feature, provider);
      } catch (error) {
        console.error('Error adding to calendar:', error);
        setError('Failed to add event to calendar');
      }
    };

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
              <div>
              {feature.url && (

                  <a
                    href={feature.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Visit Contest Page
                  </a>
              )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2   ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="flex-1">
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Calendar
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem 
                  onClick={() => handleAddToCalendar('google')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    Google Calendar
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddToCalendar('outlook')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">O</span>
                    </div>
                    Outlook Calendar
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleAddToCalendar('ics')}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download ICS File
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="flex-1">
              <Bell className="h-4 w-4 mr-1" />
              Notify Me
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Handle notification preferences save
  const handleSaveNotificationPreferences = async () => {
    try {
      console.log('Saving notification preferences:', notificationPreferences);
      
      let subscription = pushSubscription;
      
      // Subscribe to push notifications if not already subscribed
      if (notificationPreferences.methods.includes('push') && !subscription) {
        try {
          subscription = await subscribeToPush();
        } catch (pushError) {
          console.error('Error subscribing to push notifications:', pushError);
          // Continue saving preferences even if push subscription fails
        }
      }

      const requestBody = {
        ...notificationPreferences,
        enabled: true,
        pushSubscription: subscription,
        timezone
      };

      // For authenticated users, use their name and handle from user object
      if (isAuthenticated && user) {
        requestBody.userName = user.name;
        requestBody.userHandle = user.username || '';
      }

      console.log('Sending request body:', requestBody);

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth token if user is authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/notifications/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || 'Failed to save notification preferences');
      }

      const data = await response.json();
      console.log('Success response:', data);
      
      if (data.success) {
        setNotificationsEnabled(true);
        const updatedPreferences = { ...notificationPreferences, enabled: true };
        
        // Update with user data if authenticated
        if (isAuthenticated && user) {
          updatedPreferences.userName = user.name;
          updatedPreferences.userHandle = user.username || '';
        }
        
        setNotificationPreferences(updatedPreferences);
        setShowNotificationDialog(false);
        
        console.log('Notification preferences saved successfully');
      } else {
        throw new Error(data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      setError('Failed to save notification preferences: ' + error.message);
    }
  };

  // Handle notification toggle - FIX: Update to handle disabling properly
  const handleNotificationToggle = async (enabled) => {
    if (enabled) {
      setShowNotificationDialog(true);
    } else {
      // Disable notifications
      setNotificationsEnabled(false);
      setNotificationPreferences(prev => ({ ...prev, enabled: false }));
      
      // Send update to backend to disable notifications
      try {
        const headers = {
          'Content-Type': 'application/json',
        };

        if (isAuthenticated) {
          const token = localStorage.getItem('token');
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        }

        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/notifications/preferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({
            ...notificationPreferences,
            enabled: false,
            timezone
          })
        });
      } catch (error) {
        console.error('Error disabling notifications:', error);
      }
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      console.log('Sending test notification...');
      
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add auth token if user is authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies
      });

      console.log('Test notification response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Test notification sent successfully:', data);
        alert('Test notification sent! Check your browser for the notification.');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Test notification error:', errorData);
        alert('Failed to send test notification: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification: ' + error.message);
    }
  };

  // Utility function to convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Handle notification platform selection
  const handleNotificationPlatformChange = (platformId, checked) => {
    if (platformId === 'all') {
      setNotificationPreferences(prev => ({
        ...prev,
        platforms: ['all']
      }));
    } else {
      setNotificationPreferences(prev => {
        const newSelection = prev.platforms.filter(id => id !== 'all');
        if (checked) {
          return { ...prev, platforms: [...newSelection, platformId] };
        } else {
          const filtered = newSelection.filter(id => id !== platformId);
          return { ...prev, platforms: filtered.length === 0 ? ['all'] : filtered };
        }
      });
    }
  };

  // Handle notification difficulty selection
  const handleNotificationDifficultyChange = (difficultyId, checked) => {
    if (difficultyId === 'all') {
      setNotificationPreferences(prev => ({
        ...prev,
        difficulties: ['all']
      }));
    } else {
      setNotificationPreferences(prev => {
        const newSelection = prev.difficulties.filter(id => id !== 'all');
        if (checked) {
          return { ...prev, difficulties: [...newSelection, difficultyId] };
        } else {
          const filtered = newSelection.filter(id => id !== difficultyId);
          return { ...prev, difficulties: filtered.length === 0 ? ['all'] : filtered };
        }
      });
    }
  };

  // Handle notification duration selection
  const handleNotificationDurationChange = (durationId, checked) => {
    if (durationId === 'all') {
      setNotificationPreferences(prev => ({
        ...prev,
        durations: ['all']
      }));
    } else {
      setNotificationPreferences(prev => {
        const newSelection = prev.durations.filter(id => id !== 'all');
        if (checked) {
          return { ...prev, durations: [...newSelection, durationId] };
        } else {
          const filtered = newSelection.filter(id => id !== durationId);
          return { ...prev, durations: filtered.length === 0 ? ['all'] : filtered };
        }
      });
    }
  };

  // Multi-select dropdown for notifications
  const NotificationMultiSelect = ({ label, items, selectedItems, onItemChange, getDisplayText }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[250px]">
          {items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className="flex items-center space-x-2 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
            >
              <Checkbox
                id={`notification-${item.id}`}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) => onItemChange(item.id, checked)}
              />
              <label
                htmlFor={`notification-${item.id}`}
                className="flex-1 cursor-pointer"
              >
                {item.name}
              </label>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Get display text functions for notification preferences
  const getNotificationPlatformDisplayText = () => {
    if (notificationPreferences.platforms.includes('all')) return 'All Platforms';
    if (notificationPreferences.platforms.length === 1) {
      const platform = platforms.find(p => p.id === notificationPreferences.platforms[0]);
      return platform?.name || 'Select platforms';
    }
    return `${notificationPreferences.platforms.length} platforms selected`;
  };

  const getNotificationDifficultyDisplayText = () => {
    if (notificationPreferences.difficulties.includes('all')) return 'All Difficulties';
    if (notificationPreferences.difficulties.length === 1) {
      const difficulty = difficulties.find(d => d.id === notificationPreferences.difficulties[0]);
      return difficulty?.name || 'Select difficulties';
    }
    return `${notificationPreferences.difficulties.length} difficulties selected`;
  };

  const getNotificationDurationDisplayText = () => {
    if (notificationPreferences.durations.includes('all')) return 'All Durations';
    if (notificationPreferences.durations.length === 1) {
      const duration = durations.find(d => d.id === notificationPreferences.durations[0]);
      return duration?.name || 'Select durations';
    }
    return `${notificationPreferences.durations.length} durations selected`;
  };

  return (
    <div>
    {/* <div className="min-h-screen bg-background"> */}
      {/* <Navbar /> */}
      <AppSidebar variant="inset">
      
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
              <MultiSelectDropdown
                items={platforms}
                selectedItems={selectedPlatforms}
                onItemChange={handlePlatformChange}
                displayText={getPlatformDisplayText()}
                placeholder="Select platforms"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <MultiSelectDropdown
                items={difficulties}
                selectedItems={selectedDifficulties}
                onItemChange={handleDifficultyChange}
                displayText={getDifficultyDisplayText()}
                placeholder="Select difficulties"
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration</Label>
              <MultiSelectDropdown
                items={durations}
                selectedItems={selectedDurations}
                onItemChange={handleDurationChange}
                displayText={getDurationDisplayText()}
                placeholder="Select durations"
              />
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
                onCheckedChange={handleNotificationToggle}
              />
              <Label htmlFor="notifications" className="flex items-center gap-1">
                Notifications
                {/* {isAuthenticated && (
                  <span className="text-xs text-green-600">(User)</span>
                )}
                {!isAuthenticated && (
                  <span className="text-xs text-orange-600">(Session)</span>
                )} */}
              </Label>
              {notificationsEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationDialog(true)}
                  className="ml-2 p-1 h-6 w-6"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2 mb-2">
            {!selectedPlatforms.includes('all') && selectedPlatforms.map(platformId => {
              const platform = platforms.find(p => p.id === platformId);
              return platform ? (
                <Badge key={platformId} variant="secondary" className="flex items-center gap-1">
                  {platform.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handlePlatformChange(platformId, false)}
                  />
                </Badge>
              ) : null;
            })}
            {!selectedDifficulties.includes('all') && selectedDifficulties.map(difficultyId => {
              const difficulty = difficulties.find(d => d.id === difficultyId);
              return difficulty ? (
                <Badge key={difficultyId} variant="secondary" className="flex items-center gap-1">
                  {difficulty.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleDifficultyChange(difficultyId, false)}
                  />
                </Badge>
              ) : null;
            })}
            {!selectedDurations.includes('all') && selectedDurations.map(durationId => {
              const duration = durations.find(d => d.id === durationId);
              return duration ? (
                <Badge key={durationId} variant="secondary" className="flex items-center gap-1">
                  {duration.name}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleDurationChange(durationId, false)}
                  />
                </Badge>
              ) : null;
            })}
          </div>

          <div className="text-sm text-muted-foreground">
            {loading ? (
              'Loading contests from database...'
            ) : (
              `Showing ${filteredContests.length} of ${contests.length} contests from database`
            )}
          </div>
        </div>

        {/* Notification Preferences Dialog */}
        <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </DialogTitle>
              <DialogDescription>
                Configure how and when you want to receive contest notifications
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Notification Methods */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Notification Methods</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="push-notifications"
                    checked={notificationPreferences.methods.includes('push')}
                    disabled={!pushSupported}
                    onCheckedChange={(checked) => {
                      setNotificationPreferences(prev => ({
                        ...prev,
                        methods: checked 
                          ? [...prev.methods.filter(m => m !== 'push'), 'push']
                          : prev.methods.filter(m => m !== 'push')
                      }));
                    }}
                  />
                  <Label htmlFor="push-notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push Notifications
                    {!pushSupported && <span className="text-xs text-muted-foreground">(Not supported)</span>}
                  </Label>
                </div>
              </div>

              {/* Personal Information - Only show for authenticated users or allow editing for anonymous */}
              <div className="space-y-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information (for personalized messages)
                </Label>
                
                {isAuthenticated && user ? (
                  // Show read-only info for authenticated users
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Your Name</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user.name}</span>
                          <Badge variant="outline" className="text-xs">From Account</Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Your Handle</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{user.username || 'Not set'}</span>
                          <Badge variant="outline" className="text-xs">From Account</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your name and handle are automatically taken from your account
                    </p>
                  </div>
                ) : (
                  // Show editable fields for anonymous users
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-name" className="text-xs">Your Name</Label>
                      <Input
                        id="user-name"
                        placeholder="e.g., Ashish"
                        value={notificationPreferences.userName}
                        onChange={(e) => setNotificationPreferences(prev => ({
                          ...prev,
                          userName: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-handle" className="text-xs">Your Handle (optional)</Label>
                      <Input
                        id="user-handle"
                        placeholder="e.g., ashish_dev"
                        value={notificationPreferences.userHandle}
                        onChange={(e) => setNotificationPreferences(prev => ({
                          ...prev,
                          userHandle: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personalized-messages"
                    checked={notificationPreferences.personalizedMessages}
                    onCheckedChange={(checked) => setNotificationPreferences(prev => ({
                      ...prev,
                      personalizedMessages: checked
                    }))}
                  />
                  <Label htmlFor="personalized-messages" className="text-sm">
                    Enable personalized messages
                  </Label>
                </div>
                
                {notificationPreferences.personalizedMessages && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Example message:</p>
                    <p className="text-sm italic">
                      "Hey {
                        isAuthenticated && user 
                          ? user.name 
                          : (notificationPreferences.userName || 'Ashish')
                      }, Codeforces Round 985 starts in 1 hour!"
                    </p>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      💡 <strong>Tip:</strong> Sign in to automatically use your account name and handle for personalized notifications
                    </p>
                  </div>
                )}
              </div>

              {/* Timing Preferences */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Notification Timing</Label>
                <RadioGroup
                  value={notificationPreferences.reminderTime}
                  onValueChange={(value) => setNotificationPreferences(prev => ({
                    ...prev,
                    reminderTime: value
                  }))}
                  className="grid grid-cols-2 gap-2"
                >
                  {notificationTimes.map((time) => (
                    <div key={time.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={time.id} id={time.id} />
                      <Label htmlFor={time.id} className="text-sm cursor-pointer">
                        {time.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {notificationPreferences.reminderTime === 'custom' && (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="custom-time" className="text-xs">Custom Time</Label>
                      <Input
                        id="custom-time"
                        type="number"
                        min="1"
                        placeholder="Enter time"
                        value={notificationPreferences.customTime}
                        onChange={(e) => setNotificationPreferences(prev => ({
                          ...prev,
                          customTime: e.target.value
                        }))}
                      />
                    </div>
                    <Select 
                      value={notificationPreferences.customUnit}
                      onValueChange={(value) => setNotificationPreferences(prev => ({
                        ...prev,
                        customUnit: value
                      }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Platform Filters */}
              <NotificationMultiSelect
                label="Platforms to notify for"
                items={platforms}
                selectedItems={notificationPreferences.platforms}
                onItemChange={handleNotificationPlatformChange}
                getDisplayText={getNotificationPlatformDisplayText}
              />

              {/* Difficulty Filters */}
              <NotificationMultiSelect
                label="Contest Difficulties"
                items={difficulties}
                selectedItems={notificationPreferences.difficulties}
                onItemChange={handleNotificationDifficultyChange}
                getDisplayText={getNotificationDifficultyDisplayText}
              />

              {/* Duration Filters */}
              <NotificationMultiSelect
                label="Contest Durations"
                items={durations}
                selectedItems={notificationPreferences.durations}
                onItemChange={handleNotificationDurationChange}
                getDisplayText={getNotificationDurationDisplayText}
              />

              {/* Test Notification Button */}
              {notificationPreferences.methods.includes('push') && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendTestNotification}
                    disabled={!pushSubscription}
                    className="flex-1"
                  >
                    Send Test Notification
                  </Button>
                </div>
              )}

              {/* Preview */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Notification Preview</Label>
                <div className="space-y-2">
                  <div className="bg-background p-3 rounded border">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="h-4 w-4" />
                      <span className="font-medium text-sm">Contest Reminder</span>
                    </div>
                    <p className="text-sm">
                      {notificationPreferences.personalizedMessages && (
                        isAuthenticated && user 
                          ? `Hey ${user.name}, `
                          : notificationPreferences.userName 
                            ? `Hey ${notificationPreferences.userName}, `
                            : ''
                      )}
                      Codeforces Round 985 starts 
                      {notificationPreferences.reminderTime === 'custom' 
                        ? ` in ${notificationPreferences.customTime} ${notificationPreferences.customUnit}`
                        : ` in ${notificationTimes.find(t => t.id === notificationPreferences.reminderTime)?.name.replace(' before', '') || '1 hour'}`
                      }!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNotificationDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveNotificationPreferences}
                disabled={!notificationPreferences.methods.length}
              >
                Save Preferences
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Calendar and Upcoming Contests Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading contests...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
            {/* Calendar Section */}
            <div className="min-w-0">
              <div className="bg-card rounded-lg border-border border shadow-md overflow-hidden">
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
            <div className="min-w-0">
              <div className="bg-card rounded-lg border-border border shadow-md p-4 h-full max-h-[calc(100vh-70px)] xl:sticky xl:top-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming Contests
                </h2>
                <div className="space-y-3 overflow-y-auto h-full max-h-[calc(100vh-150px)] scrollbar-hide">
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
                            {contest.url && (
                              <div>
                                <a
                                  href={contest.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Visit Contest Page
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 pt-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs flex-1">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-40">
                                <DropdownMenuItem 
                                  onClick={() => addToCalendar(contest, 'google')}
                                  className="cursor-pointer text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                                    Google
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => addToCalendar(contest, 'outlook')}
                                  className="cursor-pointer text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                                    Outlook
                                  </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => addToCalendar(contest, 'ics')}
                                  className="cursor-pointer text-xs"
                                >
                                  <Download className="h-3 w-3" />
                                  ICS File
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" className="h-7 px-2 text-xs flex-1">
                              <Bell className="h-3 w-3 mr-1" />
                              Notify
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
      </AppSidebar>
    </div>
  );
};

export default CalendarPage;
