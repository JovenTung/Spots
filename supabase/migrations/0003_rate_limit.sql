-- Spots: table-backed fixed-window rate limiter.
-- The table is unreachable from client roles; the only entry point is the
-- SECURITY DEFINER function keyed on auth.uid().

create table public.rate_limits (
  user_id uuid not null,
  action text not null,
  window_start timestamptz not null,
  count int not null default 1,
  primary key (user_id, action, window_start)
);

alter table public.rate_limits enable row level security;
-- No policies on purpose: direct access is denied for anon/authenticated.

revoke all on public.rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(
  p_action text,
  p_max int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count int;
begin
  if auth.uid() is null then
    return false;
  end if;

  -- The function is callable by any authenticated user, so treat every
  -- argument as attacker-controlled: only known actions, sane bounds.
  if p_action not in ('instagram_import') then
    return false;
  end if;
  if p_max is null or p_max < 1 or p_max > 1000 then
    return false;
  end if;
  if p_window_seconds is null or p_window_seconds < 60 or p_window_seconds > 86400 then
    return false;
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  -- Opportunistic hygiene: drop this user's expired windows.
  delete from public.rate_limits
  where user_id = auth.uid()
    and action = p_action
    and window_start < now() - interval '2 days';

  insert into public.rate_limits (user_id, action, window_start)
  values (auth.uid(), p_action, v_window)
  on conflict (user_id, action, window_start)
  do update set count = rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

revoke all on function public.check_rate_limit(text, int, int) from anon, public;
grant execute on function public.check_rate_limit(text, int, int) to authenticated;
