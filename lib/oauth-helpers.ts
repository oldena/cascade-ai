import 'server-only'
import { encrypt } from '@/lib/token-encryption'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { Platform } from '@/types'

export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
  platform_user_id: string
  display_name: string
  avatar_url: string
  page_id?: string
}

export async function upsertSocialAccount(
  userId: string,
  platform: Platform,
  tokens: OAuthTokens
): Promise<void> {
  const encryptedAccess = await encrypt(tokens.access_token)
  const encryptedRefresh = tokens.refresh_token ? await encrypt(tokens.refresh_token) : null
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null

  await supabaseAdmin.from('social_accounts').upsert({
    user_id: userId,
    platform,
    platform_user_id: tokens.platform_user_id,
    display_name: tokens.display_name,
    avatar_url: tokens.avatar_url,
    access_token: encryptedAccess,
    refresh_token: encryptedRefresh,
    token_expires_at: expiresAt,
    page_id: tokens.page_id ?? null,
    connected_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,platform,platform_user_id',
  })
}

export function buildOAuthState(userId: string): string {
  // Simple state: base64(userId + ':' + randomNonce)
  const nonce = Math.random().toString(36).slice(2)
  return Buffer.from(`${userId}:${nonce}`).toString('base64url')
}

export function parseOAuthState(state: string): { userId: string } | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf8')
    const [userId] = decoded.split(':')
    if (!userId) return null
    return { userId }
  } catch {
    return null
  }
}
