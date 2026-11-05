# ECO Club Admin CMS — setup and operations

This document explains how the ECO Club website was upgraded so that events,
team members, gallery images, albums, achievements, blogs and announcements can
be managed from `/admin` without editing source files or redeploying.

The existing visual design, public routes, filters, animations and the bundled
JSON content have been preserved.

---

## 1. What was added

- **Supabase** PostgreSQL database, Auth and Storage.
- **Admin dashboard** at `/admin` with a branded, responsive UI.
- **Row Level Security (RLS)** on every content table and storage bucket.
- **Public content hooks** that query Supabase and fall back to the original
  JSON files if Supabase is missing or a query fails.
- **Idempotent migration** from `frontend/src/data/*.json` and
  `frontend/public/**` into Supabase.
- **Owner scripts** for provisioning administrators, migrating content and
  verifying security.

### Architecture

```text
Public pages
  useEvents / useTeamMembers / useGallery / useAchievements / useBlogs / useBlog / useAnnouncements
      │
      ├── Supabase (published rows only, via RLS)   ← normal path
      └── Bundled JSON content                      ← fallback / first-time setup

Admin pages (/admin/*)
  AdminAuthProvider → supabase.auth → admin_users (is_admin() policy)
  CrudPage → Supabase content tables + Storage upload
      │
      └── invalidateContentCache() → open public pages refetch

Storage buckets (public read, admin write)
  event-posters · team-photos · gallery-images · achievement-images
  blog-images · announcement-images
```

### Admin routes

| Route | Purpose |
|---|---|
| `/admin/login` | Administrator sign-in (no public registration) |
| `/admin` | Overview: counts, recent updates, quick actions |
| `/admin/events` | Create/edit/delete events, posters and results posters |
| `/admin/team` | Committee members, photos, categories and order |
| `/admin/gallery` | Single and bulk photo uploads |
| `/admin/albums` | Album management and event linking |
| `/admin/achievements` | Awards and milestones |
| `/admin/blogs` | Markdown editor with image uploads |
| `/admin/announcements` | Dated homepage notices |
| `/admin/settings` | Profile, password and system status |

---

## 2. Prerequisites

- Node.js 20+ and npm
- A Supabase account (free tier is sufficient for this site)
- Access to the Vercel project if you want to update production
- The repository checked out locally

---

## 3. Create the Supabase project

1. Sign in to <https://supabase.com/dashboard>.
2. Create a new project (suggested name: `eco-club-website`).
3. Choose a strong database password and store it in your password manager.
4. Wait for the project to finish provisioning.
5. Open **Project Settings → API** and note:
   - Project URL (`https://<project-ref>.supabase.co`)
   - `anon` / publishable key
   - `service_role` key (owner-only; never put it in frontend code)

> Do not use an existing production database until you have read the
> deployment checklist in section 9.

---

## 4. Run the SQL migrations

The migrations live in `supabase/migrations/` and must run **in order**:

1. `0001_schema.sql` — tables, indexes, triggers, constraints
2. `0002_rls.sql` — `is_admin()`, table policies, column grants
3. `0003_storage.sql` — buckets and storage policies

### Option A — Supabase SQL editor (simplest)

For each file, open **SQL Editor → New query**, paste the whole file and run it.
Run `0001`, then `0002`, then `0003`.

### Option B — Supabase CLI

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Both options are safe to re-run; the policies and bucket definitions are
idempotent.

### What the schema contains

- `events` — title, slug, descriptions, poster/results posters, category,
  venue, time label, start/end dates, registration URL, organiser, featured,
  status, `legacy_id`
- `team_members` — name, designation, department, academic year, batch,
  category, bio, photo, email, display order, status, `legacy_key`
- `gallery_albums` — title, slug, description, cover, category, optional event
- `gallery_items` — image/thumbnail, caption, description, category, album,
  optional event, display order, status, `legacy_src`
- `achievements` — title, description, image, date, category, featured, status
- `blogs` — title, slug, excerpt, content, cover, author, category,
  `published_at`, status
