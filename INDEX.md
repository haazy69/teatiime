# Teatime App — Complete File Index

## Start Here

**First time?** → Read this in order:
1. `PROJECT_SUMMARY.md` (2 min overview)
2. `QUICKSTART.md` (get running in 5 min)
3. `README.md` (full feature guide)
4. `DEPLOYMENT.md` (launch to production)

---

## File Directory with Descriptions

### 📦 Project Root
```
.env.local.example           Copy this to .env.local + fill in Supabase credentials
.gitignore                   Don't commit node_modules, .next, .env.local
package.json                 All npm dependencies (Next, Supabase, Leaflet, etc.)
tsconfig.json                TypeScript compiler config
next.config.js               Next.js build optimizations
tailwind.config.js           Design tokens (colors, fonts, animations)
postcss.config.js            Tailwind + Autoprefixer pipeline
```

### 📖 Documentation
```
README.md                    ⭐ Full feature guide + architecture deep-dive
QUICKSTART.md                ⭐ Get app running in 5 minutes
DEPLOYMENT.md                ⭐ Deploy to Vercel / Railway / DigitalOcean
PROJECT_SUMMARY.md           ⭐ What you got + requirements checklist
INDEX.md                     This file (you are here)
```

### 🗄️ Database
```
sql/schema.sql               ⭐⭐⭐ COMPLETE Supabase setup
                             Run this in Supabase SQL Editor once
                             Creates: tables, RPCs, triggers, RLS, realtime
```

### 🎨 Frontend

#### Pages (in src/app/)
```
page.tsx                     Landing page (editorial hero)
layout.tsx                   Root layout (mobile shell)
globals.css                  ⭐ 2026 design system (colors, animations, components)
middleware.ts                Auth routing + session refresh

auth/
  page.tsx                   Email magic-link login form
  callback/route.ts          OAuth callback handler

onboarding/
  page.tsx                   Geo + office picker (requirement #6)

home/
  page.tsx                   ⭐⭐⭐ Main app (map + requests + realtime)

my-requests/
  page.tsx                   View requests you created

notifications/
  page.tsx                   Alerts feed

profile/
  page.tsx                   User settings
```

#### Components (in src/components/)
```
MapView.tsx                  Leaflet map with emoji pins
CreateRequestSheet.tsx       Bottom sheet to post request
IncomingRequestPopup.tsx     Realtime notification popup
BottomNav.tsx                Blinkit-style bottom navigation
```

#### Hooks (in src/hooks/)
```
useLocation.ts               GPS + auto-push to DB every 2 min
useRealtimeNotifications.ts  Supabase realtime subscriptions
```

#### Libraries (in src/lib/)
```
supabase-browser.ts          Client-side Supabase instance
supabase-server.ts           Server-side SSR-safe instance
```

#### Types (in src/types/)
```
index.ts                     TypeScript interfaces (Activity, Profile, etc.)
```

---

## Code Flow Cheatsheet

### User Logs In
```
Landing (/) 
  → Auth (/auth) 
  → Magic link in email 
  → Auth callback (/auth/callback) 
  → Onboarding (/onboarding) 
  → Home (/home)
```

### Posting a Request
```
Home page
  → Click + button
  → CreateRequestSheet opens
  → Pick activity + note
  → POST request to DB
  → Trigger fires: notify nearby users
  → Realtime: other users see notification popup in <1s
```

### SQL Queries Used
```
offices_nearby(lat, lng)      // onboarding: find nearby workplaces
requests_nearby(lat, lng)     // home: find open requests
people_nearby(lat, lng)       // future feature: find nearby people
update_my_location(lat, lng)  // background: push GPS to DB
```

---

## Key Files by Feature

### GPS & Location
- `src/hooks/useLocation.ts` — captures GPS + updates DB
- `src/app/globals.css` — styling for location indicator
- `src/app/home/page.tsx` — displays location on map

### Map Display
- `src/components/MapView.tsx` — Leaflet map component
- `sql/schema.sql` — PostGIS geospatial types
- `src/app/globals.css` — `.leaflet-*` styles

### Notifications
- `src/hooks/useRealtimeNotifications.ts` — Supabase realtime subscription
- `src/components/IncomingRequestPopup.tsx` — shows popup
- `sql/schema.sql` — triggers that insert notifications

