# CodeMesh Backend Architecture v2.0

## Overview

The backend has been restructured to support both **unified portfolio views** and **platform-specific detailed views**. This new architecture allows users to see:

1. **Unified Portfolio**: Combined statistics from all platforms (Easy/Medium/Hard, unified heatmap, CodeMesh rating)
2. **Platform-Specific Views**: Detailed statistics in each platform's native format (e.g., Codeforces rating-wise distribution, LeetCode difficulty breakdown)

## Architecture Changes

### 🗄️ Database Models

#### New Models
- **`PlatformData`**: Stores raw platform profile data without transformation
- **`PlatformSubmission`**: Stores raw submission data from each platform
- **`PlatformRatingHistory`**: Stores raw rating history from each platform

#### Philosophy
- Store **raw data exactly as received** from platform APIs
- No transformation at storage level
- Keep platform-specific nuances intact

### 🔄 Services Layer

#### UnificationService (`src/services/unificationService.js`)
- Converts platform-specific data to unified format
- Calculates CodeMesh unified rating
- Aggregates cross-platform statistics
- Creates unified heatmaps and analytics

#### Platform Services
- **`CodeforcesServiceV2`**: Stores raw Codeforces data (REST API)
- **`LeetCodeServiceV2`**: Stores raw LeetCode data (GraphQL API)
- Future: `CodeChefService`, `AtCoderService`, etc.
- Each service maintains platform-specific data structures

### 🛠️ Conversion Utilities (`src/utils/platformConverter.js`)

#### Platform Converters
- **`CodeforcesConverter`**: Maps Codeforces ratings (800-1200) → "Easy", tags to categories
- **`LeetCodeConverter`**: Maps LeetCode Easy/Medium/Hard → unified format, tags to categories
- **`UnifiedConverter`**: Cross-platform conversion utilities
- Extensible for new platforms

#### Example Conversions
```javascript
// Codeforces rating to unified difficulty
CodeforcesConverter.ratingToDifficulty(1400) // → "Medium"

// LeetCode difficulty to unified
LeetCodeConverter.difficultyToUnified('Hard') // → "Hard"

// Codeforces tags to unified categories  
CodeforcesConverter.tagsToCategories(['dp', 'graphs']) 
// → { category: 'DSA', topics: ['dp', 'graphs'] }

// LeetCode tags to unified categories
LeetCodeConverter.tagsToCategories([{name: 'Array'}, {name: 'Dynamic Programming'}])
// → { category: 'DSA', topics: ['array', 'dynamic_programming'] }
```

### 🎯 Controllers

#### PortfolioController (`src/controllers/portfolioController.js`)
- **Unified views** across all platforms
- Handles `/api/v1/portfolio/*` routes
- Returns transformed, unified data

#### PlatformController (`src/controllers/platformController.js`)
- **Platform-specific views** with native formats
- Handles `/api/v1/platform/*` routes  
- Returns raw platform data with platform-specific statistics

## API Endpoints

### 🌐 Unified Portfolio API

```http
# Get unified portfolio (authenticated user)
GET /api/v1/portfolio

# Get unified portfolio by username (public)
GET /api/v1/portfolio/{username}

# Get portfolio summary
GET /api/v1/portfolio/{username}/summary
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "user": { "username": "...", "name": "..." },
    "portfolio": {
      "linkedAccounts": [
        {
          "platform": "codeforces",
          "handle": "tourist",
          "rating": 3790,
          "totalSolved": 1500
        },
        {
          "platform": "leetcode",
          "handle": "leetcode_user",
          "rating": 2400,
          "totalSolved": 800
        }
      ],
      "overallStats": {
        "totalSolved": 2300,
        "difficulty": { "easy": 500, "medium": 1200, "hard": 600 }
      },
      "codeMeshRating": 2850,
      "activityData": { "heatmap": {...}, "streaks": {...} },
      "topicDistribution": {...},
      "badges": [...]
    }
  }
}
```

### 🎮 Platform-Specific API

