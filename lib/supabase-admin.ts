import 'server-only'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<any> {
  _client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  return _client
}

// Backward-compatible named export — resolved lazily via Proxy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: SupabaseClient<any> = new Proxy(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as SupabaseClient<any>,
  {
    get(_target, prop) {
      return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop]
    },
  }
)
