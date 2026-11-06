-- Row Level Security for ECO Club content.
-- Public visitors can only read published content. Only active administrators
-- can read drafts or write content. Authorisation is enforced in the database,
-- not just by the React router.

-- ---------------------------------------------------------------- helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ------------------------------------------------------- content policies
-- Shared pattern per table:
--   * public (anon/authenticated): SELECT where status = 'published'
--   * admins: SELECT everything, INSERT/UPDATE/DELETE anything
-- Policies are created defensively so the migration can be re-run.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'events',
    'team_members',
    'gallery_albums',
    'gallery_items',
    'achievements',
    'blogs'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);

    execute format('drop policy if exists "Public reads published %1$s" on public.%1$I', table_name);
    execute format(
      'create policy "Public reads published %1$s" on public.%1$I for select to anon, authenticated using (status = %2$L)',
      table_name,
      'published'
    );

    execute format('drop policy if exists "Admins read all %1$s" on public.%1$I', table_name);
    execute format(
      'create policy "Admins read all %1$s" on public.%1$I for select to authenticated using (public.is_admin())',
      table_name
    );

    execute format('drop policy if exists "Admins insert %1$s" on public.%1$I', table_name);
    execute format(
      'create policy "Admins insert %1$s" on public.%1$I for insert to authenticated with check (public.is_admin())',
      table_name
    );

    execute format('drop policy if exists "Admins update %1$s" on public.%1$I', table_name);
    execute format(
      'create policy "Admins update %1$s" on public.%1$I for update to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name
    );

    execute format('drop policy if exists "Admins delete %1$s" on public.%1$I', table_name);
    execute format(
      'create policy "Admins delete %1$s" on public.%1$I for delete to authenticated using (public.is_admin())',
      table_name
    );
  end loop;
end
$$;

-- ------------------------------------------------------------ announcements
alter table public.announcements enable row level security;

drop policy if exists "Public reads active announcements" on public.announcements;
create policy "Public reads active announcements"
on public.announcements
for select
to anon, authenticated
using (
  status = 'published'
  and (start_date is null or start_date <= current_date)
  and (expiry_date is null or expiry_date >= current_date)
);

drop policy if exists "Admins read announcements" on public.announcements;
create policy "Admins read announcements"
on public.announcements
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins insert announcements" on public.announcements;
create policy "Admins insert announcements"
on public.announcements
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins update announcements" on public.announcements;
create policy "Admins update announcements"
on public.announcements
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins delete announcements" on public.announcements;
create policy "Admins delete announcements"
on public.announcements
for delete
to authenticated
using (public.is_admin());

-- --------------------------------------------------------------- admin users
-- No INSERT/UPDATE/DELETE policies for role changes. Provisioning and role
-- adjustments happen with the service-role key (SQL editor / scripts) so a
-- signed-in user can never promote themselves.
drop policy if exists "Admins and self read admin users" on public.admin_users;
create policy "Admins and self read admin users"
on public.admin_users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

-- Admins may edit their own display name. Column-level grants below restrict
-- this to display_name so role and is_active cannot be self-modified.
drop policy if exists "Admins update own profile" on public.admin_users;
create policy "Admins update own profile"
on public.admin_users
for update
to authenticated
using (id = auth.uid() and is_active = true)
with check (id = auth.uid());

revoke insert, update, delete on public.admin_users from anon, authenticated;
revoke update on public.admin_users from authenticated;
grant update (display_name) on public.admin_users to authenticated;

-- ------------------------------------------------------------ privileges
grant select on public.events, public.team_members, public.gallery_albums,
  public.gallery_items, public.achievements, public.blogs, public.announcements
  to anon, authenticated;

grant insert, update, delete on public.events, public.team_members,
  public.gallery_albums, public.gallery_items, public.achievements, public.blogs,
  public.announcements
  to authenticated;
