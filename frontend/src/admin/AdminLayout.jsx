import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  FiAward,
  FiBell,
  FiCalendar,
  FiExternalLink,
  FiFileText,
  FiFolder,
  FiGrid,
  FiImage,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSettings,
  FiSun,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { useAdminAuth } from './useAdminAuth';
import { ToastProvider } from './Toast';

const navigation = [
  { to: '/admin', label: 'Overview', icon: FiGrid, end: true },
  { to: '/admin/events', label: 'Events', icon: FiCalendar },
  { to: '/admin/team', label: 'Team', icon: FiUsers },
  { to: '/admin/gallery', label: 'Gallery', icon: FiImage },
  { to: '/admin/albums', label: 'Albums', icon: FiFolder },
  { to: '/admin/achievements', label: 'Achievements', icon: FiAward },
  { to: '/admin/blogs', label: 'Blogs', icon: FiFileText },
  { to: '/admin/announcements', label: 'Announcements', icon: FiBell },
  { to: '/admin/noixorgo', label: 'Noixorgo', icon: FiImage },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const titles = {
  '/admin': { title: 'Overview', subtitle: 'A snapshot of what is live on the website.' },
  '/admin/events': { title: 'Events', subtitle: 'Create, publish and archive club events.' },
  '/admin/team': { title: 'Team', subtitle: 'Manage committee members and their photos.' },
  '/admin/gallery': { title: 'Gallery', subtitle: 'Upload photos, captions and categories.' },
  '/admin/albums': { title: 'Albums', subtitle: 'Group gallery photos into albums.' },
  '/admin/achievements': { title: 'Achievements', subtitle: 'Showcase awards and milestones.' },
  '/admin/blogs': { title: 'Blogs', subtitle: 'Write and publish articles for the blog.' },
  '/admin/announcements': { title: 'Announcements', subtitle: 'Share short notices with visitors.' },
  '/admin/noixorgo': { title: 'Noixorgo', subtitle: 'Manage magazine issues and environmental tips.' },
  '/admin/settings': { title: 'Settings', subtitle: 'Your account and system status.' },
};

export default function AdminLayout() {
  const { session, adminRecord, signOut } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('eco-theme') === 'dark'
        || document.documentElement.classList.contains('dark');
    } catch {
      return document.documentElement.classList.contains('dark');
    }
  });
  const location = useLocation();
  const page = titles[location.pathname] ?? { title: 'Dashboard', subtitle: '' };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle('dark', next);
      document.documentElement.style.colorScheme = next ? 'dark' : 'light';
      window.dispatchEvent(new CustomEvent('eco-theme-change', {
        detail: next ? 'dark' : 'light',
      }));
      try {
        localStorage.setItem('eco-theme', next ? 'dark' : 'light');
      } catch {
        // The current document still changes when storage is unavailable.
      }
      return next;
    });
  };

  const displayName = adminRecord?.display_name || session?.user?.email || 'Administrator';
  const initials = displayName
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-3 px-6 py-6">
        <img
          src="/logo.png"
          alt="Eco Club logo"
          className="h-11 w-11 rounded-full bg-white p-1"
        />
        <div>
          <p className="text-base font-bold text-white">ECO Club</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
            Content Studio
          </p>
        </div>
      </Link>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3 pb-4" aria-label="Admin sections">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#3FAE5C] text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <FiExternalLink className="h-4 w-4" aria-hidden="true" />
          View public website
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <FiLogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="admin-shell min-h-screen bg-[#f6f8f4]">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-[#10291d] lg:block">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/50"
            />
            <aside className="relative h-full w-72 max-w-[85vw] bg-[#10291d] shadow-2xl">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 border-b border-[#e3e9e0] bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                  className="rounded-xl border border-[#ECECEC] p-2 text-[#222] lg:hidden"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold tracking-tight text-[#222] sm:text-2xl">{page.title}</h1>
                  {page.subtitle && (
                    <p className="hidden truncate text-sm text-muted sm:block">{page.subtitle}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="rounded-xl border border-[#ECECEC] p-2 text-[#222] transition hover:border-[#3FAE5C] dark:border-[#34443B] dark:text-[#E6EFE9]"
                >
                  {darkMode ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
                </button>
                <span className="hidden max-w-48 truncate text-sm font-medium text-muted md:block">
                  {displayName}
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef7ea] text-xs font-bold text-[#2f7a3d]">
                  {initials}
                </span>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
