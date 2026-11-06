import { Navigate } from 'react-router-dom';
import { FiLogOut, FiShield } from 'react-icons/fi';
import { useAdminAuth } from './useAdminAuth';
import { decideAdminAccess } from './authGuard';
import AdminSetupRequired from './AdminSetupRequired';

export default function ProtectedAdminRoute({ children }) {
  const { configured, loading, session, adminRecord, signOut } = useAdminAuth();
  const access = decideAdminAccess({ configured, loading, session, adminRecord });

  if (access === 'setup') return <AdminSetupRequired />;

  if (access === 'loading') {
    return (
      <div className="protected-admin-route flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAFA]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3FAE5C] border-t-transparent" />
        <p className="text-muted">Checking administrator access…</p>
      </div>
    );
  }

  if (access === 'login') {
    return <Navigate to="/admin/login" replace />;
  }

  if (access === 'denied') {
    return (
      <div className="protected-admin-route flex min-h-screen items-center justify-center bg-[#FAFAFA] px-5 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-[#ECECEC] bg-white p-8 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <FiShield className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-[#222]">Administrator access required</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your account is signed in but is not listed as an active administrator.
            Ask the club owner to add you to the <code>admin_users</code> table.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#222] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black"
          >
            <FiLogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
}
