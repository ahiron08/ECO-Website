import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiLogOut, FiMail } from 'react-icons/fi';
import { useAdminAuth } from './useAdminAuth';
import AdminSetupRequired from './AdminSetupRequired';

export default function AdminLogin() {
  const { configured, session, adminRecord, loading, signIn, signOut } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!configured) return <AdminSetupRequired />;

  if (session && adminRecord?.is_active) {
    return <Navigate to="/admin" replace />;
  }

  const signedInWithoutAccess = Boolean(session) && !loading && adminRecord === null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(email, password);
      // AdminAuthProvider picks up the session and this page redirects once
      // the admin_users lookup confirms access.
    } catch (signInError) {
      setError(
        signInError?.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Administrator accounts are created manually.'
          : signInError?.message || 'Sign in failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login flex min-h-screen items-stretch bg-[#FAFAFA]">
      <aside className="relative hidden w-1/2 overflow-hidden bg-[#10291d] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-25" aria-hidden="true">
          <div className="absolute -right-24 top-16 h-96 w-96 rounded-full bg-[#3FAE5C] blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-[#91d65c] blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <img src="/logo.png" alt="Eco Club logo" className="h-12 w-12 rounded-full bg-white p-1" />
          <div>
            <p className="text-lg font-bold">ECO Club</p>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">NIT Silchar</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight">
            Manage the website without touching the code.
          </h1>
          <p className="mt-5 text-base leading-7 text-white/70">
            Publish events, posters, team members, galleries, achievements and stories.
            Changes appear on the public site immediately.
          </p>
        </div>

        <p className="relative text-xs text-white/45">
          Authorised administrators only. Accounts are provisioned manually.
        </p>
      </aside>

      <main className="flex w-full flex-col justify-center px-5 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-[#3FAE5C] hover:underline">
            <FiArrowLeft className="h-4 w-4" />
            Back to website
          </Link>

          <div className="mt-8 flex items-center gap-3 lg:hidden">
            <img src="/logo.png" alt="Eco Club logo" className="h-11 w-11 rounded-full border border-[#ECECEC] p-0.5" />
            <div>
              <p className="font-bold text-[#222]">ECO Club Content Studio</p>
              <p className="text-xs text-muted">NIT Silchar</p>
            </div>
          </div>

          <h2 className="mt-8 text-3xl font-bold tracking-tight text-[#222]">Administrator sign in</h2>
          <p className="mt-2 text-sm text-muted">
            Use the email and password created for your admin account.
          </p>

          {signedInWithoutAccess ? (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-800">This account is not an administrator.</p>
              <p className="mt-1 text-sm leading-6 text-amber-700">
                The signed-in user has no active record in <code>admin_users</code>. Ask
                an owner to provision access, or sign out and use another account.
              </p>
              <button
                type="button"
                onClick={() => signOut()}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                <FiLogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#222]">Email</span>
                <span className="relative block">
                  <FiMail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    className="w-full rounded-xl border border-[#ECECEC] bg-white py-3 pl-10 pr-4 text-[#222] outline-none transition focus:border-[#3FAE5C] focus:ring-2 focus:ring-[#3FAE5C]/30"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#222]">Password</span>
                <span className="relative block">
                  <FiLock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[#ECECEC] bg-white py-3 pl-10 pr-4 text-[#222] outline-none transition focus:border-[#3FAE5C] focus:ring-2 focus:ring-[#3FAE5C]/30"
                  />
                </span>
              </label>

              {error && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#3FAE5C] px-5 py-3 font-semibold text-white transition hover:bg-[#359a4f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          <p className="mt-8 rounded-xl bg-[#f5f8f3] px-4 py-3 text-xs leading-5 text-[#5b6f60]">
            There is no public sign-up. New administrators are added by the club owner
            through the Supabase dashboard or the provisioning script.
          </p>
        </div>
      </main>
    </div>
  );
}
