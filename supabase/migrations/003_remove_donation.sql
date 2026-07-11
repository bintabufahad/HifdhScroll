-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Requires 001_profiles_and_trial.sql and 002_feedback_and_trial_extension.sql
-- to have already been run.

-- The donation checkbox/link has been removed from the app entirely, so the
-- trigger no longer needs to read or store a donate preference.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, suggestion)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'suggestion'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

alter table public.profiles drop column if exists wants_to_donate;
