import { createClient } from '@supabase/supabase-js';
import { envValue, loadEnvFiles, parseArgs, requireEnv } from './env.mjs';

loadEnvFiles();

const { flags, values } = parseArgs();

if (flags.has('--help')) {
  console.log(`
Provision an ECO Club administrator

  node scripts/create-admin.mjs --email=admin@example.com --password="strong-password" --name="Club Admin"

Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local.
The service-role key is used only by this script, never by the website.
`);
  process.exit(0);
}

const email = values.email?.trim().toLowerCase();
const password = values.password || process.env.ADMIN_PASSWORD;
const displayName = values.name?.trim() || 'Club Administrator';
const role = values.role === 'editor' ? 'editor' : 'admin';

if (!email || !password) {
  console.error(`
Usage:
  node scripts/create-admin.mjs --email=admin@example.com --password="strong-password" [--name="Club Admin"]

Passwords must be at least 8 characters. Nothing is written to the repository.
`);
  process.exit(1);
}

if (password.length < 8) {
  console.error('The password must be at least 8 characters.');
  process.exit(1);
}

const url = envValue('SUPABASE_URL', 'VITE_SUPABASE_URL');
const serviceKey = requireEnv(['SUPABASE_SERVICE_ROLE_KEY'], 'service-role key');

if (!url) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) in frontend/.env.local.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserIdByEmail(targetEmail) {
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === targetEmail);
    if (match) return match.id;
    if (data.users.length < 200) return null;

    page += 1;
  }

  return null;
}

async function main() {
  let userId = null;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (createError) {
    if (/already|registered|exists/i.test(createError.message)) {
      console.log('That email already has an auth account; linking it to admin access instead.');
      userId = await findUserIdByEmail(email);
    }

    if (!userId) throw createError;
  } else {
    userId = created.user?.id ?? null;
  }

  if (!userId) throw new Error('Could not determine the auth user id.');

  const { error: upsertError } = await supabase
    .from('admin_users')
    .upsert(
      {
        id: userId,
        display_name: displayName,
        role,
        is_active: true,
      },
      { onConflict: 'id' },
    );

  if (upsertError) throw upsertError;

  console.log(`\nAdministrator ready: ${email} (role: ${role}, active: true)`);
  console.log('Sign in at /admin/login. The password was not stored or logged.\n');
}

main().catch((error) => {
  console.error(`\nCould not provision the administrator: ${error.message}\n`);
  process.exitCode = 1;
});
