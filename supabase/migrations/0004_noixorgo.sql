-- Noixorgo magazine issues migrated from the legacy JSON content.
create table if not exists public.noixorgo_issues (
  id uuid primary key default gen_random_uuid(),
  week integer not null,
  issue_date date,
  date_label text,
  cover_image_url text not null,
  quote_image_url text not null,
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  legacy_week integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists noixorgo_status_date_idx
  on public.noixorgo_issues (status, issue_date desc);

drop trigger if exists noixorgo_issues_set_updated_at on public.noixorgo_issues;
create trigger noixorgo_issues_set_updated_at
before update on public.noixorgo_issues
for each row execute function public.set_updated_at();

alter table public.noixorgo_issues enable row level security;

drop policy if exists "Public reads published noixorgo issues" on public.noixorgo_issues;
create policy "Public reads published noixorgo issues"
on public.noixorgo_issues for select to anon, authenticated
using (status = 'published');

drop policy if exists "Admins read all noixorgo issues" on public.noixorgo_issues;
create policy "Admins read all noixorgo issues"
on public.noixorgo_issues for select to authenticated
using (public.is_admin());

drop policy if exists "Admins insert noixorgo issues" on public.noixorgo_issues;
create policy "Admins insert noixorgo issues"
on public.noixorgo_issues for insert to authenticated
with check (public.is_admin());

drop policy if exists "Admins update noixorgo issues" on public.noixorgo_issues;
create policy "Admins update noixorgo issues"
on public.noixorgo_issues for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete noixorgo issues" on public.noixorgo_issues;
create policy "Admins delete noixorgo issues"
on public.noixorgo_issues for delete to authenticated
using (public.is_admin());

grant select on public.noixorgo_issues to anon, authenticated;
grant insert, update, delete on public.noixorgo_issues to authenticated;
