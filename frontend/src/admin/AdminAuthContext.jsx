import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AdminAuthContext } from './adminAuthContext';

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  // undefined = lookup not finished yet, null = confirmed no admin record.
  const [adminRecord, setAdminRecord] = useState(undefined);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data, error }) => {
      if (cancelled) return;
      if (error) setAuthError(error);
      setSession(data?.session ?? null);
      if (!data?.session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession ?? null);
      if (!nextSession) {
        setAdminRecord(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!supabase || !userId) {
      setAdminRecord(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setAuthError(null);

    supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setAuthError(error);
        setAdminRecord(data ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured yet.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setAdminRecord(null);
  }, []);

  const refreshAdmin = useCallback(async () => {
    if (!supabase || !userId) return null;

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    setAdminRecord(data ?? null);
    return data;
  }, [userId]);

  const value = useMemo(() => ({
    configured: isSupabaseConfigured,
    session,
    adminRecord,
    loading,
    authError,
    signIn,
    signOut,
    refreshAdmin,
  }), [adminRecord, authError, loading, refreshAdmin, session, signIn, signOut]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

