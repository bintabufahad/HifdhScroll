-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Requires 001-006 to have already been run.

-- Public reviews wall. Reviews are stored per-user in Postgres so they're
-- durable and never disappear. Everyone can read them (they double as
-- testimonials); a signed-in user can leave/edit/remove their own.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  rating smallint check (rating between 1 and 5),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists reviews_created_idx on public.reviews (created_at desc);

alter table public.reviews enable row level security;

-- Public read (including anonymous), so the reviews wall is visible to anyone.
create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Users can insert their own review"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own review"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "Users can delete their own review"
  on public.reviews for delete
  using (auth.uid() = user_id);