```http
# Sync platform data
POST /api/v1/platform/sync
Body: { 
  "platform": "codeforces" | "leetcode",
  "handle": "username" 
}

# Get Codeforces data (authenticated user)
GET /api/v1/platform/codeforces

# Get LeetCode data (authenticated user)
GET /api/v1/platform/leetcode

# Get Codeforces data by username (public)
GET /api/v1/platform/{username}/codeforces

# Get LeetCode data by username (public)
GET /api/v1/platform/{username}/leetcode

# Get platform summary
GET /api/v1/platform/{username}/{platform}/summary
```

**Codeforces Response Structure:**
```json
{
  "success": true,
  "data": {
    "platform": "codeforces",
    "handle": "tourist", 
    "profile": { 
      "rating": 3790, 
      "maxRating": 4009, 
      "rank": "legendary grandmaster" 
    },
    "statistics": {
      "ratingDistribution": {
        "800": 5,
        "900": 8,
        "1000": 12,
        "1100": 15,
        "1200": 25,
        "1300": 30,
        "1400": 40,
        "1500": 35,
        "1600": 45,
        "1700": 38,
        "1800": 32,
        "1900": 28,
        "2000": 25,
        "2100": 20,
        "2200": 15,
        "2300": 12,
        "2400": 10,
        "2500": 8
      },
      "topicDistribution": { 
        "dp": 145, 
        "graphs": 138, 
        "math": 132,
        "greedy": 98,
        "data structures": 156
      },
      "contestStats": { 
        "totalContests": 256, 
        "bestRank": 1,
        "averageRank": 15,
        "ratingProgress": 2500
      },
      "verdictDistribution": {
        "OK": 1250,
        "WRONG_ANSWER": 450,
        "TIME_LIMIT_EXCEEDED": 120
      },
      "languageDistribution": {
        "GNU C++17": 800,
        "GNU C++20": 450
      }
    }
  }
}
```

**LeetCode Response Structure:**
```json
{
  "success": true,
  "data": {
    "platform": "leetcode",
    "handle": "leetcode_user",
    "profile": {
      "username": "leetcode_user",
      "realName": "John Doe",
      "userAvatar": "https://...",
      "ranking": 12345,
      "reputation": 150
    },
    "statistics": {
      "totalSolved": 850,
      "totalSubmissions": 1200,
      "acceptanceRate": "70.8",
      "difficultyDistribution": {
        "Easy": 300,
        "Medium": 450,
        "Hard": 100
      },
      "topicDistribution": {
        "Array": 180,
        "Dynamic Programming": 120,
        "Hash Table": 95,
        "Tree": 85,
        "Graph": 70
      },
      "statusDistribution": {
        "Accepted": 850,
        "Wrong Answer": 250,
        "Time Limit Exceeded": 80,
        "Runtime Error": 20
      },
      "languageDistribution": {
        "Python3": 450,
        "Java": 300,
        "C++": 100
      },
      "contestStats": {
        "attendedContests": 45,
        "currentRating": 2150,
        "bestRank": 125,
        "averageRank": 850
      }
    }
  }
}
```

## Data Flow

### 1. **Data Sync Flow**
```
User Request → PlatformController → Platform Service (CF/LC) → Raw Storage
                                                                      ↓
                                                              PlatformData
                                                              PlatformSubmission  
                                                              PlatformRatingHistory
```

**Codeforces Flow:**
```
POST /platform/sync → CodeforcesServiceV2 → CF REST API
                                                ↓
                    makeRequest() → user.info, user.status, user.rating
                                                ↓
                    storePlatformData() → PlatformData collection
                    storeSubmissions() → PlatformSubmission collection
                    storeRatingHistory() → PlatformRatingHistory collection
```

**LeetCode Flow:**
```
POST /platform/sync → LeetCodeServiceV2 → LC GraphQL API
                                              ↓
                makeRequest() → getUserProfile, getRecentSubmissions, 
                                getContestInfo, getSkillStats, getLanguageStats
                                              ↓
                storePlatformData() → PlatformData collection
                storeSubmissions() → PlatformSubmission collection
                storeRatingHistory() → PlatformRatingHistory collection
```

