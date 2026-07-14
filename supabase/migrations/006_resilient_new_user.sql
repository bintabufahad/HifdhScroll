-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Requires 001-005 to have already been run.

-- If anything goes wrong while creating the profile row for a brand-new user,
-- the old trigger would abort the whole auth signup, and the client just sees an
-- opaque "Database error saving new user" (which can surface as an empty "{}"
-- error). Wrapping the insert in an exception block means a profile-insert
-- problem is logged as a warning but never blocks the person from signing up.
-- (If a row fails to insert here, the app still works; the profile can be
-- created on first need.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  begin
    insert into public.profiles (id, email, name, suggestion)
    values (
      new.id,
      new.email,
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'suggestion'
    )
    on conflict (id) do nothing;
  exception
    when others then
      raise warning 'handle_new_user: could not create profile for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;
