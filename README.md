# Teatime 🍵 — A Walk Away

A mobile-first web app that connects strangers nearby for tea, coffee, smoke breaks, lunch, or snacks. Built for corporate workers and college students.

**Live features:**
- Real-time location-based request matching (within 2km)
- Auto-detect nearby offices and colleges
- WebSocket realtime notifications when someone creates a request near you
- Interactive map with Leaflet + OpenStreetMap
- Email magic-link authentication (no passwords)
- PostGIS geospatial queries for distance calculations
- Row-level security + realtime enabled on Supabase

---

## Architecture

```
Frontend: Next.js 14 (App Router) + React 18 + TypeScript
Styling: Tailwind CSS + custom CSS (2026 editorial aesthetic)
Maps: Leaflet + React Leaflet + OpenStreetMap
Backend: Supabase (PostgreSQL + Auth + Realtime)
Geospatial: PostGIS for distance queries
```

---

## Setup Instructions

### Step 1: Clone & Install

```bash
git clone <repo>
cd teatime-app
npm install
```

### Step 2: Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Go to SQL Editor** → paste the entire contents of `sql/schema.sql`
3. **Run all 16 steps** (you can run them in one go; they're idempotent)

This creates:
- `profiles` table with geolocation
- `requests` table with PostGIS points
- `offices` table (colleges/workplaces)
- `request_participants` (who accepted what)
- `notifications` table (realtime alerts)
- RPCs: `offices_nearby()`, `people_nearby()`, `requests_nearby()`, `update_my_location()`
- Triggers: auto-notify when someone posts a request nearby
- RLS policies: users can only see their own notifications, etc.
- Realtime subscriptions enabled

### Step 3: Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

Get these from Supabase dashboard:
- **URL**: Settings → API → Project URL
- **Anon Key**: Settings → API → anon public

### Step 4: Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` on mobile or use Chrome DevTools mobile emulation.

---

## SQL Queries Explained

All SQL is in `sql/schema.sql`. Key pieces:

### `offices_nearby(lat, lng, radius_m)`
```sql
-- Find offices within 500m
SELECT * FROM offices_nearby(22.0667, 88.0664, 500);
```

### `people_nearby(lat, lng, radius_m)`
```sql
-- Find available people near me
SELECT * FROM people_nearby(22.0667, 88.0664, 1500);
```

### `requests_nearby(lat, lng, radius_m)`
```sql
-- Find open requests I can join
SELECT * FROM requests_nearby(22.0667, 88.0664, 2000);
```

### `update_my_location(lat, lng)`
```sql
-- Called every 2 min; updates your location + last_seen_at
SELECT update_my_location(22.0667, 88.0664);
```

All use **PostGIS** (`ST_Distance`, `ST_DWithin`) for accurate geo calculations.

---

## User Flow

### 1. Landing Page (`/`)
- Hero headline: "A cup of tea, a walk away"
- CTA: "Start with an email"

### 2. Auth (`/auth`)
- Email magic-link sign-in
- No password, link expires in 24h
- User auto-created in `profiles` table

### 3. Onboarding (`/onboarding`) — **Requirement #6**
- **Step 1**: Request GPS location
- **Step 2**: Fetch `offices_nearby()` → show them in a list
  - User taps one, or
  - User taps "Add your workplace" → inputs name → we save it with their location
- **Step 3**: Set display name
- → Auto-redirect to `/home` on complete

### 4. Home (`/home`) — **The Main App**
- Leaflet map centered on user
- Shows:
  - Your location pin (📍)
  - All open requests nearby (with emojis: 🍵☕🚬🍱🥟🚶)
  - When user taps a request pin, shows creator info
- **Floating `+` button** → opens `CreateRequestSheet`
  - User picks activity
  - Optional note ("near the gate", "rooftop after 3")
  - Post → request expires in 30 min
  - **Trigger fires**: all users within 1.5km get a notification
- **Incoming request popup** (top of screen):
  - Auto-shows when a new request is created near you
  - Shows creator name, activity, distance
  - "Join" or "Later" buttons
  - Auto-dismisses in 8 seconds or on action
- Requests refresh every 10 sec + realtime subscriptions

### 5. My Requests (`/my-requests`)
- List of requests you created
- Shows participant count, status, time posted
- Can cancel an open request with ✕

### 6. Notifications (`/notifications`)
- All notifications: new requests, acceptances, cancellations
- Mark as read by tapping
- Delete with trash icon

### 7. Profile (`/profile`)
- Edit display name, bio, interests
- See your availability status
- Quick access to account info

### Bottom Nav
- Map, My Requests, Notifications (with unread badge), Profile, Logout

---

## Design System

### Colors (2026 Editorial Aesthetic)
```
--bone: #f5f1ea        (off-white background)
--cream: #faf6ee       (card bg)
--ink: #0a0a0a         (main text)
--smoke: #3a3a3a       (secondary text)
--ash: #8a8580         (tertiary)
--ember: #ff5722        (CTAs, tea orange)
--rust: #c1440e        (accents)
--matcha: #8db580      (status, "live")
```

### Typography
- **Display**: Instrument Serif (editorial headlines)
- **Sans**: Geist (body, UI)
- **Mono**: Geist Mono (labels, timestamps)

### Components
- `.btn-primary`, `.btn-ghost`: buttons with haptic feedback
- `.card`: tactile paper-like cards with subtle shadows
- `.input`: form fields with focus states
- `.chip`: activity tags + selections
- Bottom sheets for modals (no intrusive overlays)

### Animations
- Slide-up page transitions (0.5s cubic-bezier)
- Staggered child reveals (cards, lists)
- Pulse ring for "live" status indicators
- Smooth map updates

---

## Mobile Optimization

- **Viewport**: `device-width`, no zoom (for PWA-like feel)
- **Safe areas**: Respects notches on iOS (`env(safe-area-inset-top/bottom)`)
- **Touch**: 44px+ tap targets, no tap highlights
- **Performance**:
  - Lazy-load Leaflet map (SSR-disabled)
  - Debounced location updates (2 min intervals)
  - Request refresh every 10 sec (not 1 sec)
  - Image optimization for tile layers
- **Max width**: 440px (mobile constrained layout on desktop)

---

## Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com → import repo
# 3. Set env vars in Vercel dashboard:
#    NEXT_PUBLIC_SUPABASE_URL=...
#    NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 4. Deploy
vercel deploy --prod
```

### Docker (Self-hosted)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)

Use **Supabase Dashboard → Settings → API** to get credentials.

Ensure RLS is enabled on all tables (it is by default in the schema).

---

## How It Works (Realtime Flow)

1. **User posts a request** → `POST /api/requests`
   - Record saved to DB
   - PostGIS trigger fires
   - Trigger queries: which users are within 1.5km & available?
   - **Inserts notifications** for each of them
2. **Supabase realtime channel** (`notifications` table) broadcasts the notification
3. **Users' clients receive via websocket** → top popup appears in 0.1s
4. **User can "Join"** → their ID added to `request_participants`
   - Trigger fires again → notifies **creator** that someone joined
   - Creator's clients update participant count instantly

---

## File Structure

```
teatime-app/
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.local.example
├── sql/
│   └── schema.sql                    (16-step Supabase setup)
└── src/
    ├── app/
    │   ├── layout.tsx                (root layout, mobile shell)
    │   ├── page.tsx                  (landing page)
    │   ├── globals.css               (2026 design system)
    │   ├── auth/
    │   │   ├── page.tsx              (magic link login)
    │   │   └── callback/route.ts     (OAuth handler)
    │   ├── onboarding/page.tsx       (geo + office picker)
    │   ├── home/page.tsx             (main map + requests)
    │   ├── my-requests/page.tsx      (user's posted requests)
    │   ├── notifications/page.tsx    (alerts feed)
    │   └── profile/page.tsx          (settings)
    ├── components/
    │   ├── MapView.tsx               (Leaflet map)
    │   ├── CreateRequestSheet.tsx    (bottom sheet)
    │   ├── IncomingRequestPopup.tsx  (realtime alert)
    │   └── BottomNav.tsx             (Blinkit-style nav)
    ├── lib/
    │   ├── supabase-browser.ts       (client-side Supabase)
    │   └── supabase-server.ts        (server-side Supabase)
    ├── hooks/
    │   ├── useLocation.ts            (GPS + auto-push to DB)
    │   └── useRealtimeNotifications.ts (realtime alerts)
    ├── types/
    │   └── index.ts                  (TypeScript interfaces)
    └── middleware.ts                 (auth routing)
```

---

## Key Features Shipped

✅ **Requirement #1**: GPS auto-location + shows nearby people  
✅ **Requirement #2**: Users can post requests; nearby people get realtime notification popup  
✅ **Requirement #3**: Integrated Leaflet map with custom pins  
✅ **Requirement #4**: UI/UX inspired by Blinkit/Zepto (fast, dense, mobile-first)  
✅ **Requirement #5**: Targets corporate workers + students  
✅ **Requirement #6**: Auto-detect nearby offices; users can add their own  
✅ **Requirement #7**: Full code included  
✅ **Requirement #8**: Complete SQL schema with RPCs, triggers, RLS  
✅ **Requirement #9**: Email-only auth (magic links, no passwords)  
✅ **Requirement #10**: 2026-level design (editorial, warm, tactile)

---

## Testing Locally

1. **Open two browser windows/tabs** at `http://localhost:3000`
2. **Window A**: Login as user1@example.com
3. **Window B**: Login as user2@example.com
4. **Window A**: Go to `/home` → wait for location
5. **Window B**: Go to `/home` → wait for location
6. **Window A**: Click the `+` button → create a "tea" request
7. **Watch Window B**: Notification popup should appear at the top in ~100ms
8. **Window B**: Click "Join" → goes to B's request_participants
9. **Window A**: If you visit `/my-requests`, participant count should update

---

## Troubleshooting

### Location not working
- Ensure HTTPS (required for `navigator.geolocation` in production)
- Localhost works fine for dev
- Check browser permissions (Chrome Settings → Privacy)

### Notifications not showing
- Ensure realtime is enabled on the tables:
  ```sql
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  ```
- Check browser console for Supabase errors

### Map not loading
- Verify OpenStreetMap tiles are accessible (some networks block them)
- Check Leaflet CSS is loaded (`leaflet/dist/leaflet.css`)

### RLS errors
- Check Supabase logs: `Auth` → `Users`
- Ensure RLS policies exist on all tables (run schema.sql again)

---

## Future Enhancements

- [ ] Google Places API for office detection
- [ ] Photo uploads for requests
- [ ] User ratings/reviews
- [ ] Recurring requests ("every weekday at 3pm")
- [ ] Dark mode
- [ ] Push notifications (via service worker)
- [ ] Rate limiting on requests (prevent spam)
- [ ] Geofencing to auto-complete requests

---

## License

MIT

---

Built with ☕ for strangers who want to grab tea.
