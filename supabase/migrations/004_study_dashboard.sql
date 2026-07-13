-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Requires 001-003 to have already been run.

-- Gamification stats live on the profile row itself (one row per user
-- already exists there). Points/streak are only ever changed through the
-- record_study_session() function below, never written directly by the
-- client, so a user can't just set points/streak from devtools.
alter table public.profiles
  add column if not exists points integer not null default 0,
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_study_date date,
  add column if not exists total_study_seconds integer not null default 0;

-- Student-of-knowledge to-do list. Ordinary user-owned rows, so plain RLS
-- (not a security-definer function) is enough here - there's no game-able
-- value like trial length or points sitting on this table.
create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.study_tasks enable row level security;

create policy "Users can view their own tasks"
  on public.study_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.study_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.study_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.study_tasks for delete
  using (auth.uid() = user_id);

-- Logs a completed study-timer session and awards points/streak for it.
-- security definer so the streak/points math happens server-side - a
-- client could otherwise just call this in a loop or fabricate a huge
-- duration, so both the award-per-call and the duration itself are capped.
create or replace function public.record_study_session(p_duration_seconds integer)
returns public.profiles
language plpgsql
security definer set search_path = public
as $$
declare
  v_profile public.profiles;
  v_capped_seconds integer;
  v_points_earned integer;
  v_today date := current_date;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_duration_seconds is null or p_duration_seconds <= 0 then
    raise exception 'Invalid session duration';
  end if;

  -- One logged session can't be worth more than a 3-hour sitting's points,
  -- so repeated calls can't be used to inflate points arbitrarily fast.
  v_capped_seconds := least(p_duration_seconds, 3 * 60 * 60);
  v_points_earned := 10 + floor(v_capped_seconds / 60.0);

  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile is null then
    raise exception 'Profile not found';
  end if;

  update public.profiles
  set
    points = points + v_points_earned,
    total_study_seconds = total_study_seconds + v_capped_seconds,
    current_streak = case
      when last_study_date = v_today then current_streak
      when last_study_date = v_today - 1 then current_streak + 1
      else 1
    end,
    longest_streak = greatest(
      longest_streak,
      case
        when last_study_date = v_today then current_streak
        when last_study_date = v_today - 1 then current_streak + 1
        else 1
      end
    ),
    last_study_date = v_today
  where id = auth.uid()
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.record_study_session(integer) from public;
grant execute on function public.record_study_session(integer) to authenticated;