### 2. **Unified Portfolio Flow**  
```
Portfolio Request → PortfolioController → UnificationService
                                              ↓
                                    Fetch all platform data
                                              ↓
                    processPlatformData() for each platform
                                              ↓
                    Apply platform converters (CF/LC/etc.)
                                              ↓
                    calculateUnifiedMetrics()
                                              ↓
                                    Unified Response
```

### 3. **Platform-Specific Flow**
```
Platform Request → PlatformController → Platform Service
                                              ↓
                              getPlatformSpecificData()
                                              ↓
                    Fetch from PlatformData/Submission/RatingHistory
                                              ↓
                    calculatePlatformStats() (native format)
                                              ↓
                              Platform-Specific Response
```

## Platform Integration Details

### Codeforces Integration
- **API Type**: REST API
- **Base URL**: `https://codeforces.com/api`
- **Rate Limit**: 1 request/second, burst of 5
- **Authentication**: None required (public API)
- **Key Endpoints**:
  - `user.info` - User profile data
  - `user.status` - All submissions
  - `user.rating` - Contest rating history
  - `problemset.problems` - Problem details
- **Data Format**: Native Codeforces rating (800-3500+)
- **Unique Features**: 
  - Problem ratings (800, 900, 1000, etc.)
  - Verdicts (OK, WRONG_ANSWER, TLE, etc.)
  - Contest performance tracking
  - Tag-based problem categorization

### LeetCode Integration
- **API Type**: GraphQL API
- **Base URL**: `https://leetcode.com/graphql`
- **Rate Limit**: 0.5 requests/second (conservative)
- **Authentication**: None required for public profiles
- **Key Queries**:
  - `getUserProfile` - User profile and stats
  - `getRecentSubmissions` - Submission history (limit 100)
  - `userContestRankingInfo` - Contest rating and history
  - `skillStats` - Tag-based skill distribution
  - `languageStats` - Programming language usage
- **Data Format**: Difficulty levels (Easy/Medium/Hard)
- **Unique Features**:
  - Contest rating system (separate from problem solving)
  - Topic tags (Array, DP, Graph, etc.)
  - Premium problem distinction
  - Submission calendar with daily counts
  - Advanced/Intermediate/Fundamental skill levels

## Migration Guide

### From Old API (Deprecated)
```http
# OLD (Deprecated)
POST /api/v1/profile/sync  
GET /api/v1/profile
GET /api/v1/profile/{username}
```

### To New API  
```http
# NEW - Data Sync
POST /api/v1/platform/sync
Body: { "platform": "codeforces", "handle": "tourist" }
Body: { "platform": "leetcode", "handle": "leetcode_user" }

# NEW - Unified Portfolio  
GET /api/v1/portfolio
GET /api/v1/portfolio/{username}

# NEW - Platform-Specific
GET /api/v1/platform/codeforces         # Authenticated
GET /api/v1/platform/leetcode           # Authenticated
GET /api/v1/platform/{username}/codeforces  # Public
GET /api/v1/platform/{username}/leetcode    # Public
```

## Benefits

### ✅ **Unified Experience**
- Single API for cross-platform statistics
- Consistent difficulty mapping (Easy/Medium/Hard)
- CodeMesh unified rating system (0-4000 scale)
- Combined activity heatmaps across platforms
- Aggregated topic distribution

### ✅ **Platform Flexibility**
- Preserve platform-specific nuances
- **Codeforces**: Native rating-wise problem distribution (800-3500+)
- **LeetCode**: Easy/Medium/Hard breakdown, premium problems distinction
- Native contest performance metrics for each platform
- Platform-specific verdict/status tracking

### ✅ **Scalability**
- Easy to add new platforms (follow BasePlatformService pattern)
- No data loss during conversions
- Platform-specific optimizations possible
- Clean separation of concerns
- Independent rate limiting per platform

### ✅ **Performance**
- Raw data stored once per platform
- Unified transformations on-demand
- Platform-specific queries optimized
- Caching opportunities at multiple levels
- Batch insertion for submissions (1000 per batch)

## Implemented Platforms

### ✅ Codeforces
- **Status**: Fully Implemented
- **Service**: `CodeforcesServiceV2`
- **Converter**: `CodeforcesConverter`
- **Features**:
  - User profile sync
  - All submissions history
  - Contest rating history
  - Problem difficulty mapping (800-3500+)
  - Tag-based categorization
  - Platform-specific statistics

