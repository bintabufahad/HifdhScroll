-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  name text,
  suggestion text,
  wants_to_donate boolean not null default false,
  trial_starts_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-creates a profile (and starts the 14-day trial) the moment someone
-- signs up via the magic-link form, copying the name/suggestion/donate
-- interest passed in as auth metadata at sign-in time.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, suggestion, wants_to_donate)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'suggestion',
    coalesce((new.raw_user_meta_data ->> 'wants_to_donate')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
