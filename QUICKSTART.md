# Teatime Quick Start (5 Minutes)

Get the app running locally in less than 5 minutes.

## Prerequisites

- Node.js 18+ ([download](https://nodejs.org))
- A Supabase account ([free at supabase.com](https://supabase.com))
- Git ([download](https://git-scm.com))

## Step 1: Clone Repo

```bash
git clone https://github.com/YOUR_USERNAME/teatime-app.git
cd teatime-app
```

## Step 2: Install Dependencies

```bash
npm install
```

Takes ~30 seconds.

## Step 3: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Click **"New Project"**
4. Name it `teatime-dev`
5. Set a database password (something random)
6. Click **"Create New Project"** (wait 1 minute for it to spin up)

## Step 4: Run SQL Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of `sql/schema.sql` into the editor
4. Click **"Run"** (it auto-executes all 16 steps)
5. Verify the query succeeded

## Step 5: Get API Keys

1. Go to **Settings → API** in Supabase dashboard
2. Copy **Project URL** (looks like `https://xxx.supabase.co`)
3. Copy **anon public** key (long string)

## Step 6: Create .env.local

In project root, create a file called `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Paste the values from Step 5.

## Step 7: Run App

```bash
npm run dev
```

Opens at `http://localhost:3000`

## Step 8: Test It

1. Click **"Start with an email"**
2. Enter your email (e.g., `test@example.com`)
3. Check your email for magic link
4. Click the link → you'll be sent to onboarding
5. Allow location access (Chrome will ask)
6. Pick an office or add your own
7. Enter your name
8. **Boom!** You're on the home page

## Step 9: Test Realtime (Optional)

Open the app in **2 browser tabs** with different emails:

**Tab 1**: Go to Map, click the orange `+` button
- Create a "tea" request
- Note expires in 30 minutes

**Tab 2**: Watch the top of the screen
- A notification popup should appear in 0.5 seconds
- Click "Join"
- Go back to Tab 1 → `/my-requests` shows 1 participant

## Troubleshooting

### "Location not available"
- Click the location button again (Chrome might be blocking it)
- Check DevTools Console for errors
- On HTTPS production, location works automatically

### "No offices shown"
- The schema seeds 4 offices in India (Infosys, IIT, TCS, Haldia Institute)
- If you're elsewhere, click "Add your workplace"

### "Email not received"
- Check spam folder
- Try a different email
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct (no trailing `/`)

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## Next Steps

- Read `README.md` for full feature docs
- Read `DEPLOYMENT.md` to launch to production
- Customize colors in `src/app/globals.css`
- Add more seed offices in `sql/schema.sql` (line 250+)

## Architecture at a Glance

```
You (localhost:3000)
        ↓
   Next.js App
        ↓
  Supabase Client
        ↓
  Supabase (Auth + Database + Realtime)
        ↓
   PostgreSQL + PostGIS
```

That's it! You're running a location-based social app.

---

**Need help?** Check `README.md` or open an issue on GitHub.