### ✅ LeetCode  
- **Status**: Fully Implemented
- **Service**: `LeetCodeServiceV2`
- **Converter**: `LeetCodeConverter`
- **Features**:
  - User profile sync (GraphQL)
  - Recent submissions (last 100)
  - Contest rating and history
  - Skill statistics (Advanced/Intermediate/Fundamental)
  - Language usage tracking
  - Topic distribution
  - Difficulty breakdown (Easy/Medium/Hard)
  - Contest performance metrics

### 🔜 Coming Soon
- CodeChef (planned)
- AtCoder (planned)
- HackerRank (planned)
- GeeksforGeeks (planned)

## Development Guide

### Adding a New Platform

1. **Create Platform Service**
```javascript
// src/services/platform/NewPlatformServiceV2.js
import BasePlatformService from './BasePlatformService.js';

class NewPlatformService extends BasePlatformService {
  constructor() {
    super('newplatform');
    this.baseURL = 'https://api.newplatform.com';
  }

  async getUserInfo(handle) { /* implement */ }
  async getAllSubmissions(handle) { /* implement */ }
  async getRatingHistory(handle) { /* implement */ }
  async validateHandle(handle) { /* implement */ }
  async syncUserData(userId, handle) { /* implement */ }
  async getPlatformSpecificData(userId) { /* implement */ }
}
```

2. **Create Platform Converter**
```javascript
// src/utils/platformConverter.js
export const NewPlatformConverter = {
  difficultyToUnified(platformDifficulty) { /* map to Easy/Medium/Hard */ },
  tagsToCategories(tags) { /* map to CP/DSA/Fundamentals */ },
  // ... other conversion methods
};

// Register in PlatformConverters
export const PlatformConverters = {
  codeforces: CodeforcesConverter,
  leetcode: LeetCodeConverter,
  newplatform: NewPlatformConverter
};
```

3. **Update Platform Controller**
```javascript
// src/controllers/platformController.js
import NewPlatformServiceV2 from '../services/platform/NewPlatformServiceV2.js';

const newPlatformService = new NewPlatformServiceV2();

// Add in syncPlatformData switch
case 'newplatform':
  result = await newPlatformService.syncUserData(userId, handle);
  break;
```

4. **Update Models Enum**
```javascript
// Add 'newplatform' to enum in:
// - src/models/PlatformData.js
// - src/models/PlatformSubmission.js
// - src/models/PlatformRatingHistory.js
```

## Testing

### Test Platform Sync
```bash
# Codeforces
curl -X POST http://localhost:3000/api/v1/platform/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platform":"codeforces","handle":"tourist"}'

# LeetCode
curl -X POST http://localhost:3000/api/v1/platform/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"platform":"leetcode","handle":"leetcode_username"}'
```

### Test Unified Portfolio
```bash
curl http://localhost:3000/api/v1/portfolio/username
```

### Test Platform-Specific Data
```bash
# Authenticated
curl http://localhost:3000/api/v1/platform/codeforces \
  -H "Authorization: Bearer YOUR_TOKEN"

curl http://localhost:3000/api/v1/platform/leetcode \
  -H "Authorization: Bearer YOUR_TOKEN"

# Public
curl http://localhost:3000/api/v1/platform/username/codeforces
curl http://localhost:3000/api/v1/platform/username/leetcode
```

## Next Steps

1. **Add More Platforms**  
   - CodeChef (REST API)
   - AtCoder (REST API)
   - HackerRank (REST API)

2. **Optimization**
   - Add Redis caching layer for platform data
   - Implement background job queue for data sync
   - Pre-compute unified metrics periodically
   - Add rate limit coordination across services

3. **Enhanced Features**
   - Real-time contest tracking
   - Automated daily sync
   - Problem recommendation engine
   - Comparative analytics across platforms

4. **Frontend Integration**
   - Update frontend to use new unified portfolio API
   - Implement platform-specific detail pages
   - Add platform sync UI
   - Create unified dashboard view