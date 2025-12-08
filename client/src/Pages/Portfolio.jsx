import { useState, useEffect, useLayoutEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Trophy,
  Target,
  TrendingUp,
  Code,
  Activity,
  MapPin,
  GraduationCap,
  Share2,
  Eye,
  Users,
  CheckCircle,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.jsx"
import { toast } from "sonner"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getMyPortfolio, getPortfolioByUsername, syncAllPlatforms } from "@/services/portfolioService"
import { ProblemDistributionPieChart } from "@/components/ui/problem-distribution-pie-chart"
import { CategoryDistributionPieChart } from "@/components/ui/category-distribution-pie-chart"

// Sync cooldown constants
const SYNC_COOLDOWN_KEY = 'portfolio_last_sync'
const SYNC_COOLDOWN_MS = 15 * 60 * 1000 // 15 minutes

// Skeleton Components
const SkeletonLine = ({ className = "" }) => (
  <div className={`bg-muted animate-pulse rounded ${className}`} />
)

const PortfolioSkeleton = () => (
  <AppSidebar variant="inset">
    <div className="min-h-screen bg-background font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <SkeletonLine className="h-12 w-48 mb-4" />
            <SkeletonLine className="h-6 w-96 max-w-full" />
          </div>
          <SkeletonLine className="h-12 w-32 flex-shrink-0" />
        </div>

        {/* User Profile Skeleton */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
              <svg
                width="128"
                height="128"
                data-jdenticon-value="loading"
                className="rounded-full flex-shrink-0 opacity-30"
              />
              <div className="flex-1 w-full">
                <SkeletonLine className="h-8 w-40 mb-3" />
                <SkeletonLine className="h-6 w-32 mb-4" />
                <SkeletonLine className="h-4 w-full mb-2" />
                <SkeletonLine className="h-4 w-5/6 mb-4" />
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map(i => <SkeletonLine key={i} className="w-6 h-6 rounded-full" />)}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <SkeletonLine className="h-4 w-24 mb-2" />
                    <SkeletonLine className="h-5 w-32" />
                  </div>
                ))}
              </div>
              <div>
                <SkeletonLine className="h-4 w-32 mb-2" />
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => <SkeletonLine key={i} className="h-6 w-20 rounded" />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <SkeletonLine className="h-4 w-24 mb-3" />
              <SkeletonLine className="h-10 w-16 mb-2" />
              <SkeletonLine className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Heatmap Skeleton */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <SkeletonLine className="h-7 w-32" />
              <div className="flex gap-3 w-full sm:w-auto">
                <SkeletonLine className="h-10 w-24 flex-1 sm:flex-none" />
                <SkeletonLine className="h-10 w-32 flex-1 sm:flex-none" />
              </div>
            </div>
          </div>

          {/* Platform Ratings Skeleton */}
          <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
            <SkeletonLine className="h-7 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-muted rounded p-3 flex gap-3">
                  <SkeletonLine className="w-3 h-12 rounded flex-shrink-0" />
                  <div className="flex-1">
                    <SkeletonLine className="h-4 w-24 mb-2" />
                    <SkeletonLine className="h-3 w-32 mb-1" />
                    <SkeletonLine className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rating Progression Skeleton */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm mb-8">
          <SkeletonLine className="h-7 w-48 mb-6" />
          <SkeletonLine className="h-80 w-full rounded" />
        </div>

        {/* Distribution Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
              <SkeletonLine className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="flex justify-between">
                    <SkeletonLine className="h-4 w-20" />
                    <SkeletonLine className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Badges Skeleton */}
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm mb-8">
          <SkeletonLine className="h-7 w-48 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 flex flex-col items-center text-center">
                <SkeletonLine className="w-16 h-16 rounded-full mb-3" />
                <SkeletonLine className="h-4 w-20 mb-2" />
                <SkeletonLine className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Submissions and Topics Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
              <SkeletonLine className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="bg-muted/30 rounded p-3">
                    <SkeletonLine className="h-4 w-32 mb-2" />
                    <SkeletonLine className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AppSidebar>
)

