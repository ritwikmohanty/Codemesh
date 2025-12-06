# Leaderboard Data Fix Guide

## Problem
Your existing database has LeaderboardEntry documents, but they may not have the correct `ratingComponents.platformRatings` data populated, which is needed for:
1. CodeMesh Master Rating leaderboard with podium
2. Platform-specific leaderboards (Codeforces, LeetCode)

## Solution

### Step 1: Run the Fix Script

Navigate to the server directory and run:

```bash
cd server
node scripts/fixLeaderboardData.js
```

This script will:
- Recalculate ratings for all users based on their PlatformData
- Populate the `ratingComponents.platformRatings` field correctly
- Update tiers based on current ratings
- Recalculate ranks for all users

### Step 2: Verify the Data

After running the script, check your database:

```javascript
// In MongoDB shell or Compass
db.leaderboardentries.findOne({}, {
  masterRating: 1,
  tier: 1,
  'ratingComponents.platformRatings': 1,
  currentRank: 1
})
```

You should see:
- `masterRating`: A number > 0
- `tier`: One of the valid tiers (Newbie, Pupil, etc.)
- `ratingComponents.platformRatings`: An array with platform rating data
- `currentRank`: A number representing the user's position

### Step 3: Restart Your Server

```bash
# Stop the current server (Ctrl+C)
npm start
```

## What the Script Does

The `fixLeaderboardData.js` script:

1. **Connects to your database**
2. **For each LeaderboardEntry**:
   - Fetches the user's PlatformData (Codeforces, LeetCode, etc.)
   - Fetches the user's submissions
   - Fetches the user's rating history
   - Recalculates the CodeMesh Master Rating
   - Updates the `ratingComponents.platformRatings` array with:
     ```javascript
     [
       { platform: 'codeforces', rating: 1500, normalized: 1200 },
       { platform: 'leetcode', rating: 1800, normalized: 1400 }
     ]
     ```
   - Updates the tier based on the master rating
3. **Updates all ranks** after processing all users

## Expected Results

After running the script:

### 1. CodeMesh Master Rating Tab
- ✅ Podium shows top 3 users (if total users > 3)
- ✅ Table shows users from rank 4 onwards
- ✅ Filters work (tier, country, college, graduation year)

### 2. Codeforces Tab
- ✅ Shows users who have Codeforces data
- ✅ Podium shows top 3 Codeforces users
- ✅ Table shows remaining users sorted by Codeforces rating

### 3. LeetCode Tab
- ✅ Shows users who have LeetCode data
- ✅ Podium shows top 3 LeetCode users
- ✅ Table shows remaining users sorted by LeetCode rating

## Troubleshooting

### Issue: "No users found"
**Cause**: No LeaderboardEntry documents exist
**Solution**: Make sure users have completed onboarding and synced their platforms

### Issue: "No Codeforces/LeetCode rankings available"
**Cause**: Users don't have PlatformData for that platform
**Solution**: 
1. Check if users have linked their accounts: `db.platformdatas.find({ platform: 'codeforces' })`
2. Make sure platform data sync has run successfully

### Issue: Podium not showing even with users > 3
**Cause**: The filters are too restrictive
**Solution**: 
1. Click "Reset" to clear filters
2. Check if users have the onboarding data you're filtering by

### Issue: Script fails with "Cannot read property 'masterRating'"
**Cause**: Missing PlatformData or corrupt data
**Solution**:
1. Check that PlatformData exists for users
2. Ensure platform sync has completed
3. Check server logs for sync errors

## Manual Verification

You can manually trigger a recalculation from the API:

```bash
# Get your auth token from the browser (localStorage or cookies)
curl -X POST http://localhost:3000/api/v1/leaderboard/recalculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Or use the scheduler to recalculate all ratings:

```bash
curl -X POST http://localhost:3000/api/v1/leaderboard/admin/recalculate-all \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 50, "onlyActive": true}'
```

## Prevention

To prevent this issue in the future:
1. The leaderboard scheduler runs every 6 hours to recalculate ratings
2. Users can manually trigger recalculation from their profile
3. New users automatically get LeaderboardEntry created during onboarding
