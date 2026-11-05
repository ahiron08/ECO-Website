import { useEffect, useState } from 'react';
import { FiCheckCircle, FiExternalLink, FiLock, FiLogOut, FiUser } from 'react-icons/fi';
import { useAdminAuth } from './useAdminAuth';
import { useToast } from './useToast';
import { STORAGE_BUCKETS, isSupabaseConfigured, supabase, supabaseUrl } from '../lib/supabase';

function StatusRow({ label, value, ok = true }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#eef2ec] py-3 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={`flex items-center gap-1.5 text-right text-sm font-medium ${ok ? 'text-[#2f7a3d]' : 'text-amber-700'}`}>
        {ok && <FiCheckCircle className="h-4 w-4" aria-hidden="true" />}
        {value}
      </span>
    </div>
  );
}

function safeHostname() {
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return 'Not configured';
  }
}

export default function SettingsAdmin() {
  const { session, adminRecord, refreshAdmin, signOut } = useAdminAuth();
  const { notify } = useToast();
  const [displayName, setDisplayName] = useState(adminRecord?.display_name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setDisplayName(adminRecord?.display_name ?? '');
  }, [adminRecord?.display_name]);

  const saveName = async (event) => {
    event.preventDefault();
    if (!supabase || !session?.user) return;

    setNameError('');
    setSavingName(true);

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ display_name: displayName.trim() || null })
        .eq('id', session.user.id);

      if (error) throw error;

      await refreshAdmin();
      notify('Display name updated.');
    } catch (error) {
      setNameError(error.message || 'Could not update your profile.');
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('The passwords do not match.');
      return;
    }

    setSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setPassword('');
      setConfirmPassword('');
      notify('Password changed.');
    } catch (error) {
      setPasswordError(error.message || 'Could not change the password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const signedInAt = session?.user?.last_sign_in_at
    ? new Date(session.user.last_sign_in_at).toLocaleString()
    : '—';

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border border-[#e3e9e0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7ea] text-[#2f7a3d]">
            <FiUser className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#222]">Administrator profile</h2>
            <p className="text-sm text-muted">Visible in the dashboard header.</p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 rounded-xl bg-[#f8faf6] p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-[#222]">{session?.user?.email ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium capitalize text-[#222]">{adminRecord?.role ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Last sign in</dt>
            <dd className="text-right font-medium text-[#222]">{signedInAt}</dd>
          </div>
        </dl>

        <form onSubmit={saveName} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#222]">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Content administrator"
              className="w-full rounded-xl border border-[#ECECEC] px-3.5 py-2.5 text-sm outline-none focus:border-[#3FAE5C] focus:ring-2 focus:ring-[#3FAE5C]/25"
            />
          </label>

          {nameError && <p role="alert" className="text-sm font-medium text-red-600">{nameError}</p>}

          <button
            type="submit"
            disabled={savingName}
            className="rounded-xl bg-[#3FAE5C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#359a4f] disabled:opacity-60"
          >
            {savingName ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#e3e9e0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef7ea] text-[#2f7a3d]">
            <FiLock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-[#222]">Password</h2>
            <p className="text-sm text-muted">Use at least 8 characters.</p>
          </div>
        </div>

        <form onSubmit={savePassword} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#222]">New password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-[#ECECEC] px-3.5 py-2.5 text-sm outline-none focus:border-[#3FAE5C] focus:ring-2 focus:ring-[#3FAE5C]/25"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#222]">Confirm new password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-[#ECECEC] px-3.5 py-2.5 text-sm outline-none focus:border-[#3FAE5C] focus:ring-2 focus:ring-[#3FAE5C]/25"
            />
          </label>

          {passwordError && <p role="alert" className="text-sm font-medium text-red-600">{passwordError}</p>}

          <button
            type="submit"
            disabled={savingPassword || !password}
            className="rounded-xl bg-[#31523a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#24422c] disabled:opacity-60"
          >
            {savingPassword ? 'Updating…' : 'Change password'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#e3e9e0] bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#222]">System status</h2>
            <p className="text-sm text-muted">Connection and media configuration used by the public site.</p>
          </div>
          <a
            href="/"
            className="hidden items-center gap-2 rounded-xl border border-[#ECECEC] px-3.5 py-2 text-sm font-semibold text-[#31523a] transition hover:border-[#3FAE5C] sm:inline-flex"
          >
            <FiExternalLink className="h-4 w-4" aria-hidden="true" />
            Open website
          </a>
        </div>

        <div className="mt-4">
          <StatusRow label="Supabase connection" value={isSupabaseConfigured ? 'Configured' : 'Missing environment variables'} ok={isSupabaseConfigured} />
          <StatusRow label="Project host" value={safeHostname()} ok={isSupabaseConfigured} />
          <StatusRow label="Administrator record" value={adminRecord?.is_active ? 'Active' : 'Inactive'} ok={Boolean(adminRecord?.is_active)} />
          <StatusRow label="Public content source" value={isSupabaseConfigured ? 'Supabase (JSON fallback on error)' : 'Bundled JSON'} ok={isSupabaseConfigured} />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#7a8a7c]">Storage buckets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(STORAGE_BUCKETS).map(([key, bucket]) => (
              <span key={key} className="rounded-full bg-[#eef7ea] px-3 py-1 text-xs font-medium text-[#2f7a3d]">
                {bucket}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[#eef2ec] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-muted">
            Setup, deployment and migration instructions live in <code>docs/ADMIN_CMS_SETUP.md</code>.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-[#ECECEC] px-4 py-2.5 text-sm font-semibold text-[#8a3b3b] transition hover:bg-red-50 sm:self-auto"
          >
            <FiLogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
