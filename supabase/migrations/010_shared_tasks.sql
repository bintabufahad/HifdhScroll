-- Make the class to-do list SHARED across everyone in the class, with live
-- updates. Anyone signed in can read and edit a class's tasks (class links are
-- shared with the people who should have access); a new task is still stamped
-- with its creator.

-- Full row on delete/update so Realtime filters (class_id) match those events.
alter table public.study_tasks replica identity full;

drop policy if exists "Users can view their own tasks" on public.study_tasks;
drop policy if exists "Users can insert their own tasks" on public.study_tasks;
drop policy if exists "Users can update their own tasks" on public.study_tasks;
drop policy if exists "Users can delete their own tasks" on public.study_tasks;
drop policy if exists "Class tasks are viewable" on public.study_tasks;
drop policy if exists "Class tasks insert" on public.study_tasks;
drop policy if exists "Class tasks update" on public.study_tasks;
drop policy if exists "Class tasks delete" on public.study_tasks;

create policy "Class tasks are viewable" on public.study_tasks for select to authenticated using (true);
create policy "Class tasks insert" on public.study_tasks for insert to authenticated with check (auth.uid() = user_id);
create policy "Class tasks update" on public.study_tasks for update to authenticated using (true);
create policy "Class tasks delete" on public.study_tasks for delete to authenticated using (true);

-- Broadcast row changes over Realtime so every open device updates instantly.
do $$
begin
  alter publication supabase_realtime add table public.study_tasks;
exception when others then null;
end $$;