- `announcements` — title, content, image, start/expiry dates, status
- `admin_users` — auth user reference, display name, role, active flag

All IDs are UUIDs except the legacy keys used for repeatable migration.

### Status values

`draft`, `published`, `archived`.

Public policies expose **only `published`** rows. Admin policies expose all rows
to active administrators.

---

## 5. Configure environment variables

### Local development

Create `frontend/.env.local` (ignored by Git):

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>

# Owner-only, used by scripts. Never used by the website.
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`frontend/.env.example` documents the same names with safe placeholders.

> **Security:** any variable prefixed with `VITE_` is embedded in the browser
> bundle. The service-role key must never use a `VITE_` prefix and must never
> be imported under `frontend/src/`.

Restart `npm run dev` after creating the file.

### Vercel

Open **Project → Settings → Environment Variables** and add both public
variables to **Production**, **Preview** and **Development**:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Do not add `SUPABASE_SERVICE_ROLE_KEY` to Vercel. It is only needed locally for
the owner scripts.

Vite bakes environment variables into the build, so redeploy after changing
them. The existing `frontend/vercel.json` rewrite already serves `index.html`
for `/admin/*`, so no rewrite changes are required.

---

## 6. Create the first administrator

There is **no public sign-up**. Administrator access requires both:

1. a Supabase Auth user, and
2. an active row in `public.admin_users` for that user.

### Option A — provisioning script (recommended)

With the service-role key in `frontend/.env.local`:

```bash
cd frontend
node scripts/create-admin.mjs \
  --email=admin@example.com \
  --password="a-strong-password" \
  --name="Club Administrator"
```

The script creates the Auth user (email confirmed), links it in `admin_users`,
and never logs the password. Re-running it for an existing email re-activates
that account instead of creating a duplicate; reset the password in the
Supabase dashboard if you do not know it.

### Option B — Supabase dashboard + SQL

1. **Authentication → Users → Add user**, create the email/password and confirm
   the email.
2. Run this in the SQL editor, replacing the email:

```sql
insert into public.admin_users (id, display_name, role, is_active)
select id, 'Club Administrator', 'admin', true
from auth.users
where lower(email) = lower('admin@example.com')
on conflict (id) do update
set display_name = excluded.display_name,
    role = excluded.role,
    is_active = true;
```

Administrators sign in at `/admin/login`. There is deliberately no client-side
insert/update policy on `admin_users`; role changes require the service-role key
or SQL editor so a signed-in user can never promote themselves.

Settings allows an administrator to change only their **display name** and
password. The database column grants enforce this.

---

## 7. Migrate the existing content

The JSON files remain the source of truth until the migration is verified.
They are read-only inputs and are never deleted.

Preview without credentials:

```bash
cd frontend
npm run migrate:content:dry
```

Apply with owner credentials:

```bash
npm run migrate:content
```

What the script does:

- uploads referenced images from `frontend/public/` into the correct buckets
  (preserving their relative path), and stores the resulting public URLs
- upserts events, team members, gallery albums/items, achievements and blogs
- derives slugs and gallery albums from existing categories
- converts blog paragraph arrays into safe markdown-lite text
- is **idempotent**: re-running updates rows by `legacy_id`, `legacy_key`,
  `legacy_src` or album `slug` rather than creating duplicates
- uses `--skip-images` if you prefer to keep the current bundled image paths
- never deletes source content

Recommended sequence:

1. Back up `frontend/src/data/` and `frontend/public/` (Git already tracks them).
2. Run the dry run and check the reported record counts.
3. Run the real migration against a **development** Supabase project first.
4. Verify the public pages and admin dashboard.
5. Only then run it against production, after section 9 approval.

No announcements exist in the old JSON, so that table starts empty.

---

## 8. Verify authentication and security

### Automated checks

```bash
cd frontend
npm run verify:security
```

Using the anonymous key, this verifies that:

- published content is readable
- draft/archived content is not exposed
- anonymous inserts into content tables are blocked
- `admin_users` is not readable
- anonymous storage uploads and deletes are blocked

Exit code `1` means at least one policy needs attention.

