-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run.
-- Requires 001-004 to have already been run.

-- The study "structured course" (ordered YouTube lectures + PDF readings) was
-- previously kept only in the browser's localStorage, which is per-device and
-- can be cleared. This stores it per-user in Postgres instead, so it's as
-- durable and cross-device as the study to-do list. Plain RLS scoped to the
-- owner - nothing game-able lives here.
create table if not exists public.course_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('youtube', 'pdf')),
  url text not null,
  title text not null,
  done boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists course_items_user_position_idx
  on public.course_items (user_id, position);

alter table public.course_items enable row level security;

create policy "Users can view their own course items"
  on public.course_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own course items"
  on public.course_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own course items"
  on public.course_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own course items"
  on public.course_items for delete
  using (auth.uid() = user_id);
