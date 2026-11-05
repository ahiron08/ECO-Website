-- ECO Club content schema.
-- Run this migration first (Supabase SQL editor or `supabase db push`).

create extension if not exists pgcrypto;

-- Keep updated_at accurate for every content table.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------- events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  poster_url text,
  results_image_url text,
  event_category text,
  venue text,
  time_label text,
  start_date date,
  end_date date,
  registration_url text,
  organiser text not null default 'Eco Club NITS',
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  legacy_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_dates_valid check (
    end_date is null or start_date is null or end_date >= start_date
  )
);

create index if not exists events_status_start_idx on public.events (status, start_date);
create index if not exists events_featured_idx on public.events (featured) where featured;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------ team members
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text,
  department text,
  academic_year text not null default '2026',
  batch text,
  category text not null default 'seniorExecutives' check (
    category in (
      'facultyAdvisor',
      'secretary',
      'seniorExecutives',
      'developers',
      'juniorExecutives',
      'other'
    )
  ),
  bio text,
  photo_url text,
  email text,
  display_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  legacy_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_members_year_idx on public.team_members (academic_year, category, display_order);
create index if not exists team_members_status_idx on public.team_members (status);

drop trigger if exists team_members_set_updated_at on public.team_members;
create trigger team_members_set_updated_at
before update on public.team_members
for each row execute function public.set_updated_at();

-- --------------------------------------------------------- gallery albums
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  category text,
  event_id uuid references public.events (id) on delete set null,
  display_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_albums_status_idx on public.gallery_albums (status, display_order);

drop trigger if exists gallery_albums_set_updated_at on public.gallery_albums;
create trigger gallery_albums_set_updated_at
before update on public.gallery_albums
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------- gallery items
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.gallery_albums (id) on delete set null,
  event_id uuid references public.events (id) on delete set null,
  image_url text not null,
  thumbnail_url text,
  caption text,
  description text,
  category text,
  display_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  legacy_src text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_items_status_idx on public.gallery_items (status, display_order);
create index if not exists gallery_items_album_idx on public.gallery_items (album_id);

drop trigger if exists gallery_items_set_updated_at on public.gallery_items;
create trigger gallery_items_set_updated_at
before update on public.gallery_items
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------ achievements
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  achievement_date date,
  category text,
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  legacy_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists achievements_status_idx on public.achievements (status);

drop trigger if exists achievements_set_updated_at on public.achievements;
create trigger achievements_set_updated_at
before update on public.achievements
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------ blogs
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  author text,
  category text,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  legacy_id integer unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blogs_status_published_idx on public.blogs (status, published_at desc);

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
before update on public.blogs
for each row execute function public.set_updated_at();

-- ----------------------------------------------------------- announcements
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text,
  image_url text,
  start_date date,
  expiry_date date,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_dates_valid check (
    expiry_date is null or start_date is null or expiry_date >= start_date
  )
);

create index if not exists announcements_status_dates_idx on public.announcements (status, start_date, expiry_date);

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

-- -------------------------------------------------------------- admin users
-- Accounts are provisioned manually (SQL editor or scripts/create-admin.mjs).
-- Rows reference Supabase Auth users; there is no public registration path.
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
