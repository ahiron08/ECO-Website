import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminList(table, orderBy = 'created_at', ascending = false) {
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderBy, { ascending, nullsFirst: false });

    if (!error) setRows(data ?? []);
  }, [ascending, orderBy, table]);

  useEffect(() => {
    load();
  }, [load]);

  return rows;
}
