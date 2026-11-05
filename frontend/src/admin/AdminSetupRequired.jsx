const envVars = `VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-or-publishable-key>`;

export default function AdminSetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-5 py-12">
      <div className="w-full max-w-2xl rounded-3xl border border-[#ECECEC] bg-white p-7 shadow-soft sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#eef7ea] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#3F7A3A]">
          Setup required
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#222]">
          Connect the content database
        </h1>
        <p className="mt-3 leading-7 text-muted">
          The public website is still working from its bundled content. To enable the
          admin dashboard, connect Supabase and run the migrations.
        </p>

        <ol className="mt-7 space-y-4 text-sm leading-6 text-[#334b3b]">
          <li>
            <span className="font-semibold">1. Create a Supabase project</span> and run
            <code className="mx-1 rounded bg-[#f3f6f2] px-1.5 py-0.5">0001_schema.sql</code>,
            <code className="mx-1 rounded bg-[#f3f6f2] px-1.5 py-0.5">0002_rls.sql</code> and
            <code className="mx-1 rounded bg-[#f3f6f2] px-1.5 py-0.5">0003_storage.sql</code>
            from <code className="rounded bg-[#f3f6f2] px-1.5 py-0.5">supabase/migrations/</code>.
          </li>
          <li>
            <span className="font-semibold">2. Create the frontend environment file</span> in
            <code className="mx-1 rounded bg-[#f3f6f2] px-1.5 py-0.5">frontend/.env.local</code>:
            <pre className="mt-2 overflow-x-auto rounded-xl bg-[#10291d] p-4 text-xs leading-6 text-[#d7f0cf]">{envVars}</pre>
          </li>
          <li>
            <span className="font-semibold">3. Provision an administrator</span> with
            <code className="mx-1 rounded bg-[#f3f6f2] px-1.5 py-0.5">scripts/create-admin.mjs</code>
            (see <code className="rounded bg-[#f3f6f2] px-1.5 py-0.5">docs/ADMIN_CMS_SETUP.md</code>).
          </li>
          <li>
            <span className="font-semibold">4. Restart the dev server</span> or add the same
            variables in Vercel, then open <code className="rounded bg-[#f3f6f2] px-1.5 py-0.5">/admin/login</code>.
          </li>
        </ol>
      </div>
    </div>
  );
}