It only performs **non-destructive** checks (no data is edited or removed).

### Manual checks

1. Open `/admin` while signed out → redirected to `/admin/login`.
2. Sign in with an authorised account → dashboard loads.
3. Sign out → back to login; `/admin` is no longer accessible.
4. Create a second Auth user **without** an `admin_users` row, sign in → access
   denied, with a sign-out option.
5. In the browser Network tab, confirm anon requests to content tables return
   only published rows.
6. Try a direct REST insert with the anon key (or use the script) → rejected by
   RLS and Storage policies.
7. Deactivate an admin (`is_active = false`) → their next dashboard load is
   denied.

### Run the local checks

```bash
cd frontend
npm test        # 28 unit/integrity tests (mappers, guard, forms, images, JSON/assets)
npm run lint
npm run build
```

---

## 9. Production deployment and migration checklist

Do **not** deploy or migrate production as part of development work without
the owner's approval.

1. Review the diff and make a branch/PR.
2. Confirm `frontend/.env.example` contains placeholders only and no `.env`
   file is tracked (`git status --ignored`).
3. Create/confirm the production Supabase project and run the three migrations.
4. Provision the production administrator with `scripts/create-admin.mjs`
   using production credentials from a local env file.
5. Back up production data (Supabase **Database → Backups**) and the JSON
   folder.
6. Run `npm run migrate:content:dry` and review counts.
7. Run `npm run migrate:content` once.
8. Run `npm run verify:security` with the production anon key.
9. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel for
   Production and Preview.
10. Deploy a **preview** build first. Test:
    - public homepage, events, team, gallery, blog, achievements, announcements
    - filters, lightboxes, responsive layouts, dark mode
    - admin login, add event with poster, publish, view on public site
11. Promote the preview to production.
12. Sign in at `https://eco-website-rho.vercel.app/admin` and complete the
    end-to-end workflow (add event → upload poster → publish → verify public
    page). Repeat briefly for team, gallery, achievements, blogs and
    announcements.
13. Keep the JSON files in the repository as a fallback and rollback source.

### Rollback

- **Fast rollback:** remove the two `VITE_` variables in Vercel and redeploy.
  The public site immediately falls back to the bundled JSON content.
- The admin dashboard then shows the “Connect the content database” setup
  screen instead of a broken login.
- Database rollback (only if required): delete the CMS tables/buckets created
  by the migrations. Do not drop tables that contain other project data.
- No existing JSON content is deleted by this implementation.

---

## 10. Day-to-day admin guide

### Publish an event

1. `/admin/events` → **New event**.
2. Enter title, start date, description, venue and registration link.
3. Upload the event poster.
4. Upload a results poster if the event has concluded (this enables the
   **View Results** button on the public card).
5. Set status to **Published** and save.
6. Optionally tick **Feature on homepage**.

### Manage the team

Add members with a category and committee year. Categories match the existing
public layout: faculty advisor, secretary, senior executives, developers,
junior executives and other team members. `Display order` controls ordering
inside a category. Deactivated/draft members are hidden.

### Gallery and albums

- Single image: **New gallery image**, upload, add caption/category.
- Many images: **Bulk upload**, choose files, set shared album/category/status,
  edit captions, then upload. Each file shows its own progress and errors.
- Deleting a gallery record also removes its uploaded file from Storage on a
  best-effort basis.

### Blogs

Use the markdown-lite editor:

- blank line between paragraphs
- `## Heading` / `### Heading`
- `> Quote`
- **Insert image** uploads and inserts `![alt](url)`

The renderer builds React elements from this syntax; raw HTML is not rendered,
so stored content cannot inject scripts.

### Announcements

Set **Show from** and **Show until** dates. The homepage shows the newest
published announcement inside its window; visitors can dismiss it. Draft and
expired announcements are not shown.

### Settings

