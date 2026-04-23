# Teatime Deployment Guide

Deploy your Teatime app to production in <10 minutes.

---

## Option A: Vercel (Easiest)

Vercel is optimized for Next.js and handles all the DevOps for you.

### 1. Create Vercel Account

Go to [vercel.com](https://vercel.com) → sign up with GitHub.

### 2. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Teatime app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/teatime-app.git
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to **vercel.com/dashboard**
2. Click **"Add New..." → "Project"**
3. Select **GitHub** → authorize Vercel
4. Search & select **`teatime-app`** repo
5. Click **"Import"**
6. **Configure environment**:
   - Root Directory: `.`
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Start Command: `npm start`
7. Click **"Environment Variables"** → add:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: `your-anon-key-here`
8. Click **"Deploy"**

**That's it!** Your app is live at `https://teatime-app.vercel.app`

Every push to `main` auto-deploys.

---

## Option B: Docker + Railway

Railway is a simple platform for running Docker containers.

### 1. Create Railway Account

Go to [railway.app](https://railway.app) → sign up with GitHub.

### 2. Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Deploy to Railway

1. Push code to GitHub (see Option A step 2)
2. Go to **railway.app/dashboard**
3. Click **"+ New Project"**
4. Select **"Deploy from GitHub repo"**
5. Select **`teatime-app`**
6. Railway auto-detects the Dockerfile
7. Add **environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
8. Click **"Deploy"**

Your app runs at `https://teatime-app.up.railway.app`

---

## Option C: DigitalOcean App Platform

### 1. Create DigitalOcean Account

Go to [digitalocean.com](https://digitalocean.com) → sign up.

### 2. Create App Spec

In your repo, create `.do/app.yaml`:

```yaml
name: teatime
services:
  - name: web
    github:
      repo: YOUR_USERNAME/teatime-app
      branch: main
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    envs:
      - key: NEXT_PUBLIC_SUPABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${SUPABASE_URL}
      - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
        scope: RUN_AND_BUILD_TIME
        value: ${SUPABASE_ANON_KEY}
    http_port: 3000

static_sites:
  - source_dir: public
    routes:
      - path: /static
        destination: /

envs:
  - key: SUPABASE_URL
    value: https://your-project.supabase.co
  - key: SUPABASE_ANON_KEY
    value: your-anon-key-here
```

### 3. Deploy

```bash
# Install doctl CLI
brew install doctl

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec .do/app.yaml
```

---

## Supabase Production Setup

### 1. Create Production Project

1. Go to **supabase.com/dashboard**
2. Click **"New Project"**
3. Set **Organization**: your org
4. Set **Project name**: `teatime-prod`
5. Set **Database password**: strong random string
6. Select **Region**: closest to users (e.g., `ap-south-1` for India)
7. Click **"Create New Project"** (takes ~2 min)

### 2. Run SQL Schema

1. Go to **SQL Editor**
2. Paste entire contents of `sql/schema.sql`
3. Execute (Ctrl+Enter)
4. Verify all 16 steps completed (check `offices`, `profiles`, `requests` tables exist)

### 3. Seed Initial Data (Optional)

The schema already seeds 4 offices in India. To add more:

```sql
INSERT INTO public.offices(name, address, kind, location, verified) VALUES
  ('HCL Bangalore', 'Electronic City, Bangalore', 'office',
   st_makepoint(77.6724, 12.9596)::geography, true),
  ('Flipkart Bangalore', 'Mahadevapura, Bangalore', 'office',
   st_makepoint(77.7597, 13.0827)::geography, true);
```

### 4. Enable Row Level Security

Already enabled in schema. Verify:

```sql
SELECT * FROM information_schema.table_privileges 
WHERE table_name IN ('profiles', 'requests', 'offices')
  AND privilege_type = 'SELECT';
```

### 5. Get Production Credentials

1. Go to **Settings → API**
2. Copy **Project URL** → env var `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **anon public** key → env var `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **Never commit these keys. Use your deployment platform's env var interface.**

### 6. Set Up Backups

Supabase auto-backups daily. To enable point-in-time recovery:

1. Go to **Settings → Backups**
2. Enable **"Daily backups"**
3. Download latest backup as `.sql` file before major changes

### 7. Monitor Performance

1. Go to **Database → Logs**
2. View slow queries + errors in real-time
3. Set up **Alerts** for high connection count

---

## Environment Variables Checklist

### Vercel
```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = xxx
```

### Railway
```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = xxx
NODE_ENV = production
```

### DigitalOcean
```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = xxx
```

---

## DNS & Custom Domain

### Add Custom Domain (Vercel)

1. Go to **Vercel Dashboard → Settings → Domains**
2. Enter your domain (e.g., `teatime.app`)
3. Add **DNS records** to your registrar:
   - **Type**: `CNAME`
   - **Name**: `teatime`
   - **Value**: `Cname.vercel-dns.com`
4. Wait 24h for propagation

### SSL/TLS

Vercel auto-provisions free SSL certificates. No extra step needed.

---

## Monitoring & Logging

### Vercel Analytics

1. Go to **Analytics** tab in dashboard
2. See real-time requests, errors, performance metrics
3. Set up **alerts** for error spike

### Supabase Logs

1. Go to **Logs** in Supabase dashboard
2. Filter by **Postgres Logs** or **Auth Logs**
3. Set up **Alerts** (paid feature)

### Error Tracking (Optional)

Add Sentry for production error tracking:

```bash
npm install @sentry/nextjs
```

Then in `next.config.js`:

```js
const withSentryConfig = require("@sentry/nextjs");
module.exports = withSentryConfig(nextConfig);
```

---

## Scaling Checklist

- [ ] Supabase upgraded to **Pro** plan (handles >1M requests/month)
- [ ] Database connection pool increased (Supabase Settings → Database)
- [ ] CDN enabled for static assets (Vercel auto-does this)
- [ ] Rate limiting on auth endpoints (implement in Supabase RLS)
- [ ] Caching headers set on Leaflet tiles
- [ ] Database indexes exist on `requests.status`, `requests.expires_at`, `profiles.last_seen_at`

---

## Troubleshooting Production

### 500 Error on Deploy

1. Check **Vercel Build Logs**:
   ```bash
   vercel logs https://teatime-app.vercel.app --follow
   ```
2. Likely cause: missing env var → double-check `NEXT_PUBLIC_SUPABASE_*`

### Map Not Loading

1. Ensure OpenStreetMap tiles accessible from your region
2. Check Supabase CORS settings:
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM auth.config WHERE key = 'jwt_exp';
   ```

### Slow Requests

1. Check PostgreSQL slow log:
   ```sql
   SELECT * FROM pg_stat_statements 
   ORDER BY total_time DESC LIMIT 5;
   ```
2. Add index if needed:
   ```sql
   CREATE INDEX idx_requests_status_expires 
   ON requests(status, expires_at);
   ```

### High Latency

- Supabase connection pool exhausted:
  - Go to **Settings → Database → Connection pooling**
  - Increase **"Pooling Mode Max Client Connections"** to 100
  - Set **"Idle In Transaction Session Timeout"** to 60s

---

## Post-Launch Checklist

- [ ] Test magic link auth with real email
- [ ] Verify GPS works on real phone (not just dev)
- [ ] Check notifications work (test from 2 phones)
- [ ] Verify map is responsive on all screen sizes
- [ ] Test with slow network (DevTools → throttle)
- [ ] Check mobile browsers: Safari, Chrome, Firefox
- [ ] Verify deep links work (if sharing requests)
- [ ] Test logout flow

---

## Rollback

If something breaks in production:

### Vercel
```bash
# Go to Deployments tab → click earlier version → "Promote to Production"
```

### Railway
```bash
# Go to Deployments → select previous version → click "View Logs"
```

### Database Rollback
```bash
# Supabase Dashboard → Backups → Download + restore
```

---

## Cost Estimate (Monthly)

- **Vercel**: $0–20 (hobby free, pro $20)
- **Supabase**: $25–100 (free tier has limits, pro is $25)
- **Domain**: $10 (GoDaddy/Namecheap)
- **Total**: ~$35–140/month for production

---

That's it! Your app is production-ready.
