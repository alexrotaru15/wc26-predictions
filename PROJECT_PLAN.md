# World Cup 2026 Predictions App - Project Plan

## Project Overview

A Next.js application for predicting FIFA World Cup 2026 match results. Users authenticate via Twitch, join private leagues, and compete on leaderboards based on prediction accuracy.

## Tech Stack Recommendation

### Frontend

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

### Backend

- **Next.js API Routes** (serverless functions)
- **Supabase** (PostgreSQL database + storage + real-time)
- **Prisma** as ORM

### Authentication

- **NextAuth.js v5** with Twitch provider
- **Supabase** for session storage and RLS policies

### Deployment

- **Vercel** (optimal for Next.js)
- **Supabase** (database, storage, and backend services)

---

## Database Schema

### Core Tables

#### Users

- id (UUID)
- twitchId (unique)
- username
- displayName
- avatarUrl
- createdAt
- updatedAt

#### Teams

- id (UUID)
- name
- code (3-letter FIFA code, e.g., "USA")
- flagUrl
- group (A-H for group stage)

#### Matches

- id (UUID)
- matchNumber
- stage (GROUP, ROUND_16, QUARTER, SEMI, FINAL)
- homeTeamId (FK to Teams, nullable for TBD)
- awayTeamId (FK to Teams, nullable for TBD)
- scheduledAt (datetime)
- homeScore (nullable until match ends)
- awayScore (nullable until match ends)
- isFinished (boolean)
- group (for group stage matches)

#### Leagues

- id (UUID)
- name
- inviteCode (unique, 8-char alphanumeric)
- createdById (FK to Users)
- createdAt
- updatedAt

#### LeagueMembers

- id (UUID)
- leagueId (FK to Leagues)
- userId (FK to Users)
- joinedAt
- Unique constraint on (leagueId, userId)

#### Predictions

- id (UUID)
- userId (FK to Users)
- matchId (FK to Matches)
- homeScore (integer)
- awayScore (integer)
- points (nullable, calculated after match ends)
- createdAt
- updatedAt
- Unique constraint on (userId, matchId)

---

## Implementation Steps

### Phase 1: Project Setup & Database (Days 1-2)

#### Step 1.1: Initialize Supabase

- [ ] Create Supabase project at https://supabase.com
- [ ] Get database connection string (use connection pooling URL for Prisma)
- [ ] Install dependencies: `npm install @supabase/supabase-js prisma @prisma/client`
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Update DATABASE_URL in `.env` with Supabase connection pooler URL
- [ ] Create schema.prisma with all tables
- [ ] Run migrations: `npx prisma migrate dev`
- [ ] Enable Row Level Security (RLS) policies in Supabase dashboard

#### Step 1.2: Setup Authentication

- [ ] Install NextAuth: `npm install next-auth@beta`
- [ ] Configure Twitch OAuth app (get Client ID & Secret from Twitch Developer Console)
- [ ] Create `/app/api/auth/[...nextauth]/route.ts`
- [ ] Configure NextAuth to use Supabase adapter (optional) or Prisma adapter
- [ ] Setup session management
- [ ] Create auth middleware for protected routes

#### Step 1.3: Setup Supabase Storage

- [ ] Create storage bucket for team flags: `team-flags`
- [ ] Set bucket to public access
- [ ] Install Supabase client for file uploads

#### Step 1.4: Environment Setup

- [ ] Setup `.env.local` with:
  - DATABASE_URL (Supabase connection pooler)
  - DIRECT_URL (Supabase direct connection for migrations)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT*PUBLIC_SUPABASE_PUBLISHABLE_KEY (new format: `sb_publishable*...`)
  - SUPABASE*SECRET_KEY (new format: `sb_secret*...`, for admin operations)
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL
  - TWITCH_CLIENT_ID
  - TWITCH_CLIENT_SECRET

> **Note:** Use the new publishable/secret keys instead of legacy `anon`/`service_role` JWT keys

---

### Phase 2: Admin Panel (Days 3-5)

#### Step 2.1: Admin Authentication

- [ ] Add `isAdmin` field to Users table
- [ ] Create admin middleware
- [ ] Manually set your user as admin in database

#### Step 2.2: Team Management

- [ ] Create `/app/admin/teams` page
- [ ] Build form to add/edit teams
- [ ] Add team to group assignment
- [ ] Upload team flags to Supabase Storage bucket
- [ ] Store flag URLs in database

#### Step 2.3: Match Management

- [ ] Create `/app/admin/matches` page
- [ ] Build form to create matches:
  - Select teams (or mark as TBD for knockout stages)
  - Set match date/time
  - Assign stage and group
- [ ] Build interface to update match results
- [ ] Implement auto-calculation of prediction points when result is entered

#### Step 2.4: Points Calculation Logic

```typescript
function calculatePoints(prediction, result) {
	if (
		prediction.homeScore === result.homeScore &&
		prediction.awayScore === result.awayScore
	) {
		return 3; // Exact score
	}

	const predictionOutcome = getOutcome(
		prediction.homeScore,
		prediction.awayScore,
	);
	const resultOutcome = getOutcome(result.homeScore, result.awayScore);

	if (predictionOutcome === resultOutcome) {
		return 1; // Correct outcome (1/X/2)
	}

	return 0;
}

function getOutcome(homeScore, awayScore) {
	if (homeScore > awayScore) return "1";
	if (homeScore < awayScore) return "2";
	return "X";
}
```