### Authentication
- `src/app/auth/page.tsx` — login form
- `src/app/auth/callback/route.ts` — handle magic link
- `src/middleware.ts` — protect routes

### Office Detection (Requirement #6)
- `src/app/onboarding/page.tsx` — office picker + add form
- `sql/schema.sql` — `offices_nearby()` RPC
- `src/lib/supabase-browser.ts` — calls the RPC

---

## How to Modify Things

### Change Colors
Edit `src/app/globals.css`:
```css
--ember: #ff5722;  /* orange for CTAs */
--matcha: #8db580; /* green for "live" */
```

### Change Fonts
Edit `tailwind.config.js`:
```js
--font-display: "Instrument Serif"  // display headlines
--font-sans: "Geist"                 // body text
```

### Change Activities
Edit `src/types/index.ts`:
```ts
export const ACTIVITIES = [
  { key: "tea", label: "Tea", emoji: "🍵" },
  // add more here
];
```

### Add New Office
Run in Supabase SQL Editor:
```sql
INSERT INTO public.offices(name, location, kind, verified)
VALUES ('My Company', st_makepoint(88.0664, 22.0667)::geography, 'office', true);
```

### Change Request Expiry
Edit `src/components/CreateRequestSheet.tsx`:
```ts
expires_at: new Date(Date.now() + 30 * 60 * 1000)  // 30 min, change to 60 * 1000 for 1 hour
```

### Change Map Radius
Edit `src/app/home/page.tsx`:
```ts
radius_m: 2000  // 2km, change to 5000 for 5km
```

---

## Testing Locally

### Test 1: Single User
```bash
npm run dev
# Login with email1@test.com
# Allow location
# Post a request
# Go to /my-requests → see it listed
```

### Test 2: Realtime Notification
```bash
# Open 2 browser tabs
# Tab A: Login as email1@test.com
# Tab B: Login as email2@test.com
# Tab A: Post request
# Tab B: Watch notification popup appear in <1s
```

### Test 3: Office Detection
```bash
# Onboarding should show 4 seeded offices
# Try "Add your workplace"
# Check /profile → office should be saved
```

---

## Deployment Checklist

- [ ] Run `npm run build` locally (should complete without errors)
- [ ] Fill in `.env.local` with Supabase credentials
- [ ] Test auth flow on localhost
- [ ] Push to GitHub
- [ ] Create Supabase project
- [ ] Run `sql/schema.sql`
- [ ] Deploy to Vercel (or Railway)
- [ ] Add env vars to deployment platform
- [ ] Test on mobile device with location + notifications

---

## File Sizes

```
src/app/home/page.tsx          ~300 lines (map + realtime logic)
sql/schema.sql                 ~450 lines (complete DB setup)
src/app/globals.css            ~350 lines (design system)
src/components/                ~400 lines (4 components)
src/hooks/                     ~150 lines (2 hooks)
Other pages                    ~400 lines (auth, profile, etc.)
Config files                   ~50 lines
----
Total                          2,309 lines
```

---

## Useful Commands

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type-check (find TypeScript errors)
npx tsc --noEmit

# Format code (optional)
npx prettier --write .

# View what next.js is doing
npm run build -- --debug
```

---

## Environment Variables

Only 2 needed:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

Get from **Supabase Dashboard → Settings → API**

These are **public** (safe to commit in case you're wondering).  
Never commit anything with "SECRET" or "PRIVATE" in the name.

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Can't find module 'leaflet'" | Run `npm install` |
| "Supabase URL not defined" | Check `.env.local` has correct vars |
| "Location not working" | Use HTTPS or localhost, grant browser permission |
| "RLS policy error" | Ensure RLS policies created by running `sql/schema.sql` |
| "Map not loading" | Check Leaflet CSS imported in `layout.tsx` |
| "Notifications not appearing" | Ensure realtime enabled on tables (in schema.sql) |

---

## Next Steps

1. **Now**: Read `PROJECT_SUMMARY.md`
2. **Next 5 min**: Follow `QUICKSTART.md`
3. **Customization**: Edit files listed in "How to Modify Things"
4. **Launch**: Follow `DEPLOYMENT.md`

---

**Questions?** Check the relevant doc:
- Setup issues → `QUICKSTART.md`
- Feature docs → `README.md`
- Deployment → `DEPLOYMENT.md`
- Architecture → `README.md`
- File structure → This file

Happy building! ☕
