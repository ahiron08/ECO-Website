import { supabase } from './supabase';
import {
  mapAchievementRow,
  mapAnnouncementRow,
  mapBlogRow,
  mapEventRow,
  mapGalleryRow,
  mapTeamRows,
} from './contentMapper';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

async function selectPublished(table, ordering = []) {
  let query = client().from(table).select('*').eq('status', 'published');

  ordering.forEach(([column, options]) => {
    query = query.order(column, options);
  });

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchEvents() {
  const rows = await selectPublished('events', [
    ['start_date', { ascending: false, nullsFirst: false }],
    ['created_at', { ascending: false }],
  ]);

  return rows.map(mapEventRow);
}

export async function fetchTeamMembers() {
  const rows = await selectPublished('team_members', [
    ['academic_year', { ascending: false }],
    ['display_order', { ascending: true }],
    ['name', { ascending: true }],
  ]);

  return mapTeamRows(rows);
}

export async function fetchGalleryItems() {
  const rows = await selectPublished('gallery_items', [
    ['display_order', { ascending: true }],
    ['created_at', { ascending: false }],
  ]);

  return rows.map(mapGalleryRow);
}

export async function fetchAlbums() {
  const rows = await selectPublished('gallery_albums', [
    ['display_order', { ascending: true }],
    ['created_at', { ascending: false }],
  ]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? '',
    coverImage: row.cover_image_url ?? '',
    category: row.category ?? '',
    eventId: row.event_id ?? null,
  }));
}

export async function fetchAchievements() {
  const rows = await selectPublished('achievements', [
    ['featured', { ascending: false }],
    ['achievement_date', { ascending: false, nullsFirst: false }],
    ['created_at', { ascending: false }],
  ]);

  return rows.map(mapAchievementRow);
}

export async function fetchBlogs() {
  const rows = await selectPublished('blogs', [
    ['published_at', { ascending: false, nullsFirst: false }],
    ['created_at', { ascending: false }],
  ]);

  return rows.map(mapBlogRow);
}

/** Accepts a slug, a UUID or a legacy numeric id so old links keep working. */
export async function fetchBlog(identifier) {
  const value = String(identifier ?? '').trim();
  if (!value) return null;

  const column = UUID_PATTERN.test(value)
    ? 'id'
    : (/^\d+$/.test(value) ? 'legacy_id' : 'slug');
  const lookup = column === 'legacy_id' ? Number(value) : value;

  const { data, error } = await client()
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .eq(column, lookup)
    .maybeSingle();

  if (error) throw error;
  return data ? mapBlogRow(data) : null;
}

export async function fetchAnnouncements() {
  const today = new Date().toISOString().slice(0, 10);
  const rows = await selectPublished('announcements', [
    ['start_date', { ascending: false, nullsFirst: false }],
  ]);

  // Mirrors the RLS date-window policy, including open-ended windows.
  return rows
    .map(mapAnnouncementRow)
    .filter((announcement) => (
      (!announcement.startDate || announcement.startDate <= today)
      && (!announcement.expiryDate || announcement.expiryDate >= today)
    ));
}

export async function fetchNoixorgoIssues() {
  const rows = await selectPublished('noixorgo_issues', [
    ['issue_date', { ascending: false, nullsFirst: false }],
    ['week', { ascending: false }],
  ]);

  return rows.map((row) => ({
    week: row.week,
    date: row.date_label || row.issue_date || '',
    coverImage: row.cover_image_url,
    quoteImage: row.quote_image_url,
  }));
}
