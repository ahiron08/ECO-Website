/**
 * Bundled content used when Supabase is not configured yet (or when a public
 * query fails). This keeps every existing page working during setup and
 * provides the source data for the one-off Supabase migration.
 */
import eventsData from '../data/events.json';
import teamData from '../data/team.json';
import galleryData from '../data/gallery.json';
import achievementsData from '../data/achievements.json';
import blogsData from '../data/blogs.json';
import noixorgoData from '../data/noixorgo.json';
import { slugify } from './contentMapper';

export const fallbackEvents = eventsData.map((event) => ({
  ...event,
  slug: `${slugify(event.title)}-${event.id}`,
  category: '',
  featured: Boolean(event.featured),
  status: 'published',
}));

export const fallbackTeam = {
  committees: teamData.committees,
};

export const fallbackGallery = [...galleryData];

export const fallbackAchievements = [...achievementsData];

export const fallbackBlogs = blogsData.map((blog) => ({
  ...blog,
  slug: `${slugify(blog.title)}-${blog.id}`,
  content: Array.isArray(blog.content) ? blog.content.join('\n\n') : blog.content,
}));

export const fallbackAnnouncements = [];

export const fallbackAlbums = [];

export const fallbackNoixorgo = [
  noixorgoData.featured,
  ...(noixorgoData.previous ?? []),
];
