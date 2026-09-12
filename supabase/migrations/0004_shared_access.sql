-- Spots: turn the single-user app into a shared one for an approved group.
--
-- Model: an explicit allowlist. `members` holds the user ids permitted into
-- the shared space; anyone in it can read and edit everything. Signing up
-- alone grants nothing, which is what keeps this safe while Supabase
-- sign-up remains open to the public.
--
-- `user_id` is retained on every row as the AUTHOR (who added it), not as an
-- access control field. Attribution, not ownership.

-- ── Membership ──────────────────────────────────────────────────────────
create table if not exists public.members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  added_at timestamptz not null default now()
);

alter table public.members enable row level security;

-- Membership is checked inside other tables' policies. A plain `exists`
-- against a table that itself has RLS would recurse, so this runs as
-- SECURITY DEFINER (bypassing RLS) with a pinned search_path.
create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.members m where m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_member() from public;
grant execute on function public.is_member() to authenticated;

-- Members can see who else is in the space (powers "added by" labels).
-- There are deliberately NO insert/update/delete policies: the allowlist is
-- managed from the SQL editor only, so a compromised session can't add
-- someone. See the README for the one-liner to add a person.
drop policy if exists "members_select_member" on public.members;
create policy "members_select_member" on public.members
  for select to authenticated using (public.is_member());

-- ── Replace owner-only policies with membership-based ones ──────────────
drop policy if exists "places_select_own" on public.places;
drop policy if exists "places_insert_own" on public.places;
drop policy if exists "places_update_own" on public.places;
drop policy if exists "places_delete_own" on public.places;

create policy "places_select_member" on public.places
  for select to authenticated using (public.is_member());
-- You may only create rows authored by yourself; everyone may edit them after.
create policy "places_insert_member" on public.places
  for insert to authenticated
  with check (public.is_member() and auth.uid() = user_id);
create policy "places_update_member" on public.places
  for update to authenticated
  using (public.is_member()) with check (public.is_member());
create policy "places_delete_member" on public.places
  for delete to authenticated using (public.is_member());

drop policy if exists "visits_select_own" on public.visits;
drop policy if exists "visits_insert_own" on public.visits;
drop policy if exists "visits_update_own" on public.visits;
drop policy if exists "visits_delete_own" on public.visits;

create policy "visits_select_member" on public.visits
  for select to authenticated using (public.is_member());
-- Still verifies the parent place exists and is in the shared space, so a
-- direct PostgREST call can't attach a visit to an arbitrary place_id.
create policy "visits_insert_member" on public.visits
  for insert to authenticated with check (
    public.is_member()
    and auth.uid() = user_id
    and exists (select 1 from public.places p where p.id = place_id)
  );
create policy "visits_update_member" on public.visits
  for update to authenticated
  using (public.is_member()) with check (public.is_member());
create policy "visits_delete_member" on public.visits
  for delete to authenticated using (public.is_member());

drop policy if exists "photos_select_own" on public.photos;
drop policy if exists "photos_insert_own" on public.photos;
drop policy if exists "photos_update_own" on public.photos;
drop policy if exists "photos_delete_own" on public.photos;

create policy "photos_select_member" on public.photos
  for select to authenticated using (public.is_member());
-- Uploads still land in the uploader's own storage folder: shared visibility
-- doesn't mean shared write access to someone else's files on disk.
create policy "photos_insert_member" on public.photos
  for insert to authenticated with check (
    public.is_member()
    and auth.uid() = user_id
    and storage_path like auth.uid()::text || '/%'
    and exists (select 1 from public.visits v where v.id = visit_id)
  );
create policy "photos_update_member" on public.photos
  for update to authenticated
  using (public.is_member()) with check (public.is_member());
create policy "photos_delete_member" on public.photos
  for delete to authenticated using (public.is_member());

-- ── Storage: members read every folder, write only their own ────────────
drop policy if exists "photos_storage_read_own" on storage.objects;
drop policy if exists "photos_storage_insert_own" on storage.objects;
drop policy if exists "photos_storage_delete_own" on storage.objects;

create policy "photos_storage_read_member" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and public.is_member());

create policy "photos_storage_insert_member" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'photos'
    and public.is_member()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Deleting a shared spot must clean up the other person's photos too.
create policy "photos_storage_delete_member" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and public.is_member());

-- ── Bootstrap: everyone who has already signed up becomes a member ──────
-- Safe to run now (only you and your partner exist). After this, add people
-- explicitly — see the README.
insert into public.members (user_id, display_name)
select id, coalesce(raw_user_meta_data ->> 'name', split_part(email, '@', 1))
from auth.users
on conflict (user_id) do nothing;
