/**
 * Pure access decision for admin routes.
 * - setup:   Supabase environment variables are missing
 * - loading: session/admin lookup still in flight
 * - login:   no authenticated session
 * - denied:  signed in, but not an active administrator
 * - ok:      allowed to use the dashboard
 */
export function decideAdminAccess({ configured, loading, session, adminRecord }) {
  if (!configured) return 'setup';
  if (loading) return 'loading';
  if (!session) return 'login';
  if (adminRecord === undefined) return 'loading';
  if (!adminRecord || adminRecord.is_active === false) return 'denied';
  return 'ok';
}
