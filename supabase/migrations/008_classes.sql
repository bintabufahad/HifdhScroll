-- Study classes: a named group-study room backed by a unique Jitsi room slug.
-- The owner creates and manages classes; anyone with the link can look up the
-- class by its room slug (so invitees see the class name), but only the owner
-- can create, rename, or delete their own classes.

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  room text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists classes_owner_id_idx on public.classes (owner_id);

alter table public.classes enable row level security;

-- Public read: an invitee (possibly signed out) can resolve a class by its
-- room slug to show its name. Classes contain no sensitive data.
drop policy if exists "classes are readable by everyone" on public.classes;
create policy "classes are readable by everyone" on public.classes for select using (true);

drop policy if exists "owner can insert classes" on public.classes;
create policy "owner can insert classes" on public.classes for insert with check (auth.uid() = owner_id);

drop policy if exists "owner can update own classes" on public.classes;
create policy "owner can update own classes" on public.classes for update using (auth.uid() = owner_id);

drop policy if exists "owner can delete own classes" on public.classes;
create policy "owner can delete own classes" on public.classes for delete using (auth.uid() = owner_id);

-- Make sure the API roles can reach the table (RLS still gates every row).
grant select, insert, update, delete on public.classes to authenticated;
grant select on public.classes to anon;
