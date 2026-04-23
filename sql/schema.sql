-- =====================================================================
-- TEATIME APP - SUPABASE SCHEMA
-- Run these in Supabase SQL Editor in order.
-- =====================================================================

-- STEP 1: Enable required extensions
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists postgis;  -- for geo distance queries

-- =====================================================================
-- STEP 2: OFFICES TABLE
-- Corporate offices + colleges users can be associated with
-- =====================================================================
create table if not exists public.offices (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text,
  kind text check (kind in ('office', 'college', 'coworking', 'other')) default 'office',
  location geography(point, 4326) not null,
  verified boolean default false,
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create index offices_location_idx on public.offices using gist(location);
create index offices_name_idx on public.offices using gin(to_tsvector('english', name));

-- =====================================================================
-- STEP 3: PROFILES TABLE
-- One row per user, extends auth.users
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_emoji text default '☕',
  bio text,
  office_id uuid references public.offices(id) on delete set null,
  role text check (role in ('corporate', 'student', 'other')) default 'corporate',
  interests text[] default array[]::text[],  -- ['tea', 'smoke', 'lunch', 'snacks']
  last_location geography(point, 4326),
  last_seen_at timestamptz default now(),
  is_available boolean default true,
  created_at timestamptz default now()
);

create index profiles_location_idx on public.profiles using gist(last_location);
create index profiles_last_seen_idx on public.profiles(last_seen_at desc);
create index profiles_available_idx on public.profiles(is_available) where is_available = true;

-- =====================================================================
-- STEP 4: MEETUP REQUESTS
-- A user creates a request ("tea in 10 min"); nearby users get notified
-- =====================================================================
create table if not exists public.requests (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references public.profiles(id) on delete cascade not null,
  activity text check (activity in ('tea', 'coffee', 'smoke', 'lunch', 'snacks', 'walk')) not null,
  note text,
  location geography(point, 4326) not null,
  location_label text,                    -- "Near Gate 3, Infosys Campus"
  starts_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 minutes'),
  max_participants int default 3,
  status text check (status in ('open', 'matched', 'completed', 'cancelled', 'expired')) default 'open',
  created_at timestamptz default now()
);

create index requests_location_idx on public.requests using gist(location);
create index requests_status_idx on public.requests(status) where status = 'open';
create index requests_expires_idx on public.requests(expires_at);

-- =====================================================================
-- STEP 5: REQUEST PARTICIPANTS
-- Who accepted which request
-- =====================================================================
create table if not exists public.request_participants (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid references public.requests(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'declined')) default 'accepted',
  joined_at timestamptz default now(),
  unique(request_id, user_id)
);

create index rp_request_idx on public.request_participants(request_id);
create index rp_user_idx on public.request_participants(user_id);

-- =====================================================================
-- STEP 6: NOTIFICATIONS
-- Stored notifications so users see them when they open the app
-- =====================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  request_id uuid references public.requests(id) on delete cascade,
  kind text check (kind in ('new_request', 'accepted', 'cancelled', 'reminder')) not null,
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

create index notif_user_unread_idx on public.notifications(user_id, created_at desc) where read = false;

-- =====================================================================
-- STEP 7: RPC - find nearby offices (used at onboarding)
-- =====================================================================
create or replace function public.offices_nearby(
  lat double precision,
  lng double precision,
  radius_m int default 500
)
returns table (
  id uuid,
  name text,
  address text,
  kind text,
  distance_m double precision
) language sql stable as $$
  select
    o.id,
    o.name,
    o.address,
    o.kind,
    st_distance(o.location, st_makepoint(lng, lat)::geography) as distance_m
  from public.offices o
  where st_dwithin(o.location, st_makepoint(lng, lat)::geography, radius_m)
  order by distance_m asc
  limit 20;
$$;

-- =====================================================================
-- STEP 8: RPC - find nearby people (for the home feed)
-- =====================================================================
create or replace function public.people_nearby(
  lat double precision,
  lng double precision,
  radius_m int default 1500
)
returns table (
  id uuid,
  display_name text,
  avatar_emoji text,
  role text,
  office_name text,
  interests text[],
  distance_m double precision,
  last_seen_at timestamptz
) language sql stable security definer as $$
  select
    p.id,
    p.display_name,
    p.avatar_emoji,
    p.role,
    o.name as office_name,
    p.interests,
    st_distance(p.last_location, st_makepoint(lng, lat)::geography) as distance_m,
    p.last_seen_at
  from public.profiles p
  left join public.offices o on o.id = p.office_id
  where p.last_location is not null
    and p.is_available = true
    and p.id <> auth.uid()
    and p.last_seen_at > now() - interval '2 hours'
    and st_dwithin(p.last_location, st_makepoint(lng, lat)::geography, radius_m)
  order by distance_m asc
  limit 50;
$$;

-- =====================================================================
-- STEP 9: RPC - find nearby open requests
-- =====================================================================
create or replace function public.requests_nearby(
  lat double precision,
  lng double precision,
  radius_m int default 2000
)
returns table (
  id uuid,
  creator_id uuid,
  creator_name text,
  creator_avatar text,
  activity text,
  note text,
  location_label text,
  lat double precision,
  lng double precision,
  distance_m double precision,
  expires_at timestamptz,
  participant_count bigint
) language sql stable security definer as $$
  select
    r.id,
    r.creator_id,
    p.display_name as creator_name,
    p.avatar_emoji as creator_avatar,
    r.activity,
    r.note,
    r.location_label,
    st_y(r.location::geometry) as lat,
    st_x(r.location::geometry) as lng,
    st_distance(r.location, st_makepoint(lng, lat)::geography) as distance_m,
    r.expires_at,
    (select count(*) from public.request_participants rp
     where rp.request_id = r.id and rp.status = 'accepted') as participant_count
  from public.requests r
  join public.profiles p on p.id = r.creator_id
  where r.status = 'open'
    and r.expires_at > now()
    and r.creator_id <> auth.uid()
    and st_dwithin(r.location, st_makepoint(lng, lat)::geography, radius_m)
  order by distance_m asc
  limit 30;
