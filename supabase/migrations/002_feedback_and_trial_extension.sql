-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Requires 001_profiles_and_trial.sql to have already been run.

alter table public.profiles
  add column if not exists feedback_submitted_at timestamptz,
  add column if not exists feedback_rating smallint,
  add column if not exists feedback_review text,
  add column if not exists feedback_pricing_answer text;

-- The original "Users can update their own profile" policy let any signed-in
-- user rewrite ANY column on their own row directly from the browser -
-- including trial_ends_at, which they could just set to any future date via
-- devtools. Trial extension must only ever happen through the function
-- below, which enforces the "feedback not already submitted" rule
-- server-side, so direct client updates are no longer allowed at all.
drop policy if exists "Users can update their own profile" on public.profiles;

-- Extends a user's trial by 30 days in exchange for one-time feedback.
-- security definer lets it bypass RLS to perform the update, but it only
-- ever touches the calling user's own row (auth.uid()), and refuses to run
-- a second time for the same user.
create or replace function public.submit_feedback_and_extend_trial(
  p_rating smallint,
  p_review text,
  p_pricing_answer text
)
returns public.profiles
language plpgsql
security definer set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_profile from public.profiles where id = auth.uid();

  if v_profile is null then
    raise exception 'Profile not found';
  end if;

  if v_profile.feedback_submitted_at is not null then
    raise exception 'Feedback already submitted';
  end if;

  update public.profiles
  set
    feedback_submitted_at = now(),
    feedback_rating = p_rating,
    feedback_review = nullif(trim(p_review), ''),
    feedback_pricing_answer = nullif(trim(p_pricing_answer), ''),
    trial_ends_at = now() + interval '30 days'
  where id = auth.uid()
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.submit_feedback_and_extend_trial(smallint, text, text) from public;
grant execute on function public.submit_feedback_and_extend_trial(smallint, text, text) to authenticated;
