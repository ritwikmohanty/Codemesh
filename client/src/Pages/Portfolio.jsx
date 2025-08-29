
import { useState } from "react"
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
  Sidebar,
} from "lucide-react"
import { AppSidebar } from "@/components/sidebar/app-sidebar"

const Portfolio = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [selectedYear, setSelectedYear] = useState("2024")

  // Mock data - replace with actual API data
  const userData = {
    profilePic: "/diverse-group-profile.png",
    username: "codeMaster2024",
    fullName: "Alex Johnson",
    isVerified: true,
    verifiedPlatforms: ["Codeforces", "LeetCode", "CodeChef"],
    bio: "Passionate competitive programmer | ICPC World Finalist | Love solving complex algorithms",
    college: "MIT Computer Science",
    location: "Boston, MA",
    nationality: "USA",
    profileViews: 1247,
    lastRefresh: "2 hours ago",
    friends: 156,
    socials: {
      github: "github.com/codemaster",
      linkedin: "linkedin.com/in/alexjohnson",
      twitter: "@codemaster2024",
      website: "alexcodes.dev",
    },
  }

  const platformStats = {
    codeforces: { rating: 2156, rank: "Master", color: "#1f8ef1" },
    leetcode: { rating: 2340, rank: "Guardian", color: "#ffa116" },
    codechef: { rating: 2089, rank: "5★", color: "#5b4638" },
    atcoder: { rating: 1876, rank: "Expert", color: "#3c9d9b" },
  }

  const overallStats = {
    totalProblems: 2847,
    streakCurrent: 47,
    streakMax: 89,
    activeDays: 234,
    accuracy: 87.3,
    avgAttempts: 1.4,
    codeMeshRating: 2198,
  }

  const problemDistribution = {
    easy: 1247,
    medium: 1156,
    hard: 444,
  }

  const topicStats = [
    { topic: "Dynamic Programming", solved: 234, total: 300 },
    { topic: "Graph Theory", solved: 189, total: 250 },
    { topic: "Data Structures", solved: 167, total: 200 },
    { topic: "Greedy", solved: 145, total: 180 },
    { topic: "Math", solved: 123, total: 160 },
  ]

  const recentSubmissions = [
    { problem: "Maximum Subarray Sum", platform: "Codeforces", status: "Accepted", time: "2 hours ago" },
    { problem: "Binary Tree Paths", platform: "LeetCode", status: "Accepted", time: "5 hours ago" },
    { problem: "Chef and Arrays", platform: "CodeChef", status: "Wrong Answer", time: "1 day ago" },
    { problem: "Graph Coloring", platform: "AtCoder", status: "Accepted", time: "2 days ago" },
  ]

  const languages = [
    { name: "C++", percentage: 65, color: "hsl(var(--primary))" },
    { name: "Python", percentage: 25, color: "hsl(var(--secondary))" },
    { name: "Java", percentage: 8, color: "hsl(var(--accent))" },
    { name: "JavaScript", percentage: 2, color: "hsl(var(--chart-4))" },
  ]

  // Generate mock heatmap data
  const generateHeatmapData = () => {
    const data = []
    const startDate = new Date(2024, 0, 1)
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      data.push({
        date: date.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 10),
      })
    }
    return data
  }

  const heatmapData = generateHeatmapData()

  const StatCard = ({ title, value, icon: Icon, subtitle, trend }) => (
    <div
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        padding: "1.5rem",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <h3
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "hsl(var(--muted-foreground))",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <Icon size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
      </div>
      <div style={{ fontSize: "2rem", fontWeight: "700", color: "hsl(var(--foreground))", marginBottom: "0.25rem" }}>
        {value}
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "hsl(var(--muted-foreground))",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {trend && <TrendingUp size={12} style={{ color: "hsl(var(--primary))" }} />}
          {subtitle}
        </p>
      )}
    </div>
  )

  const PlatformCard = ({ platform, data }) => (
    <div
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: data.color,
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "600", textTransform: "capitalize" }}>{platform}</div>
        <div style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
          {data.rating} • {data.rank}
        </div>
      </div>
    </div>
  )

  const TopicBar = ({ topic, solved, total }) => {
    const percentage = (solved / total) * 100
    return (
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span>{topic}</span>
          <span style={{ color: "hsl(var(--muted-foreground))" }}>
            {solved}/{total}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "hsl(var(--muted))",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              backgroundColor: "hsl(var(--primary))",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>
    )
  }

  const HeatmapCell = ({ count, date }) => {
    const getIntensity = (count) => {
      if (count === 0) return "hsl(var(--muted))"
      if (count <= 2) return "hsl(var(--primary) / 0.3)"
      if (count <= 4) return "hsl(var(--primary) / 0.6)"
      if (count <= 6) return "hsl(var(--primary) / 0.8)"
      return "hsl(var(--primary))"
    }

    return (
      <div
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: getIntensity(count),
          borderRadius: "2px",
          margin: "1px",
        }}
        title={`${date}: ${count} problems solved`}
      />
    )
  }

  return (<div>
    <AppSidebar variant="inset" >

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "hsl(var(--background))",
        fontFamily: "var(--font-sans)",
        padding: "2rem",
        color: "hsl(var(--foreground))",
      }}
    >
      
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "700",
              margin: "0 0 0.5rem 0",
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              color: "hsl(var(--muted-foreground))",
              fontSize: "1.125rem",
              margin: 0,
            }}
          >
            Welcome back, {userData.fullName}! Here's your coding journey overview.
          </p>
        </div>

        {/* User Profile Section */}
        <div
          style={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Profile Picture and Basic Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <img
                src={userData.profilePic || "/placeholder.svg"}
                alt="Profile"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "4px solid hsl(var(--primary))",
                }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>{userData.username}</h2>
                  {userData.isVerified && <CheckCircle size={20} style={{ color: "hsl(var(--primary))" }} />}
                </div>
                <p style={{ fontSize: "1.125rem", margin: "0 0 0.5rem 0" }}>{userData.fullName}</p>
                <p
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    margin: "0 0 1rem 0",
                    maxWidth: "400px",
                    lineHeight: "1.5",
                  }}
                >
                  {userData.bio}
                </p>

                {/* Social Links */}
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <Github size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
                  <Linkedin size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
                  <Twitter size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
                  <Globe size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
                  <Share2 size={20} style={{ color: "hsl(var(--primary))" }} />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div style={{ flex: 1, minWidth: "300px" }}>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <GraduationCap size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                    <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>College</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: "500" }}>{userData.college}</p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <MapPin size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                    <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>Location</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: "500" }}>{userData.location}</p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Eye size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                    <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>Profile Views</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: "500" }}>{userData.profileViews.toLocaleString()}</p>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Users size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
                    <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>Friends</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: "500" }}>{userData.friends}</p>
                </div>
              </div>

              {/* Verified Platforms */}
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem" }}>
                  Verified Platforms
                </p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {userData.verifiedPlatforms.map((platform) => (
                    <span
                      key={platform}
                      style={{
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        color: "hsl(var(--primary))",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "var(--radius)",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <StatCard
            title="CodeMesh Rating"
            value={overallStats.codeMeshRating}
            icon={Trophy}
            subtitle="Global Rank #1,247"
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
            trend={true}
          />
          <StatCard
            title="Accuracy"
            value={`${overallStats.accuracy}%`}
            icon={Target}
            subtitle={`Avg ${overallStats.avgAttempts} attempts/solve`}
          />
        </div>

        {/* Main Content Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          {/* Heatmap */}
          <div
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: 0 }}>Activity Heatmap</h3>
              <div style={{ display: "flex", gap: "1rem" }}>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    padding: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  style={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    padding: "0.5rem",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  <option value="all">All Platforms</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="codechef">CodeChef</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(53, 1fr)",
                gap: "2px",
                marginBottom: "1rem",
              }}
            >
              {heatmapData.map((day, index) => (
                <HeatmapCell key={index} count={day.count} date={day.date} />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                  {overallStats.activeDays} active days
                </span>
                <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
                  Last refresh: {userData.lastRefresh}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>Less</span>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor:
                          level === 0 ? "hsl(var(--muted))" : `hsl(var(--primary) / ${0.2 + level * 0.2})`,
                        borderRadius: "2px",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>More</span>
              </div>
            </div>
          </div>

          {/* Platform Ratings */}
          <div
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0 0 1rem 0" }}>Platform Ratings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {Object.entries(platformStats).map(([platform, data]) => (
                <PlatformCard key={platform} platform={platform} data={data} />
              ))}
            </div>
          </div>
        </div>

        {/* Problem Distribution and Topic Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          {/* Problem Distribution */}
          <div
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0 0 1rem 0" }}>Problem Distribution</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "hsl(var(--chart-1))",
                      borderRadius: "2px",
                    }}
                  />
                  <span>Easy</span>
                </div>
                <span style={{ fontWeight: "600" }}>{problemDistribution.easy}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "hsl(var(--chart-2))",
                      borderRadius: "2px",
                    }}
                  />
                  <span>Medium</span>
                </div>
                <span style={{ fontWeight: "600" }}>{problemDistribution.medium}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: "hsl(var(--chart-3))",
                      borderRadius: "2px",
                    }}
                  />
                  <span>Hard</span>
                </div>
                <span style={{ fontWeight: "600" }}>{problemDistribution.hard}</span>
              </div>
            </div>
          </div>

          {/* Languages Used */}
          <div
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0 0 1rem 0" }}>Languages Used</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {languages.map((lang) => (
                <div key={lang.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span>{lang.name}</span>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>{lang.percentage}%</span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      backgroundColor: "hsl(var(--muted))",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${lang.percentage}%`,
                        height: "100%",
                        backgroundColor: lang.color,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
              padding: "1.5rem",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0 0 1rem 0" }}>Recent Submissions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentSubmissions.map((submission, index) => (
                <div
                  key={index}
                  style={{
                    padding: "0.75rem",
                    backgroundColor: "hsl(var(--muted) / 0.3)",
                    borderRadius: "var(--radius)",
                    fontSize: "0.875rem",
                  }}
                >
                  <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>{submission.problem}</div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", color: "hsl(var(--muted-foreground))" }}
                  >
                    <span>{submission.platform}</span>
                    <span
                      style={{
                        color: submission.status === "Accepted" ? "hsl(var(--primary))" : "hsl(var(--destructive))",
                      }}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
                    {submission.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Topic-wise Progress */}
        <div
          style={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h3 style={{ fontSize: "1.25rem", fontWeight: "600", margin: "0 0 1rem 0" }}>Topic-wise Progress</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div>
              {topicStats.slice(0, 3).map((topic) => (
                <TopicBar key={topic.topic} {...topic} />
              ))}
            </div>
            <div>
              {topicStats.slice(3).map((topic) => (
                <TopicBar key={topic.topic} {...topic} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AppSidebar>
    </div>
  )
}

export default Portfolio
