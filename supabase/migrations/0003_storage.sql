-- Storage buckets and policies for CMS media.
-- Buckets are public-read so the public website can display images without
-- authentication. Writes are restricted to active administrators.
-- Run this migration in the Supabase SQL editor (it needs the storage schema).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-posters', 'event-posters', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('team-photos', 'team-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('gallery-images', 'gallery-images', true, 7864320, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('achievement-images', 'achievement-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('blog-images', 'blog-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('announcement-images', 'announcement-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads ECO Club media" on storage.objects;
create policy "Public reads ECO Club media"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id in (
    'event-posters',
    'team-photos',
    'gallery-images',
    'achievement-images',
    'blog-images',
    'announcement-images'
  )
);

drop policy if exists "Admins upload ECO Club media" on storage.objects;
create policy "Admins upload ECO Club media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in (
    'event-posters',
    'team-photos',
    'gallery-images',
    'achievement-images',
    'blog-images',
    'announcement-images'
  )
  and public.is_admin()
);

drop policy if exists "Admins update ECO Club media" on storage.objects;
create policy "Admins update ECO Club media"
on storage.objects
for update
to authenticated
using (
  bucket_id in (
    'event-posters',
    'team-photos',
    'gallery-images',
    'achievement-images',
    'blog-images',
    'announcement-images'
  )
  and public.is_admin()
)
with check (
  bucket_id in (
    'event-posters',
    'team-photos',
    'gallery-images',
    'achievement-images',
    'blog-images',
    'announcement-images'
  )
  and public.is_admin()
);

drop policy if exists "Admins delete ECO Club media" on storage.objects;
create policy "Admins delete ECO Club media"
on storage.objects
for delete
to authenticated
using (
  bucket_id in (
    'event-posters',
    'team-photos',
    'gallery-images',
    'achievement-images',
    'blog-images',
    'announcement-images'
  )
  and public.is_admin()
);
