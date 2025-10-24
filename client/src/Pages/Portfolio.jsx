import { useState, useEffect, useLayoutEffect } from "react"
import { useNavigate } from "react-router-dom"
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
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { getMyPortfolio } from "@/services/portfolioService"

const Portfolio = () => {
  const navigate = useNavigate()
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [portfolioData, setPortfolioData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    sessionStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        setError('Please login to view your portfolio');
        setLoading(false);
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      fetchPortfolioData();
    }
  }, [])

  
  // Fetch portfolio data on mount
  useEffect(() => {
    fetchPortfolioData()
  }, [])

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

  const fetchPortfolioData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching portfolio data...');
      const response = await getMyPortfolio()
      console.log('Portfolio data received:', response);
      
      setPortfolioData(response.data)
    } catch (err) {
      console.error("Portfolio fetch error:", err)
      
      let errorMessage = err.message || "Failed to load portfolio data";
      
      // Handle specific error cases
      if (err.message?.includes('401') || err.message?.includes('403') || 
          err.message?.includes('token') || err.message?.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please login again.';
        // Optionally redirect to login after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (err.message?.includes('Network Error') || err.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPortfolioData()
    setRefreshing(false)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    )
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
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:opacity-90 transition"
              >
                Go to Login
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
    college: user?.college || "Not specified",
    location: user?.location || "Not specified",
    nationality: user?.nationality || "Not specified",
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
    .sort(([,a], [,b]) => b - a)
    .map(([topic, solved]) => ({
      topic: formatTopicName(topic),
      solved
    }))

  const topicStats = allTopicStats.slice(0, 5)

  const userBadges = portfolio?.badges || []

  const totalLanguageCount = Object.values(portfolio?.languageStats || {})
    .reduce((sum, count) => sum + count, 0)

  const allLanguages = Object.entries(portfolio?.languageStats || {})
    .sort(([,a], [,b]) => b - a)
    .map(([name, count], index) => ({
      name,
      count,
      percentage: totalLanguageCount > 0 ? Math.round((count / totalLanguageCount) * 100) : 0,
      color: getLanguageColor(index)
    }))

  const topLanguages = allLanguages.slice(0, 4)

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
    

  function getDefaultAvatar(name) {
    return name ? name.charAt(0).toUpperCase() : 'U'
  }

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

  function generateHeatmapFromBackend(heatmap, year, platform, portfolio) {
    const data = []
    const startDate = new Date(parseInt(year), 0, 1)
    const endDate = new Date(parseInt(year), 11, 31)
    
    let filteredHeatmap = heatmap
    if (platform !== "all" && portfolio?.platformStats?.[platform]) {
      filteredHeatmap = heatmap
    }
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0]
      data.push({
        date: dateKey,
        count: filteredHeatmap[dateKey] || 0
      })
    }
    
    return data
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

  const HeatmapCell = ({ count, date }) => {
    const getIntensity = (count) => {
      if (count === 0) return "bg-muted"
      if (count <= 2) return "bg-primary/30"
      if (count <= 4) return "bg-primary/60"
      if (count <= 6) return "bg-primary/80"
      return "bg-primary"
    }

    return (
      <div
        className={`w-3 h-3 ${getIntensity(count)} rounded-sm m-0.5 cursor-pointer hover:ring-2 hover:ring-primary transition`}
        title={`${date}: ${count} problems solved`}
      />
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

  const RatingChart = ({ datasets }) => {
    if (!datasets || datasets.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>No rating history available yet.</p>
          <p className="text-sm">Participate in contests to see your rating progression!</p>
        </div>
      );
    }

    let minRating = Infinity;
    let maxRating = -Infinity;
    
    datasets.forEach(dataset => {
      dataset.data.forEach(point => {
        minRating = Math.min(minRating, point.rating);
        maxRating = Math.max(maxRating, point.rating);
      });
    });

    const ratingRange = maxRating - minRating;
    const padding = Math.max(ratingRange * 0.1, 100);
    minRating = Math.floor((minRating - padding) / 100) * 100;
    maxRating = Math.ceil((maxRating + padding) / 100) * 100;

    const chartWidth = 800;
    const chartHeight = 400;
    const paddingLeft = 60;
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 60;
    
    const graphWidth = chartWidth - paddingLeft - paddingRight;
    const graphHeight = chartHeight - paddingTop - paddingBottom;

    let minDate = new Date(Math.min(...datasets.flatMap(ds => ds.data.map(d => d.date.getTime()))));
    let maxDate = new Date(Math.max(...datasets.flatMap(ds => ds.data.map(d => d.date.getTime()))));

    const scaleX = (date) => {
      const timeDiff = date.getTime() - minDate.getTime();
      const totalTime = maxDate.getTime() - minDate.getTime();
      return paddingLeft + (timeDiff / totalTime) * graphWidth;
    };

    const scaleY = (rating) => {
      const ratingDiff = maxRating - rating;
      const totalRating = maxRating - minRating;
      return paddingTop + (ratingDiff / totalRating) * graphHeight;
    };

    const generatePath = (data) => {
      if (data.length === 0) return "";
      
      let path = `M ${scaleX(data[0].date)} ${scaleY(data[0].rating)}`;
      
      for (let i = 1; i < data.length; i++) {
        path += ` L ${scaleX(data[i].date)} ${scaleY(data[i].rating)}`;
      }
      
      return path;
    };

    const yAxisSteps = 5;
    const yAxisLabels = [];
    for (let i = 0; i <= yAxisSteps; i++) {
      const rating = minRating + ((maxRating - minRating) * i / yAxisSteps);
      yAxisLabels.push(Math.round(rating));
    }

    const xAxisSteps = 6;
    const xAxisLabels = [];
    for (let i = 0; i <= xAxisSteps; i++) {
      const time = minDate.getTime() + ((maxDate.getTime() - minDate.getTime()) * i / xAxisSteps);
      const date = new Date(time);
      xAxisLabels.push({
        date,
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      });
    }

    return (
      <div className="w-full overflow-x-auto">
        <svg 
          width={chartWidth} 
          height={chartHeight}
          className="bg-card rounded-lg font-sans min-w-full"
        >
          {/* Grid lines */}
          {yAxisLabels.map((rating, i) => (
            <g key={`grid-y-${i}`}>
              <line
                x1={paddingLeft}
                y1={scaleY(rating)}
                x2={chartWidth - paddingRight}
                y2={scaleY(rating)}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={paddingLeft - 10}
                y={scaleY(rating)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="12"
              >
                {rating}
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {xAxisLabels.map((item, i) => (
            <g key={`grid-x-${i}`}>
              <line
                x1={scaleX(item.date)}
                y1={paddingTop}
                x2={scaleX(item.date)}
                y2={chartHeight - paddingBottom}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x={scaleX(item.date)}
                y={chartHeight - paddingBottom + 20}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="12"
              >
                {item.label}
              </text>
            </g>
          ))}

          {/* Rating lines */}
          {datasets.map((dataset, idx) => (
            <g key={`platform-${idx}`}>
              <path
                d={generatePath(dataset.data)}
                fill="none"
                stroke={dataset.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {dataset.data.map((point, pointIdx) => (
                <g key={`point-${idx}-${pointIdx}`}>
                  <circle
                    cx={scaleX(point.date)}
                    cy={scaleY(point.rating)}
                    r="4"
                    fill={dataset.color}
                    stroke="hsl(var(--card))"
                    strokeWidth="2"
                  >
                    <title>{`${dataset.platform}: ${point.rating}\n${point.contestName}\n${point.date.toLocaleDateString()}`}</title>
                  </circle>
                </g>
              ))}
            </g>
          ))}

          {/* Axes */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={paddingLeft}
            y2={chartHeight - paddingBottom}
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />
          <line
            x1={paddingLeft}
            y1={chartHeight - paddingBottom}
            x2={chartWidth - paddingRight}
            y2={chartHeight - paddingBottom}
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
          />

          {/* Axis labels */}
          <text
            x={paddingLeft - 45}
            y={chartHeight / 2}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            fontSize="14"
            fontWeight="600"
            transform={`rotate(-90, ${paddingLeft - 45}, ${chartHeight / 2})`}
          >
            Rating
          </text>
          <text
            x={chartWidth / 2}
            y={chartHeight - 10}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            fontSize="14"
            fontWeight="600"
          >
            Contest Date
          </text>
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-4 flex-wrap">
          {datasets.map((dataset, idx) => (
            <div 
              key={`legend-${idx}`}
              className="flex items-center gap-2"
            >
              <div 
                className="w-5 h-1 rounded"
                style={{ backgroundColor: dataset.color }}
              />
              <span className="text-sm font-medium capitalize">
                {dataset.platform}
              </span>
              <span className="text-xs text-muted-foreground">
                ({dataset.data[dataset.data.length - 1]?.rating || 0})
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <AppSidebar variant="inset">
        <div className="min-h-screen bg-background font-sans p-4 md:p-8 text-foreground">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                  Welcome back, {userData.fullName}! Here's your coding journey overview.
                </p>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium hover:opacity-90 transition disabled:opacity-60 flex-shrink-0"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>

            {/* User Profile Section */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                  {/* Avatar */}
                  {userData.profilePic && userData.profilePic !== "/diverse-group-profile.png" ? (
                    <img
                      src={userData.profilePic}
                      alt="Profile"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary object-cover flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  
                  <div
                    className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary bg-primary flex items-center justify-center text-4xl md:text-5xl font-bold text-primary-foreground flex-shrink-0 ${
                      userData.profilePic && userData.profilePic !== "/diverse-group-profile.png" ? "hidden" : "flex"
                    }`}
                  >
                    {getDefaultAvatar(userData.fullName)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl md:text-3xl font-bold">{userData.username}</h2>
                      {userData.isVerified && <CheckCircle size={24} className="text-primary flex-shrink-0" />}
                    </div>
                    <p className="text-lg mb-2">{userData.fullName}</p>
                    <p className="text-muted-foreground mb-4 max-w-2xl leading-relaxed line-clamp-3">
                      {userData.bio}
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-3 items-center flex-wrap">
                      {userData.socials?.github && (
                        <a href={userData.socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                          <Github size={20} className="text-muted-foreground hover:text-primary transition" />
                        </a>
                      )}
                      {userData.socials?.linkedin && (
                        <a href={userData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                          <Linkedin size={20} className="text-muted-foreground hover:text-primary transition" />
                        </a>
                      )}
                      {userData.socials?.twitter && (
                        <a href={userData.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                          <Twitter size={20} className="text-muted-foreground hover:text-primary transition" />
                        </a>
                      )}
                      {userData.socials?.website && (
                        <a href={userData.socials.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                          <Globe size={20} className="text-muted-foreground hover:text-primary transition" />
                        </a>
                      )}
                      <button
                        onClick={() => navigator.clipboard.writeText(window.location.href)}
                        className="hover:text-primary transition"
                      >
                        <Share2 size={20} className="text-primary cursor-pointer" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">College</span>
                      </div>
                      <p className="font-medium truncate">{userData.college}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Location</span>
                      </div>
                      <p className="font-medium truncate">{userData.location}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Eye size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Profile Views</span>
                      </div>
                      <p className="font-medium">{userData.profileViews.toLocaleString()}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={16} className="text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Last Refresh</span>
                      </div>
                      <p className="font-medium truncate">{userData.lastRefresh}</p>
                    </div>
                  </div>

                  {/* Verified Platforms */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Verified Platforms ({userData.verifiedPlatforms.length})
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {userData.verifiedPlatforms.length > 0 ? userData.verifiedPlatforms.map((platform) => (
                        <span
                          key={platform}
                          className="bg-primary/10 text-primary px-3 py-1 rounded text-xs font-medium"
                        >
                          {platform}
                        </span>
                      )) : (
                        <span className="text-sm text-muted-foreground">
                          No platforms connected yet
                        </span>
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
              {/* Heatmap */}
              <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold">Activity Heatmap</h3>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {[2024, 2023, 2022].map(year => (
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

                {/* Responsive Heatmap Grid */}
                <div className="overflow-x-auto mb-6 -mx-2 px-2">
                  <div className="inline-grid gap-1" style={{ gridTemplateColumns: "repeat(53, minmax(12px, 1fr))" }}>
                    {heatmapData.map((day, index) => (
                      <HeatmapCell key={index} count={day.count} date={day.date} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <span className="text-muted-foreground">
                      {overallStats.activeDays} active days
                    </span>
                    <span className="text-muted-foreground">
                      Current streak: {overallStats.streakCurrent} days
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Less</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor: level === 0 ? "hsl(var(--muted))" : `hsl(var(--primary) / ${0.2 + level * 0.2})`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">More</span>
                  </div>
                </div>
              </div>

              {/* Platform Ratings */}
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

            {/* Rating Progression Chart */}
            {ratingChartData.datasets.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold">
                    Rating Progression
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp size={16} />
                    <span>All-time rating history across platforms</span>
                  </div>
                </div>
                <RatingChart datasets={ratingChartData.datasets} />
              </div>
            )}

            {/* Problem Distribution, Categories, Languages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
              {/* Problem Distribution */}
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Problem Distribution</h3>
                <div className="space-y-3">
                  {/*
                    { label: 'Easy', value: problemDistribution.easy, color: 'bg-chart-1' },
                    { label: 'Medium', value: problemDistribution.medium, color: 'bg-chart-2' },
                    { label: 'Hard', value: problemDistribution.hard, color: 'bg-chart-3' },
                    { label: 'Expert', value: problemDistribution.expert, color: 'bg-chart-5' }
                  */}
                  {Object.entries(problemDistribution).map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${getChartColor(label)}`} />
                        <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                      </div>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-sm">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Categories</h3>
                <div className="space-y-3">
                  {Object.entries(categoryDistribution).map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${getCategoryColor(label)}`} />
                        <span>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                      </div>
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

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
                    {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''} earned
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userBadges.map((badge, index) => (
                    <div
                      key={`${badge.platform}-${badge.id || index}`}
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
                      <span className={`text-xs px-2 py-1 rounded font-medium mb-2 capitalize ${
                        badge.platform === 'codemesh' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-secondary/20 text-secondary'
                      }`}>
                        {badge.platform}
                      </span>
                      
                      {/* Earned Date */}
                      {badge.earnedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
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