const Portfolio = () => {
  const navigate = useNavigate()
  const { username } = useParams() // Get username from URL params
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedYear, setSelectedYear] = useState("current") // Changed default to "current"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [portfolioData, setPortfolioData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isPublicProfile, setIsPublicProfile] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Check if sync is on cooldown (client-side)
  const canSync = () => {
    const lastSync = localStorage.getItem(SYNC_COOLDOWN_KEY)
    if (!lastSync) return true
    const elapsed = Date.now() - parseInt(lastSync, 10)
    return elapsed >= SYNC_COOLDOWN_MS
  }

  // Get remaining cooldown time in minutes
  const getRemainingCooldown = () => {
    const lastSync = localStorage.getItem(SYNC_COOLDOWN_KEY)
    if (!lastSync) return 0
    const elapsed = Date.now() - parseInt(lastSync, 10)
    const remaining = SYNC_COOLDOWN_MS - elapsed
    return remaining > 0 ? Math.ceil(remaining / 1000 / 60) : 0
  }

  // Background sync function for own profile
  const performBackgroundSync = async () => {
    // Check client-side cooldown first
    if (!canSync()) {
      const remaining = getRemainingCooldown()
      console.log(`Sync on cooldown. ${remaining} minutes remaining.`)
      toast.info('Sync on cooldown', {
        description: `Please wait ${remaining} minutes before syncing again to avoid rate limits.`,
        duration: 5000,
      })
      return
    }

    // Show syncing toast
    const toastId = toast.loading('Syncing your platforms...', {
      description: 'Fetching latest stats in the background. This may take a moment.'
    })

    try {
      console.log('Starting background sync of all platforms...')

      const response = await syncAllPlatforms()

      console.log('Background sync completed:', response)

      // Update last sync time in localStorage
      localStorage.setItem(SYNC_COOLDOWN_KEY, Date.now().toString())

      const syncedPlatforms = response.data?.synced || []
      const failedPlatforms = response.data?.failed || []

      // If any platforms were synced, refresh the portfolio data
      if (response.data?.totalSynced > 0) {
        console.log('Platforms synced, refreshing portfolio data...')
        await fetchPortfolioData(true) // Pass true to indicate silent refresh

        toast.success('Portfolio synced!', {
          id: toastId,
          description: `Updated: ${syncedPlatforms.map(s => s.platform).join(', ')}. Your stats are now up-to-date.`,
          duration: 5000,
        })
      } else if (syncedPlatforms.length === 0 && failedPlatforms.length === 0) {
        toast.info('No platforms to sync', {
          id: toastId,
          description: 'Connect platforms in settings to sync data. Visit your profile settings to link accounts.',
          duration: 5000,
        })
      } else {
        toast.warning('Sync completed with issues', {
          id: toastId,
          description: failedPlatforms.length > 0
            ? `Failed: ${failedPlatforms.map(f => f.platform).join(', ')}. Check your connections or try again later.`
            : 'No new data to sync. Your stats are already current.',
          duration: 5000,
        })
      }
    } catch (err) {
      console.error('Background sync error:', err)

      // Check if it's a rate limit error
      if (err.message?.includes('rate') || err.message?.includes('limit') || err.message?.includes('Sync limit')) {
        toast.error('Sync limit reached', {
          id: toastId,
          description: 'Too many sync requests. Wait 15 minutes before trying again, or check your account limits.',
          duration: 5000,
        })
      } else {
        toast.error('Sync failed', {
          id: toastId,
          description: err.message || 'Could not sync platforms. Ensure you\'re logged in and try again.',
          duration: 5000,
        })
      }
    }
  }

  // Determine if viewing own profile or public profile
  useEffect(() => {
    if (username) {
      // Viewing another user's profile
      setIsPublicProfile(true)
      fetchPortfolioData()
    } else {
      // Viewing own profile - authentication will be checked by API call
      setIsPublicProfile(false)
      fetchPortfolioData().then(() => {
        // Trigger background sync after initial data is loaded
        performBackgroundSync()
      })
    }
  }, [username])

  useLayoutEffect(() => {
    const updateHeight = () => {
      const submissionsCard = document.querySelector('.lg\\:grid-cols-2 > div:first-child');
      if (submissionsCard) {
        const height = submissionsCard.offsetHeight;
        document.documentElement.style.setProperty('--submissions-height', `${height}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [portfolioData]);

  const fetchPortfolioData = async (silentRefresh = false) => {
    try {
      // Only show loading spinner for initial load, not silent refresh
      if (!silentRefresh) {
        setLoading(true)
      }
      setError(null)

      console.log('Fetching portfolio data...', silentRefresh ? '(silent refresh)' : '');
      let response;

      if (username) {
        // Fetch public profile by username
        response = await getPortfolioByUsername(username)
      } else {
        // Fetch authenticated user's profile - cookies will be sent automatically
        response = await getMyPortfolio()
      }

      console.log('Portfolio data received:', response);

      setPortfolioData(response.data)
    } catch (err) {
      console.error("Portfolio fetch error:", err)

      // Only set error for initial load, not silent refresh
      if (!silentRefresh) {
        let errorMessage = err.message || "Failed to load portfolio data";

        // Handle specific error cases
        if (err.message?.includes('401') || err.message?.includes('403') ||
          err.message?.includes('token') || err.message?.includes('Unauthorized') ||
          err.message?.includes('Access token required')) {
          errorMessage = 'Authentication failed. Please login again.';
          // Optionally redirect to login after a delay
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        }

        setError(errorMessage)
      }
    } finally {
      if (!silentRefresh) {
        setLoading(false)
      }
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPortfolioData()
    setRefreshing(false)
  }

  // Show loading state with skeleton
  if (loading) {
    return <PortfolioSkeleton />
  }

  // Show error state with login option
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md bg-card p-8 rounded-lg border border-border">
          <AlertCircle size={48} className="text-destructive mx-auto mb-4" />
          <h2 className="mb-2 font-semibold">Failed to Load Portfolio</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={fetchPortfolioData}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition"
            >
              Try Again
            </button>
            {error.includes('login') && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:opacity-90 transition"
              >
                Go to Home
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Extract data from portfolio response
  const { user, portfolio } = portfolioData || {}

  const userData = {
    profilePic: user?.avatarUrl || "/diverse-group-profile.png",
    username: user?.username || "Unknown",
    fullName: user?.name || "User",
    isVerified: portfolio?.linkedAccounts?.some(acc => acc.isVerified === true) || false,
    verifiedPlatforms: portfolio?.linkedAccounts
      ?.filter(acc => acc.isVerified === true)
      ?.map(acc => acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)) || [],
    bio: user?.bio || "No bio available",
    institution: user?.onboarding?.institution || "Not specified",
    country: user?.onboarding?.country || "Not specified",
    degree: user?.onboarding?.degree || "Not specified",
    profileViews: user?.profileViews || 0,
    lastRefresh: portfolio?.linkedAccounts?.[0]?.lastSynced
      ? new Date(portfolio.linkedAccounts[0].lastSynced).toLocaleString()
      : "Never",
    friends: 0,
    socials: user?.socials || {},
  }

  const platformStats = {}
  portfolio?.linkedAccounts?.forEach(account => {
    platformStats[account.platform] = {
      rating: account.rating || 0,
      maxRating: account.maxRating || 0,
      rank: account.rank || "unrated",
      totalSolved: account.totalSolved || 0,
      color: getPlatformColor(account.platform)
    }
  })

  const overallStats = {
    totalProblems: portfolio?.overallStats?.totalSolved || 0,
    streakCurrent: portfolio?.activityData?.streaks?.current || 0,
    streakMax: portfolio?.activityData?.streaks?.longest || 0,
    activeDays: Object.keys(portfolio?.activityData?.heatmap || {}).length,
    accuracy: parseFloat(portfolio?.overallStats?.acceptanceRate || 0),
    avgAttempts: portfolio?.overallStats?.totalSolved > 0
      ? (portfolio.overallStats.totalSubmissions / portfolio.overallStats.totalSolved).toFixed(1)
      : 0,
    codeMeshRating: portfolio?.codeMeshRating || 0,
  }

  const problemDistribution = {
    easy: portfolio?.overallStats?.difficulty?.easy || 0,
    medium: portfolio?.overallStats?.difficulty?.medium || 0,
    hard: portfolio?.overallStats?.difficulty?.hard || 0,
    expert: portfolio?.overallStats?.difficulty?.expert || 0,
  }

  const categoryDistribution = {
    CP: portfolio?.overallStats?.categories?.cp || 0,
    DSA: portfolio?.overallStats?.categories?.dsa || 0,
    Fundamentals: portfolio?.overallStats?.categories?.fundamentals || 0,
  }

  const allTopicStats = Object.entries(portfolio?.topicDistribution || {})
    .sort(([, a], [, b]) => b - a)
    .map(([topic, solved]) => ({
      topic: formatTopicName(topic),
      solved
    }))

  const topicStats = allTopicStats.slice(0, 5)

  const userBadges = portfolio?.badges || []

  const totalLanguageCount = Object.values(portfolio?.languageStats || {})
    .reduce((sum, count) => sum + count, 0)

  const allLanguages = Object.entries(portfolio?.languageStats || {})
    .sort(([, a], [, b]) => b - a)
    .map(([name, count], index) => ({
      name,
      count,
      percentage: totalLanguageCount > 0 ? Math.round((count / totalLanguageCount) * 100) : 0,
      color: getLanguageColor(index)
    }))

  const topLanguages = allLanguages.slice(0, 4)

  // Helper: Get available years from heatmap data
  const getAvailableYears = () => {
    if (!portfolio?.activityData?.heatmap) return [];

    const dates = Object.keys(portfolio.activityData.heatmap);
    const years = new Set();

    dates.forEach(dateStr => {
      const year = new Date(dateStr).getFullYear();
      if (!isNaN(year)) {
        years.add(year);
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Sort descending
  };

  const availableYears = getAvailableYears();

  const heatmapData = generateHeatmapFromBackend(
    portfolio?.activityData?.heatmap || {},
    selectedYear,
    selectedPlatform,
    portfolio
  )

  const recentSubmissions = []
  portfolio?.linkedAccounts?.forEach(account => {
    const platformStat = portfolio.platformStats?.[account.platform]
    if (platformStat?.recentSubmissions) {
      platformStat.recentSubmissions.forEach(sub => {
        recentSubmissions.push({
          problem: sub.quickAccess?.problemName || "Unknown Problem",
          problemId: sub.quickAccess?.problemId || "",
          platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1),
          platformLower: account.platform,
          status: sub.quickAccess?.verdict || "Unknown",
          language: sub.quickAccess?.language || "Unknown",
          timestamp: sub.quickAccess?.timestamp,
          time: formatTimestamp(sub.quickAccess?.timestamp)
        })
      })
    }
  })

  const recent10Submissions = recentSubmissions
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)


  function getStatusColor(status) {
    const statusColors = {
      'Accepted': 'hsl(var(--chart-1))',
      'OK': 'hsl(var(--chart-1))',
      'Wrong Answer': 'hsl(var(--destructive))',
      'Time Limit Exceeded': 'hsl(var(--chart-2))',
      'Memory Limit Exceeded': 'hsl(var(--chart-2))',
      'Runtime Error': 'hsl(var(--destructive))',
      'Compilation Error': 'hsl(var(--muted-foreground))',
    }
    return statusColors[status] || 'hsl(var(--muted-foreground))'
  }

  function getPlatformColor(platform) {
    const colors = {
      codeforces: "#1f8ef1",
      leetcode: "#ffa116",
      codechef: "#5b4638",
      atcoder: "#3c9d9b",
    }
    return colors[platform] || "#888888"
  }

  function formatTopicName(topic) {
    return topic.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return "Unknown"
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  function getLanguageColor(index) {
    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--secondary))",
      "hsl(var(--accent))",
      "hsl(var(--chart-4))"
    ]
    return colors[index] || "hsl(var(--muted))"
  }

  function generateHeatmapFromBackend(heatmap, yearOption, platform, portfolio) {
    let startDate, endDate;

    if (yearOption === "current") {
      // Show last 365 days ending TODAY (not last Sunday)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // End date is today
      endDate = today;

      // Start date is 364 days before (365 days total including end date)
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 364);
    } else {
      // Show specific year
      const year = parseInt(yearOption);
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    // Filter heatmap by platform
    let filteredHeatmap = heatmap;
    if (platform !== "all" && portfolio?.platformStats?.[platform]?.heatmap) {
      // Use platform-specific heatmap
      filteredHeatmap = portfolio.platformStats[platform].heatmap;
    }

    // Generate data array chronologically
    const data = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      data.push({
        date: dateKey,
        count: filteredHeatmap[dateKey] || 0,
        dayOfWeek: d.getDay() // 0 (Sunday) to 6 (Saturday)
      });
    }

    // Organize data into weeks (columns)
    const weeks = [];
    let currentWeek = [];

    // Pad the beginning if the first date is not a Sunday
    const firstDayOfWeek = data[0]?.dayOfWeek || 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: null, count: 0, isEmpty: true });
    }

    // Fill in the actual data
    data.forEach(day => {
      currentWeek.push(day);

      // If we've completed a week (Saturday), start a new week
      if (day.dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add the last incomplete week if it exists
    if (currentWeek.length > 0) {
      // Pad the end to complete the week
      while (currentWeek.length < 7) {
        currentWeek.push({ date: null, count: 0, isEmpty: true });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  }

  // Components
  const StatCard = ({ title, value, icon: Icon, subtitle, trend }) => (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <Icon size={20} className="text-muted-foreground" />
      </div>
      <div className="text-3xl font-bold text-foreground mb-1">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend && <TrendingUp size={12} className="text-primary" />}
          {subtitle}
        </p>
      )}
    </div>
  )

  const PlatformCard = ({ platform, data }) => (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: data.color }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold capitalize">{platform}</div>
        <div className="text-sm text-muted-foreground">
          {data.rating} • {data.rank}
        </div>
        <div className="text-xs text-muted-foreground">
          Solved: {data.totalSolved}
        </div>
      </div>
    </div>
  )

  const TopicBar = ({ topic, solved }) => {
    const maxSolved = Math.max(...allTopicStats.map(t => t.solved), 1)
    const percentage = (solved / maxSolved) * 100

    return (
      <div className="mb-4 last:mb-0">
        <div className="flex justify-between mb-2 text-sm">
          <span>{topic}</span>
          <span className="text-muted-foreground">{solved}</span>
        </div>
        <div className="w-full h-2 bg-muted rounded overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  // Helper: convert count to 0..4 bucket (GitHub-style)
  const toLevel = (count, max = 8) => {
    if (count <= 0) return 0;
    if (count <= Math.max(1, Math.ceil(max * 0.25))) return 1;
    if (count <= Math.max(2, Math.ceil(max * 0.50))) return 2;
    if (count <= Math.max(3, Math.ceil(max * 0.75))) return 3;
    return 4;
  }

  // Calculate max count for the current heatmap data (flatten weeks array)
  const maxCount = Math.max(1, ...heatmapData.flat().map(d => d.count || 0));

  const HeatmapCell = ({ count, date, index, isEmpty }) => {
    if (isEmpty) {
      return <div className="gh-cell gh-l0" style={{ opacity: 0 }} />;
    }

    const level = toLevel(count, maxCount);

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`gh-cell gh-l${level}`}
            role="button"
            aria-label={`${count} problems solved on ${date}`}
            tabIndex={0}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold text-sm">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className="text-xs text-muted-foreground">
              {count} problem{count !== 1 ? 's' : ''} solved
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  const generateRatingChartData = () => {
    if (!portfolio?.ratingProgression || portfolio.ratingProgression.length === 0) {
      return { dates: [], datasets: [] };
    }

    const allRatings = [];

    portfolio.ratingProgression.forEach(platformProgress => {
      const platform = platformProgress.platform;
      const color = getPlatformColor(platform);

      platformProgress.history.forEach(rating => {
        allRatings.push({
          date: new Date(rating.date),
          platform,
          rating: rating.newRating,
          contestName: rating.contestName,
          change: rating.change,
          color
        });
      });
    });

    allRatings.sort((a, b) => a.date - b.date);

    const platformDatasets = {};

    portfolio.ratingProgression.forEach(platformProgress => {
      const platform = platformProgress.platform;
      platformDatasets[platform] = {
        platform,
        color: getPlatformColor(platform),
        data: []
      };
    });

    const allDates = [...new Set(allRatings.map(r => r.date.getTime()))].sort();

    allDates.forEach(timestamp => {
      const date = new Date(timestamp);

      Object.keys(platformDatasets).forEach(platform => {
        const platformRatings = allRatings.filter(r =>
          r.platform === platform && r.date.getTime() <= timestamp
        );

        if (platformRatings.length > 0) {
          const latestRating = platformRatings[platformRatings.length - 1];
          platformDatasets[platform].data.push({
            date,
            rating: latestRating.rating,
            contestName: latestRating.contestName
          });
        }
      });
    });

    return {
      datasets: Object.values(platformDatasets).filter(ds => ds.data.length > 0)
    };
  };

  const ratingChartData = generateRatingChartData();

  // New: Highcharts-based rating chart (animated, theme-aware)
  const HighchartsRatingChart = ({ datasets }) => {
    const containerRef = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);
    const [isDark, setIsDark] = useState(
      typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    // Watch for theme changes
    useEffect(() => {
      const checkTheme = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
      };

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            checkTheme();
          }
        });
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      return () => observer.disconnect();
    }, []);

    // Intersection Observer for scroll-based animation
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
              setHasAnimated(true);
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [hasAnimated]);

    useEffect(() => {
      let chart;
      let destroyed = false;
      const el = containerRef.current;
      if (!el || !hasAnimated) return;

      const loadHighcharts = () =>
        new Promise((resolve, reject) => {
          if (window.Highcharts) return resolve(window.Highcharts);
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/highcharts/11.4.0/highcharts.min.js";
          s.async = true;
          s.onload = () => resolve(window.Highcharts);
          s.onerror = reject;
          document.head.appendChild(s);
        });

      const hslVar = (name) => {
        const v = getComputedStyle(el).getPropertyValue(name).trim();
        return v ? `hsl(${v})` : undefined;
      };

      const renderChart = (Highcharts) => {
        // Plugin: animate line draw + axis transitions (as provided)
        (function (H) {
          const animateSVGPath = (svgElem, animation, callback = void 0) => {
            if (!svgElem || !svgElem.element || !svgElem.element.getTotalLength) return;
            const length = svgElem.element.getTotalLength();
            svgElem.attr({
              'stroke-dasharray': length,
              'stroke-dashoffset': length,
              opacity: 1
            });
            svgElem.animate({
              'stroke-dashoffset': 0
            }, animation, callback);
          };

          // Hook into line series animate for path drawing animation
          if (H.seriesTypes.line && !H.seriesTypes.line.prototype.__codemeshAnimateHooked) {
            H.seriesTypes.line.prototype.animate = function (init) {
              const series = this;
              const animation = H.animObject(series.options.animation);

              if (!init && series.graph) {
                animateSVGPath(series.graph, animation);
              }
            };
            H.seriesTypes.line.prototype.__codemeshAnimateHooked = true;
          }

          // Hook into spline series (inherits from line but may override)
          if (H.seriesTypes.spline && !H.seriesTypes.spline.prototype.__codemeshAnimateHooked) {
            H.seriesTypes.spline.prototype.animate = function (init) {
              const series = this;
              const animation = H.animObject(series.options.animation);

              if (!init && series.graph) {
                animateSVGPath(series.graph, animation);
              }
            };
            H.seriesTypes.spline.prototype.__codemeshAnimateHooked = true;
          }

          // Axis animation on first render
          if (!H.__codemeshAxisHooked) {
            H.addEvent(H.Axis, 'afterRender', function () {
              const axis = this;
              const chart = axis.chart;
              const animation = H.animObject(chart.renderer.globalAnimation);

              if (axis.axisGroup && !axis.axisGroup.__animated) {
                axis.axisGroup
                  .attr({
                    opacity: 0,
                    rotation: -3,
                    scaleY: 0.9
                  })
                  .animate({
                    opacity: 1,
                    rotation: 0,
                    scaleY: 1
                  }, animation);
                axis.axisGroup.__animated = true;
              }

              if (axis.labelGroup && !axis.labelGroup.__animated) {
                if (axis.horiz) {
                  axis.labelGroup
                    .attr({
                      opacity: 0,
                      rotation: 3,
                      scaleY: 0.5
                    })
                    .animate({
                      opacity: 1,
                      rotation: 0,
                      scaleY: 1
                    }, animation);
                } else {
                  axis.labelGroup
                    .attr({
                      opacity: 0,
                      rotation: 3,
                      scaleX: -0.5
                    })
                    .animate({
                      opacity: 1,
                      rotation: 0,
                      scaleX: 1
                    }, animation);
                }
                axis.labelGroup.__animated = true;
              }
            });
            H.__codemeshAxisHooked = true;
          }
        })(Highcharts);

        const bg = hslVar('--card') || '#fff';
        const fg = hslVar('--foreground') || '#111';
        const border = hslVar('--border') || '#e5e7eb';
        const muted = hslVar('--muted-foreground') || '#6b7280';
        const tooltipBg = hslVar('--card') || '#fff';
        const tooltipBorder = border;

        const series = datasets.map((ds, idx) => ({
          type: 'spline',
          name: ds.platform.charAt(0).toUpperCase() + ds.platform.slice(1),
          data: ds.data.map(p => [p.date.getTime(), p.rating]),
          color: getPlatformColor(ds.platform),
          marker: { enabled: true, radius: 3 },
          lineWidth: 2,
          animation: {
            duration: 1000,
            defer: idx * 1000
          }
        }));

        chart = Highcharts.chart(el, {
          chart: {
            backgroundColor: bg,
            style: {
              fontFamily:
                getComputedStyle(document.documentElement).getPropertyValue('--font-sans') ||
                'Poppins, ui-sans-serif, system-ui, sans-serif'
            }
          },
          title: { text: '', align: 'left' },
          subtitle: { text: '', align: 'left' },
          credits: { enabled: false },
          xAxis: {
            type: 'datetime',
            lineColor: border,
            tickColor: border,
            labels: { style: { color: muted } }
          },
          yAxis: {
            title: { text: 'Rating', style: { color: fg } },
            gridLineColor: border,
            labels: { style: { color: muted } }
          },
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            itemStyle: { color: fg },
            itemHoverStyle: { color: fg }
          },
          tooltip: {
            shared: true,
            xDateFormat: '%b %e, %Y',
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            style: { color: fg }
          },
          plotOptions: {
            series: {
              animation: { duration: 1000 },
              label: { connectorAllowed: false }
            }
          },
          series,
          responsive: {
            rules: [{
              condition: { maxWidth: 768 },
              chartOptions: {
                legend: {
                  layout: 'horizontal',
                  align: 'center',
                  verticalAlign: 'bottom'
                }
              }
            }]
          }
        });
      };

      loadHighcharts()
        .then((H) => { if (!destroyed) renderChart(H); })
        .catch(() => { /* noop */ });

      return () => { destroyed = true; if (chart) chart.destroy(); };
    }, [datasets, hasAnimated, isDark]);

    if (!datasets || datasets.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No rating history available yet.</p>
          <p className="text-sm">Participate in contests to see your rating progression!</p>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full overflow-x-auto rounded-lg min-h-[300px] flex items-center justify-center">
        {!hasAnimated && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading chart...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div>
        <AppSidebar variant="inset">
          <div className="min-h-screen bg-background font-sans p-4 md:p-8 text-foreground">
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
                  <p className="text-muted-foreground">
                    Welcome back, {userData.fullName}! Here's your coding journey overview.
                  </p>
                </div>
              </div>

              {/* Refresh Button */}
              {/* <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium hover:opacity-90 transition disabled:opacity-60 flex-shrink-0 mb-8"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button> */}

              {/* User Profile Section (updated) */}
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Avatar + identity + socials */}
                  <div className="flex-1 lg:max-w-[40%]">
                    <div className="flex flex-col gap-5">
                      {/* Avatar and Name Row */}
                      <div className="flex flex-row items-start gap-4 sm:gap-6">
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-xl ring-2 ring-primary/20 flex-shrink-0 shadow-sm">
                          <AvatarImage
                            src={userData.profilePic && userData.profilePic !== "/diverse-group-profile.png" ? userData.profilePic : undefined}
                            alt={userData.username}
                            className="object-cover"
                          />
                          <AvatarFallback username={userData.username} className="rounded-xl" />
                        </Avatar>
                        <div className="flex-1 min-w-0 py-1">
                          {/* Full Name */}
                          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight text-foreground mb-1 break-words">
                            {userData.fullName || userData.username}
                          </h2>

                          {/* Username */}
                          <p className="text-sm sm:text-base text-muted-foreground font-medium mb-3 truncate">
                            @{userData.username}
                          </p>

                          {/* Verification Badge */}
                          <div className="mb-2">
                            {userData.isVerified ? (
                              <Badge className="gap-1" variant="secondary" title="Verified">
                                <CheckCircle size={13} /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs" title="Not verified">
                                Unverified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3">
                        {userData.bio === "No bio available" ? (
                          <span className="italic">No bio provided.</span>
                        ) : (
                          userData.bio
                        )}
                      </p>

                      <Separator />

                      {/* Social Links */}
                      <div className="flex flex-wrap items-center gap-2">
                        {userData.socials?.github && (
                          <Button asChild variant="ghost" size="icon" title="GitHub" aria-label="GitHub">
                            <a href={userData.socials.github} target="_blank" rel="noopener noreferrer">
                              <Github className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {userData.socials?.linkedin && (
                          <Button asChild variant="ghost" size="icon" title="LinkedIn" aria-label="LinkedIn">
                            <a href={userData.socials.linkedin} target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {userData.socials?.twitter && (
                          <Button asChild variant="ghost" size="icon" title="Twitter" aria-label="Twitter">
                            <a href={userData.socials.twitter} target="_blank" rel="noopener noreferrer">
                              <Twitter className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        {userData.socials?.website && (
                          <Button asChild variant="ghost" size="icon" title="Website" aria-label="Website">
                            <a href={userData.socials.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/portfolio/${userData.username}`;
                            navigator.clipboard.writeText(url);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }}
                          className="ml-1"
                          title="Copy profile link"
                        >
                          {isCopied ? <CheckCircle className="mr-1 h-4 w-4" /> : <Share2 className="mr-1 h-4 w-4" />}
                          {isCopied ? "Copied!" : "Share profile"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator orientation="vertical" className="hidden lg:block" />

                  {/* Right: Key details + platform attachment state */}
                  <div className="flex-1 min-w-0">
                    {/* Key facts grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
                          <GraduationCap size={16} /> Institution
                        </div>
                        <p
                          className={`font-medium truncate ${userData.institution === "Not specified" ? "text-muted-foreground italic" : ""
                            }`}
                        >
                          {userData.institution}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
                          <MapPin size={16} /> Country
                        </div>
                        <p
                          className={`font-medium truncate ${userData.country === "Not specified" ? "text-muted-foreground italic" : ""
                            }`}
                        >
                          {userData.country}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
                          <Users size={16} /> Degree
                        </div>
                        <p
                          className={`font-medium truncate ${userData.degree === "Not specified" ? "text-muted-foreground italic" : ""
                            }`}
                        >
                          {userData.degree}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
                          <Activity size={16} /> Last refresh
                        </div>
                        <p className="font-medium truncate">{userData.lastRefresh}</p>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Counters */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge variant="outline" className="gap-1">
                        <Eye size={14} /> {userData.profileViews.toLocaleString()} views
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users size={14} /> {userData.friends} friends
                      </Badge>
                    </div>

                    {/* Platforms attachment status */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Platforms</p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          const supported = ["leetcode", "codeforces", "codechef", "atcoder"];
                          const linked = (portfolio?.linkedAccounts || []).map((a) => a.platform);
                          return supported.map((p) => {
                            const isLinked = linked.includes(p);
                            const isVerified =
                              !!portfolio?.linkedAccounts?.find((a) => a.platform === p && a.isVerified);
                            const label = p.charAt(0).toUpperCase() + p.slice(1);
                            return (
                              <Badge
                                key={p}
                                variant={isLinked ? (isVerified ? "default" : "secondary") : "outline"}
                                className="capitalize"
                              >
                                {label} {isLinked ? (isVerified ? "• Verified" : "• Connected") : "• Not linked"}
                              </Badge>
                            );
                          });
                        })()}
                        {portfolio?.linkedAccounts && portfolio.linkedAccounts.length === 0 && (
                          <span className="text-sm text-muted-foreground">No platforms connected yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <StatCard
                  title="CodeMesh Rating"
                  value={overallStats.codeMeshRating}
                  icon={Trophy}
                  subtitle="Unified Rating"
                  trend={true}
                />
                <StatCard
                  title="Total Problems"
                  value={overallStats.totalProblems.toLocaleString()}
                  icon={Code}
                  subtitle="Across all platforms"
                />
                <StatCard
                  title="Current Streak"
                  value={`${overallStats.streakCurrent} days`}
                  icon={Activity}
                  subtitle={`Max: ${overallStats.streakMax} days`}
                  trend={overallStats.streakCurrent > 0}
                />
                <StatCard
                  title="Accuracy"
                  value={`${overallStats.accuracy}%`}
                  icon={Target}
                  subtitle={`Avg ${overallStats.avgAttempts} attempts/solve`}
                />
              </div>

              {/* Heatmap - Full Width */}
              <div className="mb-8">
                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h3 className="text-xl md:text-2xl font-semibold">Activity Heatmap</h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="current">Current (Last 365 Days)</option>
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="all">All Platforms</option>
                        {Object.keys(platformStats).map(platform => (
                          <option key={platform} value={platform}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* GitHub-style Heatmap Grid - Week columns */}
                  <div className="overflow-x-auto mb-6 -mx-2 px-2 scrollbar-hide">
                    <div className="flex gap-1">
                      {/* Day labels on the left */}
                      <div className="flex flex-col justify-between pr-2 pt-5 text-[10px] text-muted-foreground">
                        <span>Sun</span>

                        <span>Tue</span>

                        <span>Thu</span>

                        <span>Sat</span>
                      </div>

                      <div className="flex-1">
                        {/* Month labels at the top */}
                        <div className="flex mb-1 text-xs text-muted-foreground h-4">
                          {heatmapData.map((week, weekIndex) => {
                            const firstDate = week.find(day => !day.isEmpty)?.date;
                            if (!firstDate) return <div key={weekIndex} className="flex-1" />;

                            const date = new Date(firstDate);
                            const monthName = date.toLocaleString('default', { month: 'short' });

                            // Only show month labels for weeks after the first (to avoid labeling partial oldest months)
                            // and only if the week starts early in the month (day <= 7)
                            const isFirstWeekOfMonth = weekIndex > 0 &&
                              (week[0] && week[0].date && new Date(week[0].date).getDate() <= 7);

                            return (
                              <div key={weekIndex} className="flex-1 text-left">
                                {isFirstWeekOfMonth ? monthName : ''}
                              </div>
                            );
                          })}
                        </div>

                        {/* Heatmap grid */}
                        <div className="flex gap-1">
                          {heatmapData.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                              {week.map((day, dayIndex) => (
                                <HeatmapCell
                                  key={`${weekIndex}-${dayIndex}`}
                                  count={day.count}
                                  date={day.date}
                                  index={weekIndex * 7 + dayIndex}
                                  isEmpty={day.isEmpty}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      <span className="text-muted-foreground">
                        {heatmapData.flat().filter(d => !d.isEmpty && d.count > 0).length} active days
                      </span>
                      <span className="text-muted-foreground">
                        Total submissions: {heatmapData.flat().reduce((sum, d) => sum + (d.count || 0), 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Less</span>
                      <div className="gh-legend">
                        <span className="gh-dot gh-l0" />
                        <span className="gh-dot gh-l1" />
                        <span className="gh-dot gh-l2" />
                        <span className="gh-dot gh-l3" />
                        <span className="gh-dot gh-l4" />
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Progression Chart with Platform Ratings */}
              {ratingChartData.datasets.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                  {/* Rating Progression - 2/3 width */}
                  <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3 className="text-xl md:text-2xl font-semibold">
                        Rating Progression
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp size={16} />
                        <span>All-time rating history across platforms</span>
                      </div>
                    </div>
                    {/* Replaced old SVG chart with Highcharts */}
                    <HighchartsRatingChart datasets={ratingChartData.datasets} />
                  </div>

                  {/* Platform Ratings - 1/3 width */}
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                    <h3 className="text-xl md:text-2xl font-semibold mb-4">Platform Ratings</h3>
                    <div className="flex flex-col gap-3 max-h-full overflow-y-auto scrollbar-hide">
                      {Object.keys(platformStats).length > 0 ? Object.entries(platformStats).map(([platform, data]) => (
                        <PlatformCard key={platform} platform={platform} data={data} />
                      )) : (
                        <p className="text-muted-foreground text-center py-8">
                          No platforms connected yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Distribution, Categories, Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                {/* Problem Distribution - Pie Chart */}
                <ProblemDistributionPieChart distribution={problemDistribution} />

                {/* Category Distribution - Pie Chart */}
                <CategoryDistributionPieChart distribution={categoryDistribution} />

                {/* Languages Used */}
                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg md:text-xl font-semibold mb-4">
                    Languages Used ({allLanguages.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                    {allLanguages.length > 0 ? allLanguages.map((lang) => (
                      <div key={lang.name}>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>{lang.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {lang.count} ({lang.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                          />
                        </div>
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-4 text-sm">
                        No language data available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              {userBadges.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm mb-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-xl md:text-2xl font-semibold">
                      Badges & Achievements
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {userBadges.length} total
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {userBadges.map((badge, index) => (
                      <Tooltip key={`${badge.platform}-${badge.id || index}`}>
                        <TooltipTrigger asChild>
                          <div
                            className="bg-muted/30 border border-border rounded-lg p-4 flex flex-col items-center text-center transition hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                          >
                            {/* Badge Icon */}
                            {badge.iconUrl ? (
                              <img
                                src={badge.iconUrl}
                                alt={badge.name}
                                className="w-16 h-16 mb-3 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}

                            {/* Fallback icon */}
                            <div
                              className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3 text-2xl font-bold text-primary-foreground"
                              style={{ display: badge.iconUrl ? 'none' : 'flex' }}
                            >
                              {badge.name?.charAt(0) || "🏆"}
                            </div>

                            {/* Badge Info */}
                            <h4 className="text-sm font-semibold mb-1">
                              {badge.name}
                            </h4>

                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {badge.description}
                            </p>

                            {/* Platform Tag */}
                            <span className={`text-xs px-2 py-1 rounded font-medium mb-2 capitalize ${badge.platform === 'leetcode' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
                                badge.platform === 'codeforces' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                                  badge.platform === 'codechef' ? 'bg-orange-900/10 text-orange-800 dark:text-orange-300' :
                                    'bg-muted text-muted-foreground'
                              }`}>
                              {badge.platform}
                            </span>

                            <span className="text-[10px] text-muted-foreground">
                              {new Date(badge.earnedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs text-center">
                            <p className="font-semibold mb-1">{badge.name}</p>
                            <p className="text-sm text-muted-foreground">{badge.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">Earned on {new Date(badge.earnedAt).toLocaleDateString()}</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Submissions and Topics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 lg:items-start">
                {/* Recent 10 Submissions */}
                {recent10Submissions.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h3 className="text-lg md:text-xl font-semibold">
                        Recent Submissions
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        Last 10
                      </span>
                    </div>
                    <div className="space-y-2">
                      {recent10Submissions.map((submission, index) => (
                        <div
                          key={`${submission.platform}-${submission.problemId}-${index}`}
                          className="bg-muted/30 border border-border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:shadow-md hover:translate-x-1"
                        >
                          {/* Problem Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate mb-1">
                              {submission.problem}
                            </h4>
                            <div className="flex gap-2 flex-wrap text-xs">
                              <span
                                className="px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${getPlatformColor(submission.platformLower)}20`,
                                  color: getPlatformColor(submission.platformLower)
                                }}
                              >
                                {submission.platform}
                              </span>
                              <span className="text-muted-foreground">
                                {submission.language}
                              </span>
                            </div>
                          </div>

                          {/* Status and Time */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span
                              className="text-xs px-2 py-1 rounded font-semibold"
                              style={{
                                backgroundColor: `${getStatusColor(submission.status)}20`,
                                color: getStatusColor(submission.status)
                              }}
                            >
                              {submission.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {submission.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Topics */}
                {allTopicStats.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm flex flex-col lg:h-[var(--submissions-height)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 flex-shrink-0">
                      <h3 className="text-lg md:text-xl font-semibold">
                        All Topics
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {allTopicStats.length} topics
                      </span>
                    </div>

                    <div className="space-y-4 overflow-y-auto scrollbar-hide flex-1 min-h-0">
                      {allTopicStats.map((topic) => (
                        <TopicBar key={topic.topic} {...topic} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AppSidebar>
      </div>
    </TooltipProvider>
  )
}

export default Portfolio

function getChartColor(label) {
  switch (label) {
    case 'easy':
      return 'bg-chart-1'
    case 'medium':
      return 'bg-chart-2'
    case 'hard':
      return 'bg-chart-3'
    case 'expert':
      return 'bg-chart-5'
    default:
      return 'bg-muted'
  }
}

function getCategoryColor(label) {
  switch (label) {
    case 'CP':
      return 'bg-primary'
    case 'DSA':
      return 'bg-secondary'
    case 'Fundamentals':
      return 'bg-accent'
    default:
      return 'bg-muted'
  }
}
