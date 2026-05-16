import 'server-only'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from '@/lib/token-encryption'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { randomBytes } from 'crypto'
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
  }, { onConflict: 'user_id,platform,platform_user_id' })
}

const OAUTH_COOKIE = 'oauth_state'

interface OAuthStateData {
  userId: string
  nonce: string
  codeVerifier?: string
  platform: Platform
}

/**
 * Stores OAuth state + optional PKCE verifier in an encrypted HttpOnly cookie.
 * Returns the state string (nonce) to include in the OAuth redirect URL.
 */
export async function createOAuthState(userId: string, platform: Platform, codeVerifier?: string): Promise<string> {
  const nonce = randomBytes(16).toString('hex')
  const stateData: OAuthStateData = { userId, nonce, platform, codeVerifier }
  const cookieStore = await cookies()
  const cookieValue = await encrypt(JSON.stringify(stateData))
  cookieStore.set(OAUTH_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })
  // Return only the nonce as the state param (used for correlation)
  return nonce
}

/**
 * Validates the callback state param against the cookie.
 * Returns OAuthStateData if valid, null otherwise.
 * Deletes the cookie after validation (one-time use).
 */
export async function validateOAuthState(stateParam: string, expectedPlatform: Platform): Promise<OAuthStateData | null> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(OAUTH_COOKIE)?.value
  if (!cookieValue) return null

  // Delete cookie immediately (one-time use)
  cookieStore.delete(OAUTH_COOKIE)

  let stateData: OAuthStateData
  try {
    const decrypted = await decrypt(cookieValue)
    stateData = JSON.parse(decrypted)
  } catch {
    return null
  }

  // Verify nonce matches + platform matches
  if (stateData.nonce !== stateParam) return null
  if (stateData.platform !== expectedPlatform) return null
  if (!stateData.userId) return null

  return stateData
}
