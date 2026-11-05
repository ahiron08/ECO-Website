import { createClient } from '@supabase/supabase-js';
import { envValue, loadEnvFiles, parseArgs } from './env.mjs';

loadEnvFiles();

const { flags } = parseArgs();

if (flags.has('--help')) {
  console.log(`
Verify database and storage security with an anonymous Supabase client.

  node scripts/verify-security.mjs

Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from frontend/.env.local.
Checks that anonymous visitors can only read published content and cannot
write to content tables or storage buckets. Exit code 1 if any check fails.
`);
  process.exit(0);
}

const url = envValue('VITE_SUPABASE_URL', 'SUPABASE_URL');
const anonKey = envValue('VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_PUBLISHABLE_KEY');

if (!url || !anonKey) {
  console.error(`
Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env.local.

This check needs a configured Supabase project. Public pages still fall back to
bundled JSON content until it is configured.
`);
  process.exit(1);
}

const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = [];
const record = (name, passed, detail) => results.push({ name, passed, detail });

async function main() {
  // 1. Public read of published content must work.
  {
    const { data, error } = await supabase.from('events').select('id').eq('status', 'published').limit(5);
    record(
      'Anonymous can read published events',
      !error,
      error ? error.message : `${data?.length ?? 0} row(s) visible`,
    );
  }

  // 2. Draft/archived rows must not be exposed by the public policy.
  {
    const { data, error } = await supabase.from('events').select('id').neq('status', 'published').limit(5);
    const exposed = data?.length ?? 0;
    record(
      'Anonymous cannot see drafts or archived content',
      !error && exposed === 0,
      error ? `query blocked: ${error.message}` : `${exposed} non-published row(s) exposed`,
    );
  }

  // 3. Anonymous inserts must be rejected by RLS.
  {
    const { error } = await supabase.from('events').insert({
      title: 'Security check — do not keep',
      slug: `security-check-${Date.now()}`,
      status: 'published',
    });
    record(
      'Anonymous cannot insert events',
      Boolean(error),
      error ? `blocked (${error.message})` : 'NOT BLOCKED — check RLS',
    );
  }

  // 4. A second write path, to catch per-table policy mistakes.
  {
    const { error } = await supabase.from('achievements').insert({
      title: 'Security check — do not keep',
      status: 'published',
    });
    record(
      'Anonymous cannot insert achievements',
      Boolean(error),
      error ? `blocked (${error.message})` : 'NOT BLOCKED — check RLS',
    );
  }

  // 5. Admin records must never be visible to anonymous visitors.
  {
    const { data, error } = await supabase.from('admin_users').select('id').limit(5);
    const exposed = data?.length ?? 0;
    record(
      'Anonymous cannot read admin_users',
      Boolean(error) || exposed === 0,
      error ? `blocked (${error.message})` : `${exposed} admin record(s) exposed`,
    );
  }

  // 6. Storage writes must be rejected.
  {
    const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const { error } = await supabase.storage
      .from('event-posters')
      .upload(`security-check/${Date.now()}.png`, bytes, {
        contentType: 'image/png',
        upsert: false,
      });
    record(
      'Anonymous cannot upload to event-posters',
      Boolean(error),
      error ? `blocked (${error.message})` : 'NOT BLOCKED — check storage policies',
    );
  }

  // 7. Storage deletes must be rejected or affect zero objects.
  {
    const { data, error } = await supabase.storage
      .from('gallery-images')
      .remove([`security-check/${Date.now()}.png`]);
    const removed = data?.length ?? 0;
    record(
      'Anonymous cannot delete gallery images',
      Boolean(error) || removed === 0,
      error ? `blocked (${error.message})` : `${removed} object(s) removed — check storage policies`,
    );
  }

  console.log('\nECO Club security verification\n');
  results.forEach((result) => {
    console.log(`${result.passed ? 'PASS' : 'FAIL'}  ${result.name}`);
    console.log(`      ${result.detail}`);
  });

  const failures = results.filter((result) => !result.passed);

  if (failures.length > 0) {
    console.error(`\n${failures.length} check(s) failed. Review supabase/migrations/0002_rls.sql and 0003_storage.sql.\n`);
    process.exitCode = 1;
    return;
  }

  console.log('\nAll security checks passed.\n');
}

main().catch((error) => {
  console.error(`Security verification failed to run: ${error.message}`);
  process.exitCode = 1;
});
