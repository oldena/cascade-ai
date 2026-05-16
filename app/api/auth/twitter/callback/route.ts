import 'server-only'
import { NextResponse } from 'next/server'
import { upsertSocialAccount } from '@/lib/oauth-helpers'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error || !code || !stateParam) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=twitter_denied`)
  }

  let userId: string, codeVerifier: string
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8')) as {
      userId?: string
      codeVerifier?: string
    }
    if (!decoded.userId || !decoded.codeVerifier) throw new Error('missing fields')
    userId = decoded.userId
    codeVerifier = decoded.codeVerifier
  } catch {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=invalid_state`)
  }

  // Exchange code
  const credentials = Buffer.from(
    `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
  ).toString('base64')
  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=twitter_token`)
  }
  const tokenData = await tokenRes.json() as {
    access_token: string
    refresh_token?: string
    expires_in?: number
  }

  // Fetch user
  const userRes = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name',
    { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
  )
  const userData = await userRes.json() as {
    data?: {
      id: string
      name?: string
      username?: string
      profile_image_url?: string
    }
  }
  const twitterUser = userData.data

  if (!twitterUser) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=twitter_profile`)
  }

  await upsertSocialAccount(userId, 'twitter', {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    platform_user_id: twitterUser.id,
    display_name: twitterUser.name ?? twitterUser.username ?? 'Twitter User',
    avatar_url: twitterUser.profile_image_url ?? '',
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=twitter`)
}
