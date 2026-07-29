-- Storage bucket for course PDFs uploaded straight from a user's device.
insert into storage.buckets (id, name, public)
values ('course-pdfs', 'course-pdfs', true)
on conflict (id) do nothing;

-- Signed-in users can upload; the bucket is public so readings open by link.
drop policy if exists "course pdf upload" on storage.objects;
create policy "course pdf upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'course-pdfs');

drop policy if exists "course pdf read" on storage.objects;
create policy "course pdf read" on storage.objects for select to public
  using (bucket_id = 'course-pdfs');

drop policy if exists "course pdf delete" on storage.objects;
create policy "course pdf delete" on storage.objects for delete to authenticated
  using (bucket_id = 'course-pdfs');
