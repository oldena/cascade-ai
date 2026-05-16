import 'server-only'
import { NextResponse } from 'next/server'
import { upsertSocialAccount } from '@/lib/oauth-helpers'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const error = url.searchParams.get('error_code')

  if (error || !code || !stateParam) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=tiktok_denied`)
  }

  let userId: string, codeVerifier: string
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8')) as {
      userId?: string
      codeVerifier?: string
    }
    if (!decoded.userId || !decoded.codeVerifier) throw new Error('missing')
    userId = decoded.userId
    codeVerifier = decoded.codeVerifier
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=invalid_state`)
  }

  // Exchange code
  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=tiktok_token`)
  }
  const tokenData = await tokenRes.json() as {
    data?: {
      access_token?: string
      refresh_token?: string
      expires_in?: number
    }
    access_token?: string
    refresh_token?: string
    expires_in?: number
  }

  const accessToken = tokenData.data?.access_token ?? tokenData.access_token ?? ''

  // Fetch user info
  const userRes = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const userData = await userRes.json() as {
    data?: {
      user?: {
        open_id?: string
        display_name?: string
        avatar_url?: string
      }
    }
  }
  const tUser = userData.data?.user ?? {}

  await upsertSocialAccount(userId, 'tiktok', {
    access_token: accessToken,
    refresh_token: tokenData.data?.refresh_token ?? tokenData.refresh_token,
    expires_in: tokenData.data?.expires_in ?? tokenData.expires_in,
    platform_user_id: tUser.open_id ?? userId,
    display_name: tUser.display_name ?? 'TikTok User',
    avatar_url: tUser.avatar_url ?? '',
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=tiktok`)
}
