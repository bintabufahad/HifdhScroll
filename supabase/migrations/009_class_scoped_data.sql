-- Scope a student's course and to-dos to a specific class, and migrate any
-- existing (class-less) data into a default "first" class so nobody who was
-- already using the app loses their course or task list.

alter table public.study_tasks add column if not exists class_id uuid references public.classes (id) on delete cascade;
alter table public.course_items add column if not exists class_id uuid references public.classes (id) on delete cascade;

create index if not exists study_tasks_class_id_idx on public.study_tasks (class_id);
create index if not exists course_items_class_id_idx on public.course_items (class_id);

-- Every user who already has study data but no class gets a default class so
-- their existing course + to-dos have a home and appear as their first class.
insert into public.classes (owner_id, name, room)
select u.user_id, 'My study room', 'rusookh-mine-' || substr(md5(u.user_id::text || random()::text), 1, 8)
from (
  select user_id from public.study_tasks where class_id is null
  union
  select user_id from public.course_items where class_id is null
) u
where not exists (select 1 from public.classes c where c.owner_id = u.user_id);

-- Attach existing class-less rows to that user's earliest class.
update public.study_tasks t
set class_id = (
  select c.id from public.classes c where c.owner_id = t.user_id order by c.created_at asc limit 1
)
where t.class_id is null;

update public.course_items i
set class_id = (
  select c.id from public.classes c where c.owner_id = i.user_id order by c.created_at asc limit 1
)
where i.class_id is null;
