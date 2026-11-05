import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Loading from './Loading';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AdminAuthProvider } from './admin/AdminAuthContext';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const NoixorgoPage = lazy(() => import('./pages/NoixorgoPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const MerchPage = lazy(() => import('./pages/MerchPage'));
const SubmitBlogForm = lazy(() => import('./pages/SubmitBlogForm'));

// Admin routes are lazy loaded so the public bundle stays small.
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const ProtectedAdminRoute = lazy(() => import('./admin/ProtectedAdminRoute'));
const AdminOverview = lazy(() => import('./admin/Overview'));
const AdminEvents = lazy(() => import('./admin/EventsAdmin'));
const AdminTeam = lazy(() => import('./admin/TeamAdmin'));
const AdminGallery = lazy(() => import('./admin/GalleryAdmin'));
const AdminAlbums = lazy(() => import('./admin/AlbumsAdmin'));
const AdminAchievements = lazy(() => import('./admin/AchievementsAdmin'));
const AdminBlogs = lazy(() => import('./admin/BlogsAdmin'));
const AdminAnnouncements = lazy(() => import('./admin/AnnouncementsAdmin'));
const AdminSettings = lazy(() => import('./admin/SettingsAdmin'));

/** How long the splash runs, fade included. Full length the very first time this
 *  browser loads the site, a short version on every visit after that. */
const SPLASH_SEEN_KEY = 'eco-splash-seen';
const FIRST_VISIT_MS = 3000;
const RETURNING_VISIT_MS = 1000;
const THEME_KEY = 'eco-theme';

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  } catch {
    // Use the system preference when storage is unavailable.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function getSplashDuration() {
  try {
    return localStorage.getItem(SPLASH_SEEN_KEY) ? RETURNING_VISIT_MS : FIRST_VISIT_MS;
  } catch {
    return FIRST_VISIT_MS; // storage blocked (private mode): always show the full splash
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [splashDuration] = useState(getSplashDuration);
  const [theme, setTheme] = useState(getInitialTheme);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Theme still applies for the current session when storage is unavailable.
    }
  }, [theme]);

  const handleLoadingComplete = () => {
    try {
      localStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      // storage blocked: next visit simply replays the full splash
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <Loading duration={splashDuration} onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <ScrollToTop />
        {!isAdminRoute && (
          <Navbar theme={theme} onThemeChange={() => setTheme((current) => (
            current === 'dark' ? 'light' : 'dark'
          ))} />
        )}

        <AnimatePresence mode="wait">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-12 h-12 border-4 border-[#3FAE5C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/noixorgo" element={<NoixorgoPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:blogId" element={<BlogPostPage />} />
              <Route path="/blog/submit" element={<SubmitBlogForm />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/merch" element={<MerchPage />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={(
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                )}
              >
                <Route index element={<AdminOverview />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="albums" element={<AdminAlbums />} />
                <Route path="achievements" element={<AdminAchievements />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AnimatePresence>

        {!isAdminRoute && <Footer />}
      </div>
    </AdminAuthProvider>
  );
}