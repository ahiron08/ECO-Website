import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAchievements,
  fetchAlbums,
  fetchAnnouncements,
  fetchBlog,
  fetchBlogs,
  fetchEvents,
  fetchGalleryItems,
  fetchTeamMembers,
} from '../lib/contentClient';
import {
  fallbackAchievements,
  fallbackAlbums,
  fallbackAnnouncements,
  fallbackBlogs,
  fallbackEvents,
  fallbackGallery,
  fallbackTeam,
} from '../lib/fallbackContent';

const CACHE_TTL_MS = 30_000;
const cache = new Map();
const invalidationListeners = new Set();

/**
 * Called after an admin mutation so open public pages refetch immediately.
 * Content is also revalidated when the window regains focus.
 */
export function invalidateContentCache() {
  cache.clear();
  invalidationListeners.forEach((listener) => listener());
}

function useContentQuery(key, fetcher, fallbackData, enabled = true) {
  const [state, setState] = useState(() => {
    if (!isSupabaseConfigured) {
      return { data: fallbackData, loading: false, error: null, source: 'local' };
    }

    const cached = cache.get(key);
    return {
      data: cached?.data ?? null,
      loading: enabled && !cached,
      error: null,
      source: cached ? 'cache' : 'remote',
    };
  });

  const load = useCallback(async ({ background = false } = {}) => {
    if (!enabled) return;

    if (!isSupabaseConfigured) {
      setState({ data: fallbackData, loading: false, error: null, source: 'local' });
      return;
    }

    const cached = cache.get(key);

    setState((previous) => {
      if (cached) {
        return { data: cached.data, loading: false, error: null, source: 'cache' };
      }

      return {
        data: background ? previous.data : null,
        loading: !background,
        error: null,
        source: 'remote',
      };
    });

    try {
      const data = await fetcher();
      cache.set(key, { data, timestamp: Date.now() });
      setState({ data, loading: false, error: null, source: 'remote' });
    } catch (error) {
      console.error(`Unable to load ${key} from Supabase.`, error);
      const fallbackCache = cache.get(key);
      setState({
        data: fallbackCache?.data ?? fallbackData,
        loading: false,
        error,
        source: fallbackCache ? 'cache' : 'fallback',
      });
    }
  }, [enabled, fallbackData, fetcher, key]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isSupabaseConfigured || !enabled) return undefined;

    const handleInvalidate = () => load({ background: true });
    const handleFocus = () => {
      const cached = cache.get(key);
      if (!cached || Date.now() - cached.timestamp > CACHE_TTL_MS) {
        load({ background: true });
      }
    };

    invalidationListeners.add(handleInvalidate);
    window.addEventListener('focus', handleFocus);

    return () => {
      invalidationListeners.delete(handleInvalidate);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, key, load]);

  return { ...state, refetch: load };
}

export function useEvents() {
  return useContentQuery('events', fetchEvents, fallbackEvents);
}

export function useTeamMembers() {
  return useContentQuery('team', fetchTeamMembers, fallbackTeam);
}

export function useGallery() {
  return useContentQuery('gallery', fetchGalleryItems, fallbackGallery);
}

export function useAlbums() {
  return useContentQuery('albums', fetchAlbums, fallbackAlbums);
}

export function useAchievements() {
  return useContentQuery('achievements', fetchAchievements, fallbackAchievements);
}

export function useBlogs() {
  return useContentQuery('blogs', fetchBlogs, fallbackBlogs);
}

export function useAnnouncements() {
  return useContentQuery('announcements', fetchAnnouncements, fallbackAnnouncements);
}

export function useBlog(identifier) {
  const key = `blog:${identifier ?? ''}`;
  const fetcher = useCallback(() => fetchBlog(identifier), [identifier]);
  const fallbackData = useMemo(
    () => fallbackBlogs.find(
      (blog) => String(blog.id) === String(identifier)
        || String(blog.slug) === String(identifier),
    ) ?? null,
    [identifier],
  );

  return useContentQuery(key, fetcher, fallbackData, Boolean(identifier));
}
