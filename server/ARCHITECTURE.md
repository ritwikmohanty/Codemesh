# CodeMesh Backend Architecture v2.0

## Overview

The backend has been restructured to support both **unified portfolio views** and **platform-specific detailed views**. This new architecture allows users to see:

1. **Unified Portfolio**: Combined statistics from all platforms (Easy/Medium/Hard, unified heatmap, CodeMesh rating)
2. **Platform-Specific Views**: Detailed statistics in each platform's native format (e.g., Codeforces rating-wise distribution)

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

#### Platform Services (Updated)
- **`CodeforcesServiceV2`**: Stores raw Codeforces data
- Future: `LeetCodeService`, `CodeChefService`, etc.
- Each service maintains platform-specific data structures

### 🛠️ Conversion Utilities (`src/utils/platformConverter.js`)

#### Platform Converters
- **`CodeforcesConverter`**: Maps Codeforces ratings (800-1200) → "Easy"
- **`UnifiedConverter`**: Cross-platform conversion utilities
- Extensible for new platforms

#### Example Conversions
```javascript
// Codeforces rating to unified difficulty
CodeforcesConverter.ratingToDifficulty(1400) // → "Medium"

// Codeforces tags to unified categories  
CodeforcesConverter.tagsToCategories(['dp', 'graphs']) // → { category: 'DSA', topics: ['dp', 'graphs'] }
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
      "linkedAccounts": [...],
      "overallStats": {
        "totalSolved": 150,
        "difficulty": { "easy": 50, "medium": 80, "hard": 20 }
      },
      "codeMeshRating": 1650,
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
Body: { "platform": "codeforces", "handle": "tourist" }

# Get Codeforces data (authenticated user)
GET /api/v1/platform/codeforces

# Get Codeforces data by username (public)
GET /api/v1/platform/{username}/codeforces

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
    "profile": { "rating": 3790, "maxRating": 4009, "rank": "legendary grandmaster" },
    "statistics": {
      "ratingDistribution": {
        "800-1199": 10,
        "1200-1399": 25, 
        "1400-1599": 40,
        "1600-1899": 35,
        "1900-2099": 20,
        "2100-2399": 15,
        "2400+": 8
      },
      "topicDistribution": { "dp": 45, "graphs": 38, "math": 32 },
      "contestStats": { "totalContests": 156, "bestRank": 1 }
    }
  }
}
```

## Data Flow

### 1. **Data Sync Flow**
```
User Request → PlatformController → CodeforcesServiceV2 → Raw Storage
                                                              ↓
                                                     PlatformData
                                                     PlatformSubmission  
                                                     PlatformRatingHistory
```

### 2. **Unified Portfolio Flow**  
```
Portfolio Request → PortfolioController → UnificationService → Platform Converters
                                                                       ↓
                                                              Unified Response
```

### 3. **Platform-Specific Flow**
```
Platform Request → PlatformController → Platform Service → Raw Data + Platform Stats
```

## Migration Guide

### From Old API
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

# NEW - Unified Portfolio  
GET /api/v1/portfolio
GET /api/v1/portfolio/{username}

# NEW - Platform-Specific
GET /api/v1/platform/{username}/codeforces
```

## Benefits

### ✅ **Unified Experience**
- Single API for cross-platform statistics
- Consistent difficulty mapping (Easy/Medium/Hard)
- CodeMesh unified rating system
- Combined activity heatmaps

### ✅ **Platform Flexibility**
- Preserve platform-specific nuances
- Codeforces: Rating-wise problem distribution
- LeetCode: Premium/free problem distinction  
- Native contest performance metrics

### ✅ **Scalability**
- Easy to add new platforms
- No data loss during conversions
- Platform-specific optimizations possible
- Clean separation of concerns

### ✅ **Performance**
- Raw data stored once
- Unified transformations on-demand
- Platform-specific queries optimized
- Caching opportunities at multiple levels

## Next Steps

1. **Add LeetCode Support**
   - Create `LeetCodeService`
   - Add `LeetCodeConverter` 
   - Update UnificationService

2. **Add More Platforms**  
   - CodeChef, AtCoder, HackerRank
   - Follow same pattern

3. **Optimization**
   - Add caching layer
   - Background data processing
   - Pre-computed unified metrics

4. **Frontend Integration**
   - Update frontend to use new APIs
   - Implement unified and platform-specific views