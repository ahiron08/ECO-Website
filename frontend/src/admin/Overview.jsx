import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAward,
  FiBell,
  FiCalendar,
  FiFileText,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi';
import { supabase } from '../lib/supabase';

const quickActions = [
  { label: 'Add event', to: '/admin/events?new=1', icon: FiCalendar },
  { label: 'Add team member', to: '/admin/team?new=1', icon: FiUsers },
  { label: 'Upload gallery images', to: '/admin/gallery', icon: FiImage },
  { label: 'Add achievement', to: '/admin/achievements?new=1', icon: FiAward },
  { label: 'Write blog', to: '/admin/blogs?new=1', icon: FiFileText },
  { label: 'Create announcement', to: '/admin/announcements?new=1', icon: FiBell },
];

const recentSources = [
  { table: 'events', labelField: 'title', type: 'Event', href: '/admin/events' },
  { table: 'blogs', labelField: 'title', type: 'Blog', href: '/admin/blogs' },
  { table: 'team_members', labelField: 'name', type: 'Team', href: '/admin/team' },
  { table: 'gallery_items', labelField: 'caption', type: 'Gallery', href: '/admin/gallery' },
  { table: 'achievements', labelField: 'title', type: 'Achievement', href: '/admin/achievements' },
  { table: 'announcements', labelField: 'title', type: 'Announcement', href: '/admin/announcements' },
];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#e3e9e0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8a7c]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#20372a]">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7ea] text-[#2f7a3d]">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!supabase) return;

    setLoading(true);
    setError(null);

    const today = new Date().toISOString().slice(0, 10);
    const count = (table, apply) => {
      let query = supabase.from(table).select('id', { count: 'exact', head: true });
      if (apply) query = apply(query);
      return query;
    };

    try {
      const [
        events,
        publishedEvents,
        upcomingEvents,
        teamMembers,
        galleryImages,
        achievements,
        blogs,
        announcements,
      ] = await Promise.all([
        count('events'),
        count('events', (query) => query.eq('status', 'published')),
        count('events', (query) => query.eq('status', 'published').gte('start_date', today)),
        count('team_members'),
        count('gallery_items'),
        count('achievements'),
        count('blogs'),
        count('announcements'),
      ]);

      const firstError = [
        events, publishedEvents, upcomingEvents, teamMembers,
        galleryImages, achievements, blogs, announcements,
      ].find((result) => result.error);

      if (firstError) throw firstError.error;

      setStats({
        events: events.count ?? 0,
        publishedEvents: publishedEvents.count ?? 0,
        upcomingEvents: upcomingEvents.count ?? 0,
        teamMembers: teamMembers.count ?? 0,
        galleryImages: galleryImages.count ?? 0,
        achievements: achievements.count ?? 0,
        blogs: blogs.count ?? 0,
        announcements: announcements.count ?? 0,
      });

      const recentResults = await Promise.all(recentSources.map(async (source) => {
        const { data } = await supabase
          .from(source.table)
          .select(`id, ${source.labelField}, status, updated_at`)
          .order('updated_at', { ascending: false })
          .limit(3);

        return (data ?? []).map((row) => ({
          id: `${source.table}-${row.id}`,
          title: row[source.labelField] || 'Untitled',
          status: row.status,
          updatedAt: row.updated_at,
          type: source.type,
          href: source.href,
        }));
      }));

      setRecent(
        recentResults
          .flat()
          .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
          .slice(0, 7),
      );
    } catch (loadError) {
      setError(loadError.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted">
          Everything published here appears on the public website without a redeploy.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[#dce5d8] bg-white px-4 py-2 text-sm font-semibold text-[#31523a] transition hover:border-[#3FAE5C] disabled:opacity-60"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl border border-[#e3e9e0] bg-white" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total events" value={stats.events} icon={FiCalendar} />
          <StatCard label="Published events" value={stats.publishedEvents} icon={FiCalendar} />
          <StatCard label="Upcoming events" value={stats.upcomingEvents} icon={FiCalendar} hint="From today" />
          <StatCard label="Team members" value={stats.teamMembers} icon={FiUsers} />
          <StatCard label="Gallery images" value={stats.galleryImages} icon={FiImage} />
          <StatCard label="Achievements" value={stats.achievements} icon={FiAward} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {quickActions.map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-[#e3e9e0] bg-white p-4 text-sm font-semibold text-[#31523a] shadow-sm transition hover:-translate-y-0.5 hover:border-[#3FAE5C] hover:shadow-md"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef7ea] text-[#2f7a3d] transition group-hover:bg-[#3FAE5C] group-hover:text-white">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="flex items-center gap-1.5 leading-5">
              <FiPlus className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </span>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-[#e3e9e0] bg-white shadow-sm">
        <div className="border-b border-[#eef2ec] px-5 py-4">
          <h2 className="text-lg font-bold text-[#222]">Recent content updates</h2>
          <p className="mt-0.5 text-sm text-muted">The latest changes across every section.</p>
        </div>

        {loading && recent.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-lg bg-[#f1f5ee]" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">
            No content yet. Use a quick action above to publish your first update.
          </p>
        ) : (
          <ul className="divide-y divide-[#eef2ec]">
            {recent.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.href}
                  className="flex flex-col gap-1 px-5 py-3.5 transition hover:bg-[#fbfdf9] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#222]">{item.title}</p>
                    <p className="text-xs text-muted">
                      {item.type}
                      {' · '}
                      <span className="capitalize">{item.status}</span>
                    </p>
                  </div>
                  <span className="flex-none text-xs text-muted">{formatDate(item.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
