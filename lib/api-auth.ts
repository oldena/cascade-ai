import 'server-only'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface ApiKeyUser {
  userId: string
  keyId: string
}

export async function validateApiKey(
  authHeader: string | null
): Promise<ApiKeyUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null

  const rawKey = authHeader.slice(7)
  if (!rawKey.startsWith('csk_')) return null

  const keyHash = createHash('sha256').update(rawKey).digest('hex')

  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, revoked_at')
    .eq('key_hash', keyHash)
    .single()

  if (!data || data.revoked_at) return null

  // Update last_used_at in background (don't await)
  supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => {})

  return { userId: data.user_id, keyId: data.id }
}
