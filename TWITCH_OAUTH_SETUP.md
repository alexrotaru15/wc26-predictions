# Twitch OAuth Setup Guide

## Step 1: Create Twitch Application

1. Go to https://dev.twitch.tv/console/apps
2. Click **"Register Your Application"**
3. Fill in the form:
   - **Name**: `World Cup 2026 Predictions` (or your choice)
   - **OAuth Redirect URLs**: `http://localhost:3000/api/auth/callback/twitch`
   - **Category**: Choose "Website Integration"
   - **Client Type**: "Confidential"
4. Click **"Create"**

## Step 2: Get Client ID and Secret

1. After creating, click **"Manage"** on your application
2. Copy the **Client ID**
3. Click **"New Secret"** to generate a **Client Secret**
4. Copy the **Client Secret** (you can only see it once!)

## Step 3: Update .env.local

Add these values to your `.env.local` file:

```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

## Step 4: Test Authentication

1. Start your dev server: `npm run dev`
2. Go to http://localhost:3000
3. You should be redirected to `/login`
4. Click "Sign in with Twitch"
5. Authorize the app
6. You'll be redirected back and logged in!

## For Production Deployment

When deploying to production (e.g., Vercel):

1. Go back to https://dev.twitch.tv/console/apps
2. Click **"Manage"** on your application
3. Add your production URL to **OAuth Redirect URLs**:
   - Example: `https://your-app.vercel.app/api/auth/callback/twitch`
4. Update environment variables in your hosting platform with the same Client ID and Secret

## Troubleshooting

### "Invalid redirect URI"
- Make sure you added `http://localhost:3000/api/auth/callback/twitch` exactly
- Check for typos in the URL

### "Client authentication failed"
- Verify your Client ID and Secret are correct in `.env.local`
- Make sure there are no extra spaces or quotes

### Still not working?
- Restart your dev server after updating `.env.local`
- Check the browser console for errors
- Verify your Supabase database is accessible
