# CodeMesh

Your competitive programming journey, in one place.

CodeMesh brings your contest calendar, coding profiles, performance analytics, and ranked battles together. Link your platforms to track progress, compare ratings on the global leaderboard, and compete head-to-head in Codeforces and LeetCode battles.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Scheduled Jobs](#scheduled-jobs)
5. [Rating System](#rating-system)
6. [Authentication](#authentication)
7. [License](#license)
8. [Team](#team)

---

## Features


### Onboarding
- First-time users are forced through a two-step onboarding modal before accessing the app.
- Step 1 collects username (availability checked in real-time), full name, and country.
- Step 2 collects degree, institution, branch, student/alumni status, and graduation year.
- The `onboardingCompleted` flag gates all protected pages.

### Contest Calendar (`/calendar`)
- Fetches upcoming and running contests from 8 platforms via CList API: Codeforces, LeetCode, AtCoder, CodeChef, HackerRank, GeeksforGeeks, Code360, HackerEarth.
- Full month calendar view with filters by platform, difficulty, and duration.
- Timezone-aware rendering. Export any contest to Google Calendar or Outlook.
- Push notification support: users can subscribe to reminders before contests start, with a custom reminder time and platform/difficulty/duration filters. Preferences saved per user or per anonymous session.

### Portfolio (`/portfolio`, `/portfolio/:username`)
- Unified view aggregating data from all linked and synced platforms.
- Stats overview: total problems solved, CodeMesh rating, active day streak, acceptance rate.
- Activity heatmap and streak tracking generated from raw submission timestamps.
- Problem, category, and topic distribution charts across platforms.
- Per-platform cards showing rating, handle, profile URL, verification badge, and total solved.
- Badges, social links, and a public profile view counter.
- Public profiles are viewable at `/portfolio/:username` without login.
- "Sync All" triggers a parallel refresh of all linked platforms and recalculates leaderboard rating immediately.

### Settings (`/settings`)
- **Profile**: display name, bio, avatar URL.
- **Socials**: GitHub, LinkedIn, Twitter, personal website.
- **Platforms**: link Codeforces and LeetCode handles, trigger sync, and verify handle ownership (a short code the user posts to their platform profile, checked server-side). Verified handles show a badge. Also handles password change.

### Leaderboard (`/leaderboard`)
- Three tabs: CodeMesh Master Rating, Codeforces, LeetCode.
- Top-3 podium plus a paginated table (50/page) for each tab.
- Filters: tier, country, college/institution, graduation year (CodeMesh tab).

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
Head-to-head competitive programming battles, now supporting both Codeforces and LeetCode.

- Creator sets title, scheduled start time, duration (10–300 min), rating range, and number of problems, and gets a shareable join link with a unique token.
- Other users join before start; auto-join is triggered from the share link for users with a verified handle on the battle's platform.
- On start, the scheduler randomly selects problems within the rating range (from a cached, periodically refreshed problem list), excluding problems both participants have already solved.
- During the battle, a scheduler polls the platform API for new submissions from all participants.
- Battle auto-ends at `startTime + durationMinutes` and computes final standings; the creator can also start, end, or cancel manually.
- Battle page shows a live countdown, participant list, problem list (post-start), live standings, submission history, and a cooldown-limited manual refresh.
- Requires a verified handle on the relevant platform to create or join.

### Push Notifications
- Browser push via Web Push API and VAPID keys, for both authenticated users and anonymous sessions.
- Notification content is personalized when enabled (uses stored username/handle).

### User Search
- Partial username/name search across users, surfaced via a search modal.

---

## Tech Stack

### Frontend (`client/`)

| Concern | Library |
|---|---|
| Framework | React 19 |
| Build | Vite 7 (SWC plugin) |
| Routing | React Router 7 |
| Styling | Tailwind CSS 3 |
| Component primitives | Radix UI |
| Charts | Recharts 2 |
| Icons | Lucide React + Tabler Icons |
| Animations | Framer Motion 12 |
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
│           └── calendarUtils.js     # ICS/Google/Outlook calendar export
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
│       ├── schedulers/              # battleScheduler, contestScheduler, leaderboardScheduler, notificationScheduler
│       ├── services/
│       │   ├── battle/              # BattleService, LeetCodeBattleService
│       │   ├── platform/            # BasePlatformService, CodeforcesServiceV2, LeetCodeServiceV2
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
│   ├── LEADERBOARD_IMPLEMENTATION_SUMMARY.md
│   └── LEADERBOARD_FIX.md
└── CodeMesh API Collection.postman_collection.json
```

---

## Scheduled Jobs

All schedulers start automatically when the server boots, from four files in `server/src/schedulers/`.

| File | Jobs |
|---|---|
| `contestScheduler.js` | Contest sync from CList (on boot + every 6h); contest status updates (every 15m) |
| `notificationScheduler.js` | Push notification dispatch for contest reminders (every 5m) |
| `battleScheduler.js` | Battle auto-start (every 30s); submission polling for in-progress battles (every 1m); battle auto-end (every 30s) |
| `leaderboardScheduler.js` | Master rating recalculation (every 6h); rank reordering (hourly at :05); rating growth calculation (daily at 2 AM) |

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

## License

See [LICENSE.md](./LICENSE.md).

---

## Team

TY IT B1
Ritwik Mohanty