Change your display name or password and inspect connection/storage status.
Role and activation changes are intentionally owner-only (SQL/service role).

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Public site shows old JSON content | `VITE_` variables missing/typo, or dev server not restarted | Add variables, restart/redeploy |
| `/admin` shows “Setup required” | Same as above | Configure env and restart |
| Login succeeds but access denied | No active `admin_users` row | Run provisioning script/SQL |
| “Row-level security” errors when saving | Session expired or user not an admin | Sign in again; verify `is_admin()` |
| Uploads fail with 403 | Storage policies missing or not an admin | Re-run `0003_storage.sql`; sign in again |
| “Unsupported file type” | File is not JPG/PNG/WebP/GIF/AVIF | Convert the image |
| “Image is too large” | Bucket size limit exceeded | Compress the image |
| Migration reports missing file | JSON points at a non-existent asset | Restore the asset or use `--skip-images` |
| Unique slug error | Another row already uses that slug | Change the slug in the form |

---

## 12. Known limitations

- Public pages do not receive realtime push updates. They revalidate on
  navigation, on window focus (after 30 seconds) and immediately after an admin
  mutation in the same browser session. Other visitors see changes on their next
  navigation/refresh.
- The blog editor is intentionally markdown-lite (headings, quotes, images,
  paragraphs). Bold/italic/raw HTML are not supported.
- Upload progress uses XHR because `supabase-js` does not expose progress
  events.
- Albums are managed in the dashboard, but the public gallery remains the
  existing flat, category-filtered grid; album filtering was not added to avoid
  changing the existing design.
- Noixorgo, merch, footer/social links and static page copy remain in code.
- `admin_users` management (roles/removal) is deliberately CLI/SQL-only.
- The automated suite covers pure logic, mapping and content integrity. Live
  RLS, Auth and Storage behaviour must be verified against a configured project
  with `npm run verify:security` and the manual checklist.
- Creating the Supabase project, setting Vercel variables and running the
  production migration require the owner's credentials and approval.

---

## 13. File map

New frontend files:

```text
frontend/src/lib/supabase.js              Client + configuration detection
frontend/src/lib/contentClient.js         Published-content Supabase queries
frontend/src/lib/contentMapper.js         Row → UI mapping, dates, slugs, parser
frontend/src/lib/fallbackContent.js       Bundled JSON fallback
frontend/src/lib/imageValidation.js       Pure upload validation
frontend/src/lib/storage.js               Uploads with progress + cleanup
frontend/src/hooks/useContent.js          Public data hooks + cache invalidation
frontend/src/components/ContentBlocks.jsx Safe blog renderer
frontend/src/admin/*                      Auth, layout, dashboard and modules
frontend/src/admin/components/*           Modal, CRUD table, forms, uploads
frontend/tests/*                          Unit and content-integrity tests
frontend/scripts/migrate-content.mjs      JSON → Supabase migration
frontend/scripts/create-admin.mjs        Administrator provisioning
frontend/scripts/verify-security.mjs     Anonymous RLS/Storage verification
frontend/scripts/env.mjs                  Dependency-free env loader
frontend/.env.example                     Environment template
supabase/migrations/0001_schema.sql       Tables and triggers
supabase/migrations/0002_rls.sql          RLS policies and grants
supabase/migrations/0003_storage.sql      Buckets and storage policies
```

Modified frontend files:

```text
frontend/src/App.jsx                      Admin routes + nav/footer hiding
frontend/src/pages/EventsPage.jsx         Hook-based events
frontend/src/pages/TeamPage.jsx           Hook-based, category-driven team
frontend/src/pages/GalleryPage.jsx        Hook-based gallery + lightbox
frontend/src/pages/BlogPage.jsx           Hook-based blog listing
frontend/src/pages/BlogPostPage.jsx       Hook-based article + safe renderer
frontend/src/pages/HomePage.jsx           Hook-based events/achievements/blogs
                                          + announcements strip
frontend/src/components/EventCard.jsx     Missing-poster placeholder
frontend/src/index.css                    Admin/announcement dark styles
frontend/src/pages/... (other public pages unchanged)
frontend/package.json                     Supabase client, test/migration scripts
frontend/.gitignore                       Ignores .env files
README.md                                 CMS overview and quick start
```
