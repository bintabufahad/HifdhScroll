-- Persistent shared whiteboard: each completed pen stroke is stored as one row
-- so anyone who opens the board later sees everything drawn so far. Live drawing
-- is broadcast over Realtime; this table is the durable history.

create table if not exists public.whiteboard_strokes (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists whiteboard_strokes_class_id_idx on public.whiteboard_strokes (class_id);

alter table public.whiteboard_strokes enable row level security;

drop policy if exists "wb viewable" on public.whiteboard_strokes;
create policy "wb viewable" on public.whiteboard_strokes for select to authenticated using (true);
drop policy if exists "wb insert" on public.whiteboard_strokes;
create policy "wb insert" on public.whiteboard_strokes for insert to authenticated with check (true);
drop policy if exists "wb delete" on public.whiteboard_strokes;
create policy "wb delete" on public.whiteboard_strokes for delete to authenticated using (true);

grant select, insert, delete on public.whiteboard_strokes to authenticated;
