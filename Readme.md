# CodeMesh

A full-stack platform for competitive programmers. Track contests, analyze your performance across platforms, compete on a global leaderboard, and fight ranked battles — all from one dashboard.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment Variables](#environment-variables)
6. [Local Setup](#local-setup)
7. [Available Scripts](#available-scripts)
8. [Pages and UI](#pages-and-ui)
9. [API Reference](#api-reference)
10. [Scheduled Jobs](#scheduled-jobs)
11. [Data Models](#data-models)
12. [Rating System](#rating-system)
13. [Authentication](#authentication)
14. [Known Gaps / TODO](#known-gaps--todo)
15. [Team](#team)

---

## Features

### Authentication
- Email/password signup and signin with bcrypt password hashing (min 12 salt rounds).
- Google OAuth 2.0 via Passport — existing email accounts are linked automatically.
- JWT stored in an HTTP-only cookie (`authToken`), 7-day expiry by default.
- Bearer token fallback for API clients.
- Logout clears the auth cookie.

### Onboarding
- First-time users are forced through a two-step onboarding modal before accessing the app.
- Step 1 collects username (availability checked in real-time), full name, and country.
- Step 2 collects degree, institution, branch, student/alumni status, and graduation year.
- Data is stored on the `User` model under the `onboarding` subdocument.
- The `onboardingCompleted` flag gates all protected pages.

### Contest Calendar (`/calendar`)
- Fetches upcoming and running contests from 8 platforms via CList API: Codeforces, LeetCode, AtCoder, CodeChef, HackerRank, GeeksforGeeks, Code360, HackerEarth.
- Renders a full month calendar view (custom `kibo-ui` calendar component).
- Filter by platform, difficulty (Easy/Medium/Hard), and duration (Short/Medium/Long).
- Timezone-aware rendering using `Intl.DateTimeFormat`.
- Export any contest to Google Calendar or Outlook.
- Per-contest detail dialog with start time, duration, and direct link.
- Push notification support: users can subscribe to receive browser push notifications before contests start. Preferences saved per user (or per session for anonymous users).
- Custom reminder time (15m, 30m, 1h, 2h, 6h, 12h, 1d, or custom value in minutes/hours/days).
- Filter notifications by platform, difficulty, and duration.
- Notification scheduler polls every 5 minutes, checks for contests matching each user's reminder window, and sends web push via VAPID.

### Portfolio (`/portfolio`, `/portfolio/:username`)
- Unified view aggregating data from all linked and synced platforms.
- **Stats overview**: total problems solved, CodeMesh rating, active day streak, acceptance rate.
- **Activity heatmap**: contribution-graph style, generated from raw submission timestamps.
- **Streak tracking**: current streak and max streak, calculated from consecutive active days.
- **Problem distribution pie chart**: Easy / Medium / Hard breakdown across all platforms.
- **Category distribution pie chart**: CP / DSA / Fundamentals breakdown.
- **Topic distribution**: tag-level breakdown of solved problems (deduped per problem).
- **Platform cards**: per-platform rating, handle, profile URL, verification badge, and total solved.
- **Badges**: earned badges (e.g., "First Solve", "Week Warrior") shown on profile.
- **Social links**: GitHub, LinkedIn, Twitter, personal website.
- **Profile views counter**: incremented on every public profile visit.
- Public profiles are viewable at `/portfolio/:username` without login.
- Own portfolio shows a "Sync All" button with a 15-minute cooldown (stored in localStorage).
- Sync triggers `POST /platform/sync-all` which fetches all linked platforms in parallel and immediately recalculates leaderboard rating.
- Platform verification badge shown for verified handles.

### Settings (`/settings`)
Three tabs:

**Profile tab**
- Edit display name, bio, avatar URL.
- Changes saved via `PUT /users/profile`.

**Socials tab**
- Link GitHub, LinkedIn, Twitter, and personal website.
- Stored with full URL prefixes; display strips the prefix for cleaner input UX.
- Saved via `PUT /users/socials`.

**Platforms tab**
- Add Codeforces and LeetCode handles and trigger a data sync.
- **Handle verification flow**: generates a short code that the user must put in their Codeforces/LeetCode profile, then verifies server-side.
- Verified handles display a shield-check badge.
- Inline edit existing handles.
- Change password (current + new + confirm) via `PUT /users/password`.

### Leaderboard (`/leaderboard`)
Three tabs: CodeMesh Master Rating, Codeforces, LeetCode.

**CodeMesh tab**
- Podium component shows top 3 users with avatars and ratings.
- Paginated table (50 per page) for rank 4+.
- Filters: tier, country, college/institution, graduation year.
- Active filter count badge on the filter button.

**Platform tabs (Codeforces / LeetCode)**
- Separate top-3 podium and paginated table filtered to users who have synced that platform.

**Rating tiers** (Codeforces-inspired naming):

| Tier | Rating Range |
|---|---|
| Newbie | 0 – 999 |
| Pupil | 1000 – 1399 |
| Specialist | 1400 – 1799 |
| Expert | 1800 – 2199 |
| Candidate Master | 2200 – 2599 |
| Master | 2600 – 2999 |
| Grandmaster | 3000 – 3499 |
| Legendary Grandmaster | 3500+ |

### Battles (`/battles`)
Head-to-head competitive programming battles backed by the Codeforces problem set and live submission API.

**Battle lifecycle:**
1. Creator sets title, scheduled start time, duration (10–300 min), Codeforces rating range (800–3500), and number of problems (1–10).
2. Creator gets a unique `joinToken` (12-char nanoid). Shareable join link is `/battles/join/:joinToken`.
3. Other users join before the battle starts using the token. Auto-join is triggered when the URL contains the token and the user has a verified CF handle.
4. At scheduled start time the battle scheduler (runs every 30 seconds) auto-starts: randomly selects Codeforces problems within the rating range from a cached problem list (30-min TTL), excluding problems both participants have already solved.
5. During the battle the submission scheduler (runs every 1 minute) polls the Codeforces API for new submissions from all participants and stores them in `BattleSubmission`.
6. At `startTime + durationMinutes` the end scheduler (runs every 30 seconds) auto-ends the battle, computes final standings.
7. Creator can manually start, end, or cancel a battle at any time.

**Battle page (`/battle/:battleId`) features:**
- Live countdown timer to start or end.
- Participant list with Codeforces handles.
- Problem list (visible only after battle starts) with direct CF links, rating badges, and solved indicators.
- Standings table with score, solved count, and per-problem status for each participant.
- Submission history table.
- Copy join link to clipboard.
- Manual refresh submissions button (with cooldown to avoid hammering CF API).

**Requirements:**
- Users must have a verified Codeforces account to create or join a battle.
- Problems are sourced from `https://codeforces.com/api/problemset.problems`.

### Push Notifications
- Browser push via Web Push API and VAPID keys.
- Works for both authenticated users and anonymous sessions (session-scoped).
- Preferences saved to `NotificationSetting` model.
- Notification content is personalized when `personalizedMessages` is enabled (uses stored username/handle).
- Scheduler checks every 5 minutes and sends notifications within a ±2.5-minute window of the user's set reminder time.

### User Search
- `GET /users/search?q=...` — partial username/name search, returns matching users with basic profile data.
- `SearchUsersModal` component used for finding other users.

---

## Tech Stack

### Frontend (`client/`)

| Concern | Library |
|---|---|
| Framework | React 19 |
| Build | Vite 7 (SWC plugin) |
| Routing | React Router 7 |
| Styling | Tailwind CSS 3 |
| Component primitives | Radix UI (dialog, dropdown, popover, avatar, tooltip, radio, etc.) |
| Charts | Recharts 2 |
| Icons | Lucide React + Tabler Icons |
| Animations | Framer Motion 12 |
| State (local) | React `useState` / `useContext` |
| State (atomic) | Jotai 2 |
| Toasts | Sonner |
| Date utilities | date-fns 4 |
| HTTP | Axios |
| Theme | next-themes (system/light/dark) |

### Backend (`server/`)

| Concern | Library |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (jsonwebtoken), Passport (google-oauth20, jwt) |
| Sessions | express-session + connect-mongo |
| Password hashing | bcryptjs |
| Scheduling | node-cron + setInterval |
| Push notifications | web-push (VAPID) |
| HTTP client | Axios |
| Rate limiting | express-rate-limit |
| ID generation | nanoid |
| HTML parsing | jsdom |
| Env | dotenv |

---

## Project Structure

```
Codemesh/
├── client/                          # React frontend
│   └── src/
│       ├── App.jsx                  # Router + providers
│       ├── contexts/
│       │   └── AuthContext.jsx      # Global auth state
│       ├── Pages/
│       │   ├── LandingPage.jsx
│       │   ├── CalendarPage.jsx
│       │   ├── Portfolio.jsx
│       │   ├── LeaderboardPage.jsx
│       │   ├── Settings.jsx
│       │   ├── BattlesPage.jsx
│       │   ├── CreateBattlePage.jsx
│       │   ├── JoinBattlePage.jsx
│       │   └── BattlePage.jsx
│       ├── components/
│       │   ├── OnboardingModal.jsx
│       │   ├── OnboardingWrapper.jsx
│       │   ├── SearchUsersModal.jsx
│       │   ├── Navbar.jsx
│       │   ├── Landing/             # Hero, Grid, SupportedPlatforms, FAQ, CTA, Footer
│       │   ├── Leaderboard/         # Podium, LeaderboardTable, LeaderboardFilters
│       │   ├── sidebar/             # AppSidebar, NavMain, NavUser, SiteHeader
│       │   └── ui/                  # Radix-based primitives + custom charts
│       ├── services/
│       │   ├── battleService.js
│       │   ├── leaderboardService.js
│       │   └── portfolioService.js
│       └── utils/
│           ├── api.jsx              # Axios instance base
│           └── calendarUtils.js    # ICS/Google/Outlook calendar export
│
├── server/                          # Express backend
│   └── src/
│       ├── app.js                   # Express setup, DB connect, scheduler init
│       ├── config/
│       │   ├── env.js               # dotenv loader
│       │   └── passport.js          # Google OAuth + JWT strategies
│       ├── controllers/             # HTTP handlers
│       ├── middlewares/
│       │   ├── auth.js              # authenticateToken, optionalAuth
│       │   └── rateLimit.js         # express-rate-limit config
│       ├── models/                  # Mongoose schemas
│       ├── routes/                  # Express routers
│       ├── schedulers/              # Cron + interval jobs
│       ├── services/
│       │   ├── battle/BattleService.js
│       │   ├── platform/            # CodeforcesServiceV2, LeetCodeServiceV2
│       │   ├── contestServices/     # CListService, ContestAggregatorService
│       │   ├── leaderboardService.js
│       │   └── unificationService.js
│       └── utils/
│           ├── analyticsCalculator.js
│           ├── badgeCalculator.js
│           ├── platformConverter.js
│           └── topicMapper.js
│
├── docs/
│   ├── ARCHITECTURE.md
│   └── LEADERBOARD_IMPLEMENTATION_SUMMARY.md
└── CodeMesh API Collection.postman_collection.json
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Google Cloud project with OAuth 2.0 credentials — **required**: the server will exit on startup without them.
- CList account and API key — required for contest sync.
- VAPID key pair — required for push notifications (generate with `npx web-push generate-vapid-keys`).

---

## Environment Variables

### `server/.env`

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/codemesh
NODE_ENV=development

CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
SESSION_SECRET=change_this_to_another_long_random_string

GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

CLIST_API_URL=https://clist.by/api/v2/contest/
CLIST_API_KEY=your_clist_api_key

VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

> **Note:** `BACKEN_URL` is present in the actual `.env` file but the code uses `BACKEND_URL`. Use `BACKEND_URL`.

### `client/.env`

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

> `VITE_VAPID_PUBLIC_KEY` is stored in env for service worker use. The app also fetches it dynamically from `GET /notifications/vapid-public-key`.

---

## Local Setup

```bash
# 1. Install server dependencies
cd server && npm install

# 2. Install client dependencies
cd ../client && npm install

# 3. Start the backend (port 3000 by default)
cd ../server && npm run dev

# 4. Start the frontend (new terminal, port 5173 by default)
cd ../client && npm run dev
```

Open `http://localhost:5173`.

On first boot the contest scheduler syncs contests immediately from CList, which may take a few seconds.

---

## Available Scripts

### Backend

```bash
npm run dev     # nodemon — auto-restart on file changes
npm start       # plain node
```

### Frontend

```bash
npm run dev     # Vite dev server with HMR
npm run build   # Production build to dist/
npm run preview # Serve the production build locally
npm run lint    # ESLint
```

---

## Pages and UI

| Route | Auth required | Description |
|---|---|---|
| `/` | No | Landing page — hero, feature grid, supported platforms, FAQ, CTA, footer |
| `/calendar` | No (optional) | Contest calendar with filters and push-notification settings |
| `/portfolio` | Yes | Your own unified portfolio |
| `/portfolio/:username` | No | Any user's public portfolio |
| `/leaderboard` | No | Global + per-platform leaderboard |
| `/settings` | Yes | Profile, socials, platform linking/verification, password |
| `/battles` | Yes | List of your battles (ongoing, upcoming, completed) |
| `/battles/create` | Yes | Create a new battle |
| `/battles/join` | Yes | Join by entering a token manually |
| `/battles/join/:joinToken` | Yes | Auto-join from share link |
| `/battle/:battleId` | Yes | Live battle page — problems, standings, timer, controls |

All authenticated pages redirect to `/` (or show a login prompt) if the user isn't authenticated. After login, all new users must complete onboarding before they can access the app.

---

## API Reference

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register with name, email, password |
| POST | `/signin` | No | Login with email, password |
| POST | `/logout` | No | Clear auth cookie |
| GET | `/auth/google` | No | Initiate Google OAuth |
| GET | `/auth/google/callback` | No | Google OAuth callback |
| GET | `/profile` | Yes | Get own profile with verified platforms |
| POST | `/refresh` | Yes | Rotate JWT and reset cookie |
| GET | `/oauth/user` | Yes | Get user data after OAuth callback |

### Contests

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/contests` | No | Get all contests, optional `?platform`, `?status`, `?difficulty`, `?limit` |
| POST | `/contests/sync` | No | Manually trigger CList sync |
| POST | `/contests/update-statuses` | No | Recompute upcoming/running/past for stored contests |
| GET | `/contests/stats` | No | Count of contests per platform and status |

### Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications/vapid-public-key` | No | Get VAPID public key for service worker registration |
| GET | `/notifications/preferences` | Optional | Get notification preferences for the current user/session |
| POST | `/notifications/preferences` | Optional | Save notification preferences |
| POST | `/notifications/subscribe` | Optional | Save a push subscription endpoint |

### Portfolio

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/portfolio` | Yes | Unified portfolio for authenticated user |
| GET | `/portfolio/:username` | No | Public portfolio by username (increments profile views) |
| GET | `/portfolio/:username/summary` | No | Key metrics summary (rating, solved, streaks, platforms, top topics) |

### Platform

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/platform/sync` | Yes | Sync one platform (`{ platform, handle }`) |
| POST | `/platform/sync-all` | Yes | Sync all linked platforms in parallel (rate-limited) |
| POST | `/platform/generate-verification-code` | Yes | Get a short verification code to paste in your CP profile |
| POST | `/platform/verify` | Yes | Verify that the code is visible on your profile |
| GET | `/platform/verification-status` | Yes | Check verification status for all linked platforms |
| GET | `/platform/codeforces` | Yes | Own Codeforces data (raw + computed stats) |
| GET | `/platform/leetcode` | Yes | Own LeetCode data (raw + computed stats) |
| GET | `/platform/:username/codeforces` | No | Public Codeforces data by CodeMesh username |
| GET | `/platform/:username/leetcode` | No | Public LeetCode data by CodeMesh username |
| GET | `/platform/:username/codechef` | No | Public CodeChef data by CodeMesh username |
| GET | `/platform/:username/:platform/summary` | No | Platform summary for any user |

### Leaderboard

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard` | No | Global leaderboard, `?page`, `?limit`, `?tier`, `?search`, `?country`, `?college`, `?graduationYear` |
| GET | `/leaderboard/top/:count` | No | Top N users (max 100) |
| GET | `/leaderboard/stats` | No | Aggregate statistics |
| GET | `/leaderboard/tier/:tier` | No | Filter by tier name |
| GET | `/leaderboard/user/:username` | No | Single user's leaderboard entry and rank |
| GET | `/leaderboard/context/:rank` | No | Users around a given rank (`?range=5`) |
| GET | `/leaderboard/search` | No | Search by username (`?q=`) |
| GET | `/leaderboard/platform/:platform` | No | Platform-specific sub-leaderboard |
| GET | `/leaderboard/platform/:platform/top/:count` | No | Top N for a platform |
| GET | `/leaderboard/me` | Yes | Authenticated user's rank and entry |
| POST | `/leaderboard/recalculate` | Yes | Recalculate own rating immediately |
| POST | `/leaderboard/admin/recalculate-all` | Yes | Batch recalculate all users |

### Users and Onboarding

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/search` | Optional | Search users by username or name |
| GET | `/users/:username` | No | Get public user profile by username |
| GET | `/users/platforms` | Yes | List linked platform accounts |
| PUT | `/users/profile` | Yes | Update name, bio, avatarUrl |
| PUT | `/users/socials` | Yes | Update social links |
| PUT | `/users/password` | Yes | Change password (requires current password) |
| GET | `/onboarding/status` | Yes | Check onboarding completion |
| POST | `/onboarding/complete` | Yes | Submit onboarding form |
| GET | `/onboarding/check-username` | Yes | Check if username is available |

### Battles

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/battles/time` | No | Server UTC timestamp for client clock sync |
| POST | `/battles` | Yes | Create a new battle |
| POST | `/battles/join/:joinToken` | Yes | Join a battle by token |
| GET | `/battles` | Yes | Get all battles for the authenticated user |
| GET | `/battles/:id` | Yes | Get a specific battle (participants only) |
| GET | `/battles/:id/participants` | Yes | Get participant list |
| GET | `/battles/:id/problems` | Yes | Get problems (only after battle starts) |
| GET | `/battles/:id/standings` | Yes | Get live standings |
| GET | `/battles/:id/submissions` | Yes | Get all submissions |
| POST | `/battles/:id/refresh` | Yes | Manually poll Codeforces for new submissions |
| POST | `/battles/:id/start` | Yes | Manually start (creator only) |
| POST | `/battles/:id/end` | Yes | Manually end (creator only) |
| DELETE | `/battles/:id` | Yes | Cancel a battle (creator only) |

---

## Scheduled Jobs

All schedulers start automatically when the server boots.

| Job | Trigger | What it does |
|---|---|---|
| Contest sync | On boot + every 6 hours | Fetches contests from CList for all 8 platforms, upserts to DB |
| Contest status update | Every 15 minutes | Marks contests as upcoming/running/past based on current time |
| Notification check | Every 5 minutes | Sends web push to users whose reminder window matches an upcoming contest |
| Battle auto-start | Every 30 seconds | Starts pending battles whose `startTime` has passed, fetches CF problems |
| Battle submission poll | Every 1 minute | Polls Codeforces API for new submissions for all `in_progress` battles |
| Battle auto-end | Every 30 seconds | Ends battles that have exceeded `startTime + durationMinutes` |
| Leaderboard rating recalculation | Every 6 hours | Recalculates CodeMesh rating for all active users in batches of 50 |
| Leaderboard rank update | Every hour (at :05) | Reorders and updates `currentRank`, `previousRank`, `rankChange` |
| Rating growth calculation | Daily at 2 AM | Placeholder — intended for 30d/90d growth tracking |

---

## Data Models

### `User`
Key fields: `username`, `email`, `name`, `password` (bcrypt), `googleId`, `authProvider`, `avatarUrl`, `bio`, `socials` (github/linkedin/twitter/website), `linkedAccounts[]`, `onboarding` (country/degree/institution/branch/status/graduationYear), `onboardingCompleted`, `profileViews`, `friends[]`, `isMfaEnabled`.

### `PlatformData`
Raw platform profile data. One document per `(user, platform)`. Fields: `handle`, `rawData` (full API response), `quickAccess` (rating, maxRating, rank, totalSolved, URLs), `lastSynced`, `isActive`, `isVerified`, `verifiedAt`.

### `PlatformSubmission`
Raw submission records from Codeforces or LeetCode. Fields: `user`, `platform`, `handle`, `submissionId`, `problemId`, `verdict`, `language`, `timestamp`, `tags`, `rating/difficulty`.

### `PlatformRatingHistory`
Rating change history per platform. Fields: `user`, `platform`, `handle`, `history[]` (contestId, rating, rank, timestamp).

### `Battle`
Fields: `title`, `createdBy`, `status` (pending/in_progress/completed/cancelled), `startTime`, `durationMinutes`, `minRating`, `maxRating`, `numProblems`, `joinToken` (unique 12-char nanoid), `participants[]` (user ref + codeforcesHandle + joinedAt), `problems[]` (contestId, index, name, rating), `endedAt`.

Virtuals: `endTime` (computed from `startTime + durationMinutes`).

### `BattleSubmission`
Codeforces submissions during a battle. Linked to `Battle`, participant user, and problem.

### `LeaderboardEntry`
One per user. Fields: `masterRating`, `ratingBreakdown` (coreRating, contestBonus, accuracyBonus, practiceBonus), `ratingComponents` (platformRatings[], totalContests, acceptanceRate, totalSolved), `currentRank`, `previousRank`, `rankChange`, `tier`, `performanceMetrics` (peakRating, ratingGrowth30d, ratingGrowth90d).

### `NotificationSetting`
One per user or session. Fields: `user` (ref, nullable for anonymous), `userId` (session string), `enabled`, `methods` (push), `platforms[]`, `difficulties[]`, `durations[]`, `reminderTime` (minutes), `pushSubscription`, `personalizedMessages`, `timezone`.

### `Contest`
Platform contest data synced from CList. Fields: `platform`, `name`, `url`, `startAt`, `endAt`, `durationSeconds`, `status`, `difficulty`, `participants`, `type`, `registrationOpen`.

---

## Rating System

The CodeMesh Master Rating formula:

```
masterRating = coreRating + contestBonus + accuracyBonus + practiceBonus

coreRating     = weighted average of normalized platform ratings
contestBonus   = min(log₂(totalContests + 1) × 20, 200)
accuracyBonus  = ((acceptanceRate - 40) / 55) × 150   [only if rate > 40%]
practiceBonus  = min(log₁₀(totalSolved + 1) × 33, 100)
```

Platform weights used in `coreRating`:

| Platform | Weight |
|---|---|
| Codeforces | 1.00 |
| AtCoder | 0.95 |
| CodeChef | 0.90 |
| LeetCode | 0.85 |
| HackerEarth | 0.75 |
| HackerRank | 0.70 |
| GeeksforGeeks | 0.65 |
| Code360 | 0.65 |

Rating is recalculated automatically after every platform sync and on the 6-hour scheduler cycle.

---

## Authentication

- JWT is issued on signup/signin/OAuth callback and set as an HTTP-only cookie named `authToken`.
- Cookie is `secure + SameSite=None` in production (`NODE_ENV=production`), `lax` in development.
- `authenticateToken` middleware checks the cookie first, then falls back to `Authorization: Bearer <token>`.
- `optionalAuth` middleware does the same but never fails — it just leaves `req.user` unset.
- CORS is restricted to `CLIENT_URL` (from env) and `http://localhost:5173`, with `credentials: true`.
- Session is stored in MongoDB via `connect-mongo` with a 7-day TTL.
- Google OAuth uses Passport's GoogleStrategy. The callback URL is `BACKEND_URL/api/v1/auth/google/callback`. After successful OAuth, the user is redirected back to `CLIENT_URL` (with the original path restored via the `state` parameter).

---

## Known Gaps / TODO

- No test suite. `server` test script is a placeholder. No test files exist anywhere.
- No root-level scripts to run both client and server together.
- `BACKEN_URL` key in `.env` is a typo — code reads `BACKEND_URL`.
- Battle page UI components directory (`client/src/components/Battle/`) exists but is empty — all battle UI lives inline in the page files.
- Rating growth calculation scheduler (daily 2 AM) is a placeholder stub with no implementation.
- Badge system (`badgeCalculator.js`) only awards two badges; the unlockable badge set is not fully built out.
- CodeChef, AtCoder, HackerRank, HackerEarth sync services are not implemented — `platform/codechef` route exists but no service class backs it.
- Friendship model exists but no friend-related routes or UI are implemented.
- MFA fields (`isMfaEnabled`, `mfaSecret`) are on the User schema but not implemented.
- Admin role/middleware is explicitly noted in leaderboard routes as a TODO.
- `FocusSession`, `Recommendation` models are defined but no routes or UI implement them.

---

## Team

TY IT B1  
Ritwik Mohanty


