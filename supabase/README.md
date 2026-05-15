# Supabase — Cascade Database

## Running the migration

### Option A — Supabase CLI (recommended)

```bash
supabase db push
```

This applies all pending migrations in `supabase/migrations/` to your linked project.

### Option B — Supabase SQL editor

1. Open your Supabase project dashboard.
2. Navigate to **SQL Editor**.
3. Paste the contents of `migrations/001_initial_schema.sql` and click **Run**.

---

## Service role key

Server-side API routes (Next.js route handlers and server actions) use the **service role key** via `lib/supabase-admin.ts`.  
The service role key **bypasses Row Level Security (RLS)** — keep it secret and never expose it to the browser.

Set it in your environment:

```
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

The public anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is used by the client-side Supabase client (`lib/supabase.ts`) and **respects RLS**.

---

## RLS and `app.current_user_id`

All tables have RLS enabled. Policies check the Postgres session variable `app.current_user_id` to scope rows to the authenticated user.

**Before executing any query in server-side code that should respect RLS**, set the variable in the same transaction:

```sql
set local app.current_user_id = '<clerk_user_id>';
```

In TypeScript (using the admin client when you need to act as a specific user but still scope data):

```ts
await supabaseAdmin.rpc('set_config', {
  setting: 'app.current_user_id',
  value: userId,
  is_local: true,
});
```

> Note: `supabaseAdmin` bypasses RLS entirely. The `app.current_user_id` variable only matters for queries made through the anon-key client where RLS is enforced.

---

## Token encryption

OAuth tokens stored in `social_accounts.access_token` and `social_accounts.refresh_token` are **AES-256 encrypted at the application layer** before being written to the database. Encryption and decryption are handled in `lib/token-encryption.ts`.
