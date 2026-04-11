# Setup Guide - World Cup 2026 Predictions App

## ✅ Completed Steps

- [x] Installed Supabase client libraries
- [x] Created Supabase utility files (`src/utils/supabase/`)
- [x] Installed Prisma
- [x] Created Prisma schema
- [x] Created `.env.local` template

## 🚀 Next Steps

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `wc26-predictions` (or your choice)
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is perfect

5. Wait for project to be created (~2 minutes)

### Step 2: Get Supabase Credentials

Once your project is ready:

#### Get API Keys:

1. Go to **Project Settings** (gear icon) → **API Keys**
2. If you don't have a publishable key yet, click **Create new API Keys**
3. Copy these values from the **API Keys** tab (NOT the Legacy API Keys tab):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable key** (starts with `sb_publishable_`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Secret key** (starts with `sb_secret_`) → `SUPABASE_SECRET_KEY`

> **Note:** Use the new publishable/secret keys, not the legacy `anon`/`service_role` JWT keys. The new keys are more secure and easier to rotate.

#### Get Database URLs:

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **Connection pooling** tab
4. Mode: **Transaction**
5. Copy the connection string → This is your `DATABASE_URL`
6. Replace `[YOUR-PASSWORD]` with your database password
7. Add `?pgbouncer=true` at the end

8. Now select **Session** mode
9. Copy this connection string → This is your `DIRECT_URL`
10. Replace `[YOUR-PASSWORD]` with your database password

### Step 3: Update `.env.local`

Open `.env.local` and fill in all the values you just copied:

```env
# Supabase - Use new publishable/secret keys (not legacy anon/service_role)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxx...
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxx...

# Database
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# NextAuth (we'll set these up later)
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Twitch OAuth (we'll set these up later)
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
```

### Step 4: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET` in `.env.local`

### Step 5: Run Database Migration

Now let's create the database tables:

```bash
npx prisma migrate dev --name init
```

This will:

- Create all tables in your Supabase database
- Generate Prisma Client
- Create a migration file

### Step 6: Setup Supabase Storage

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `team-flags`
4. **Public bucket**: ✅ YES (check this!)
5. Click **Create bucket**

### Step 7: Verify Setup

Run this to open Prisma Studio and verify your database:

```bash
npx prisma studio
```

You should see all your tables (users, teams, matches, leagues, etc.)

---

## 📝 What We'll Do Next

After completing these steps, we'll:

1. **Setup Twitch OAuth** (for user authentication)
2. **Install NextAuth.js** and configure it
3. **Create the admin panel** to add teams and matches
4. **Build the user interface** for predictions

---

## 🔍 Troubleshooting

### Database connection issues?

- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Check that `?pgbouncer=true` is at the end of `DATABASE_URL`
- Verify your IP is not blocked (Supabase allows all IPs by default)

### Migration fails?

- Check that both `DATABASE_URL` and `DIRECT_URL` are set correctly
- Make sure you're using the correct connection pooling mode (Transaction for DATABASE_URL)

### Environment variables not loading?

- Restart your dev server: `npm run dev`
- Make sure `.env.local` is in the root directory

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