---

### Phase 3: User Features (Days 6-9)

#### Step 3.1: League Management

- [ ] Create `/app/leagues/create` page
- [ ] Generate unique 8-character invite codes
- [ ] Create `/app/leagues/join/[code]` page for joining
- [ ] Create `/app/leagues/[id]` page to view league details
- [ ] List user's leagues on dashboard

#### Step 3.2: Predictions Interface

- [ ] Create `/app/matches` page showing all matches
- [ ] Group matches by stage and date
- [ ] Build prediction form for each match
- [ ] Disable predictions after match starts
- [ ] Show existing predictions (editable before match starts)
- [ ] Visual indicators: locked (started), pending, completed

#### Step 3.3: Leaderboards

- [ ] Create `/app/leagues/[id]/leaderboard` page
- [ ] Calculate total points per user per league
- [ ] Show ranking, username, total points
- [ ] Show detailed breakdown (points per match)
- [ ] Add filters: by stage, by date range

---

### Phase 4: UI/UX Polish (Days 10-11)

#### Step 4.1: Dashboard

- [ ] Create `/app/dashboard` as main landing page
- [ ] Show user's leagues
- [ ] Show upcoming matches
- [ ] Show recent predictions
- [ ] Quick stats (total points, rank in leagues)

#### Step 4.2: Match Display

- [ ] Create reusable Match Card component
- [ ] Show team flags, names, scores
- [ ] Show match date/time with timezone handling
- [ ] Show user's prediction vs actual result
- [ ] Color coding: correct (green), wrong (red), pending (gray)

#### Step 4.3: Responsive Design

- [ ] Mobile-first design
- [ ] Test on various screen sizes
- [ ] Optimize for both desktop and mobile

---

### Phase 5: Testing & Deployment (Days 12-13)

#### Step 5.1: Testing

- [ ] Test authentication flow
- [ ] Test league creation and joining
- [ ] Test prediction submission and locking
- [ ] Test points calculation
- [ ] Test admin panel
- [ ] Test edge cases (TBD teams, timezone issues)

#### Step 5.2: Deployment

- [ ] Supabase project is already live (no separate deployment needed)
- [ ] Deploy Next.js app to Vercel
- [ ] Setup environment variables in Vercel (copy from `.env.local`)
- [ ] Run production migrations against Supabase: `npx prisma migrate deploy`
- [ ] Test production deployment
- [ ] Verify Supabase Storage bucket is accessible

#### Step 5.3: Data Population

- [ ] Add all 48 teams to database
- [ ] Create all group stage matches (48 matches)
- [ ] Create knockout stage structure (32 matches, teams TBD)
- [ ] Verify all match times are correct

---

## Key Features Summary

### User Flow

1. User visits site → Redirected to login
2. Login with Twitch → Create/join leagues
3. Browse matches → Submit predictions before match starts
4. View leaderboards → Track ranking in leagues
5. Check results → See points earned

### Admin Flow

1. Login as admin → Access admin panel
2. Manage teams → Add/edit team information
3. Manage matches → Create matches, set schedules
4. Update results → Enter final scores (auto-calculates points)
5. Monitor → View all predictions and leagues

---

## Why Supabase?

### Key Benefits for This Project

**Database:**

- PostgreSQL with generous free tier (500MB database)
- Built-in connection pooling (perfect for serverless)
- Works seamlessly with Prisma ORM

**Storage:**

- Built-in file storage for team flags/logos
- Public bucket URLs (no need for signed URLs)
- Free tier: 1GB storage

**Admin Features:**

- Web dashboard to view/edit data directly
- SQL editor for quick queries
- Real-time database changes viewer

**Security:**

- Row Level Security (RLS) policies
- Ensures users can only edit their own predictions
- Admin-only access to match results

**Future-Proof:**

- Real-time subscriptions available (live leaderboards)
- Built-in auth system (if you want to expand beyond Twitch)
- Edge functions for custom logic

**Free Tier Limits:**

- 500MB database (plenty for this project)
- 1GB file storage
- 2GB bandwidth
- Unlimited API requests

---

## Timeline Estimate

- **Total Development Time:** 12-15 days
- **Phase 1:** 2 days
- **Phase 2:** 3 days
- **Phase 3:** 4 days
- **Phase 4:** 2 days
- **Phase 5:** 2 days
- **Buffer:** 2 days for unexpected issues

---

## Next Steps

1. Create Supabase account and project
2. Install dependencies (Supabase client, Prisma, NextAuth)
3. Initialize Prisma schema with Supabase connection
4. Setup Twitch OAuth application
5. Begin Phase 1 implementation

---

## Notes

- World Cup 2026 runs June 11 - July 19, 2026
- 48 teams, 16 groups of 3 teams each (new format)
- Total 104 matches
- Timezone handling is critical (matches across USA, Canada, Mexico)
- Consider adding email notifications for match reminders (optional future feature)
