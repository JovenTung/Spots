-- Spots: core schema — enums, tables, indexes, triggers, RLS.
-- Run this first, then 0002_storage.sql, then 0003_rate_limit.sql.

-- ── Enums ────────────────────────────────────────────────────────────────
create type public.place_category as enum
  ('restaurant', 'cafe', 'bar', 'activity', 'sight', 'shop', 'other');

create type public.place_status as enum ('want_to_go', 'visited');

-- ── updated_at trigger ───────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── places ───────────────────────────────────────────────────────────────
create table public.places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  category public.place_category not null default 'other',
  status public.place_status not null default 'want_to_go',
  address text check (address is null or char_length(address) <= 500),
  lat double precision check (lat is null or (lat between -90 and 90)),
  lng double precision check (lng is null or (lng between -180 and 180)),
  source_url text check (source_url is null or source_url like 'https://%'),
  source_thumbnail_url text check (
    source_thumbnail_url is null or source_thumbnail_url like 'https://%'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger places_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

create index places_user_status_idx on public.places (user_id, status);
create index places_user_category_idx on public.places (user_id, category);

-- ── visits ───────────────────────────────────────────────────────────────
-- user_id is denormalised so RLS policies never need a join.
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  visited_date date not null default current_date,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 2000),
  good_things text check (good_things is null or char_length(good_things) <= 2000),
  bad_things text check (bad_things is null or char_length(bad_things) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger visits_updated_at
  before update on public.visits
  for each row execute function public.set_updated_at();

create index visits_place_date_idx on public.visits (place_id, visited_date desc);
create index visits_user_idx on public.visits (user_id);

-- ── photos ───────────────────────────────────────────────────────────────
-- Stores the storage object path ('{user_id}/{visit_id}/{uuid}.jpg'), not a
-- URL: the bucket is private and URLs are signed at read time.
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null references public.visits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null check (char_length(storage_path) between 1 and 500),
  caption text check (caption is null or char_length(caption) <= 500),
  created_at timestamptz not null default now()
);

create index photos_visit_idx on public.photos (visit_id);
create index photos_user_idx on public.photos (user_id);

-- ── Row Level Security: owner-only, all four verbs, on every table ───────
alter table public.places enable row level security;
alter table public.visits enable row level security;
alter table public.photos enable row level security;

create policy "places_select_own" on public.places
  for select to authenticated using (auth.uid() = user_id);
create policy "places_insert_own" on public.places
  for insert to authenticated with check (auth.uid() = user_id);
create policy "places_update_own" on public.places
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "places_delete_own" on public.places
  for delete to authenticated using (auth.uid() = user_id);

create policy "visits_select_own" on public.visits
  for select to authenticated using (auth.uid() = user_id);
-- Insert also verifies the parent place is the caller's own — blocks
-- direct-PostgREST inserts that reference someone else's place_id.
create policy "visits_insert_own" on public.visits
  for insert to authenticated with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.places p
      where p.id = place_id and p.user_id = auth.uid()
    )
  );
create policy "visits_update_own" on public.visits
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "visits_delete_own" on public.visits
  for delete to authenticated using (auth.uid() = user_id);

create policy "photos_select_own" on public.photos
  for select to authenticated using (auth.uid() = user_id);
-- Insert also verifies the parent visit is the caller's own and that the
-- storage path sits inside the caller's own folder.
create policy "photos_insert_own" on public.photos
  for insert to authenticated with check (
    auth.uid() = user_id
    and storage_path like auth.uid()::text || '/%'
    and exists (
      select 1 from public.visits v
      where v.id = visit_id and v.user_id = auth.uid()
    )
  );
create policy "photos_update_own" on public.photos
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "photos_delete_own" on public.photos
  for delete to authenticated using (auth.uid() = user_id);