$$;

-- =====================================================================
-- STEP 10: RPC - update my location (called on app open)
-- =====================================================================
create or replace function public.update_my_location(
  lat double precision,
  lng double precision
)
returns void language sql security definer as $$
  update public.profiles
  set last_location = st_makepoint(lng, lat)::geography,
      last_seen_at = now()
  where id = auth.uid();
$$;

-- =====================================================================
-- STEP 11: TRIGGER - on accept, notify creator + expire request if full
-- =====================================================================
create or replace function public.on_participant_accept()
returns trigger language plpgsql security definer as $$
declare
  req record;
  creator_name text;
begin
  select * into req from public.requests where id = new.request_id;
  select display_name into creator_name from public.profiles where id = new.user_id;

  if new.status = 'accepted' then
    insert into public.notifications(user_id, request_id, kind, title, body)
    values (
      req.creator_id,
      req.id,
      'accepted',
      coalesce(creator_name, 'Someone') || ' joined your ' || req.activity || ' request',
      'Say hi — they''re on the way.'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_participant_accept on public.request_participants;
create trigger trg_on_participant_accept
after insert on public.request_participants
for each row execute function public.on_participant_accept();

-- =====================================================================
-- STEP 12: TRIGGER - when a request is created, notify nearby users
-- =====================================================================
create or replace function public.on_request_created()
returns trigger language plpgsql security definer as $$
declare
  nearby_user record;
  creator_name text;
begin
  select display_name into creator_name from public.profiles where id = new.creator_id;

  for nearby_user in
    select id from public.profiles
    where id <> new.creator_id
      and is_available = true
      and last_location is not null
      and last_seen_at > now() - interval '1 hour'
      and st_dwithin(last_location, new.location, 1500)
  loop
    insert into public.notifications(user_id, request_id, kind, title, body)
    values (
      nearby_user.id,
      new.id,
      'new_request',
      coalesce(creator_name, 'Someone nearby') || ' wants to ' || new.activity,
      coalesce(new.note, 'Tap to join — they''re just a walk away.')
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_on_request_created on public.requests;
create trigger trg_on_request_created
after insert on public.requests
for each row execute function public.on_request_created();

-- =====================================================================
-- STEP 13: AUTO-CREATE PROFILE ON SIGNUP
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =====================================================================
-- STEP 14: ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.offices enable row level security;
alter table public.requests enable row level security;
alter table public.request_participants enable row level security;
alter table public.notifications enable row level security;

-- Profiles: readable by all authenticated, editable by self
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update to authenticated using (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- Offices: readable by all, insertable by authenticated
drop policy if exists "offices_read" on public.offices;
create policy "offices_read" on public.offices
  for select to authenticated using (true);

drop policy if exists "offices_insert" on public.offices;
create policy "offices_insert" on public.offices
  for insert to authenticated with check (auth.uid() = added_by);

-- Requests: readable by all authenticated, editable by creator
drop policy if exists "requests_read" on public.requests;
create policy "requests_read" on public.requests
  for select to authenticated using (true);

drop policy if exists "requests_insert" on public.requests;
create policy "requests_insert" on public.requests
  for insert to authenticated with check (auth.uid() = creator_id);

drop policy if exists "requests_update_own" on public.requests;
create policy "requests_update_own" on public.requests
  for update to authenticated using (auth.uid() = creator_id);

-- Participants: readable by all authenticated, self-insert
drop policy if exists "rp_read" on public.request_participants;
create policy "rp_read" on public.request_participants
  for select to authenticated using (true);

drop policy if exists "rp_insert_self" on public.request_participants;
create policy "rp_insert_self" on public.request_participants
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "rp_delete_self" on public.request_participants;
create policy "rp_delete_self" on public.request_participants
  for delete to authenticated using (auth.uid() = user_id);

-- Notifications: only owner can read/update
drop policy if exists "notif_own" on public.notifications;
create policy "notif_own" on public.notifications
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "notif_update_own" on public.notifications;
create policy "notif_update_own" on public.notifications
  for update to authenticated using (auth.uid() = user_id);

-- =====================================================================
-- STEP 15: REALTIME - enable for requests + notifications
-- =====================================================================
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.request_participants;
alter publication supabase_realtime add table public.notifications;

-- =====================================================================
-- STEP 16: SEED SOME OFFICES (optional — edit coordinates for your city)
-- =====================================================================
insert into public.offices(name, address, kind, location, verified) values
  ('Infosys Bhubaneswar', 'Infocity, Chandaka', 'office',
   st_makepoint(85.8080, 20.3490)::geography, true),
  ('IIT Kharagpur', 'Kharagpur, WB', 'college',
   st_makepoint(87.3105, 22.3190)::geography, true),
  ('TCS Salt Lake', 'Sector V, Kolkata', 'office',
   st_makepoint(88.4311, 22.5726)::geography, true),
  ('Haldia Institute of Technology', 'Haldia, WB', 'college',
   st_makepoint(88.0664, 22.0667)::geography, true)
on conflict do nothing;

-- =====================================================================
-- DONE. Verify:
--   select * from public.offices_nearby(22.0667, 88.0664);
-- =====================================================================
