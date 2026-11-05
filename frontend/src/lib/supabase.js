import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ?? ''
).trim();

/**
 * The public site still works from the bundled JSON content when Supabase is
 * not configured (local development, previews, first-time setup).
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** Storage buckets used by the admin dashboard. */
export const STORAGE_BUCKETS = {
  events: 'event-posters',
  team: 'team-photos',
  gallery: 'gallery-images',
  achievements: 'achievement-images',
  blogs: 'blog-images',
  announcements: 'announcement-images',
  noixorgo: 'noixorgo-images',
};
