import 'server-only'
import { NextResponse } from 'next/server'
import { parseOAuthState, upsertSocialAccount } from '@/lib/oauth-helpers'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=linkedin_denied`)
  }

  const parsed = parseOAuthState(state)
  if (!parsed) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=invalid_state`)

  // Exchange code for token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=linkedin_token`)
  }

  const tokenData = await tokenRes.json() as {
    access_token: string
    expires_in?: number
  }
  const accessToken = tokenData.access_token

  // Fetch profile
  const profileRes = await fetch(
    'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const profile = await profileRes.json() as {
    id: string
    localizedFirstName?: string
    localizedLastName?: string
    profilePicture?: {
      'displayImage~'?: {
        elements?: Array<{
          identifiers?: Array<{ identifier?: string }>
        }>
      }
    }
  }
  const displayName = `${profile.localizedFirstName ?? ''} ${profile.localizedLastName ?? ''}`.trim()
  const avatar =
    profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier ?? ''

  await upsertSocialAccount(parsed.userId, 'linkedin', {
    access_token: accessToken,
    expires_in: tokenData.expires_in,
    platform_user_id: profile.id,
    display_name: displayName || 'LinkedIn User',
    avatar_url: avatar,
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=linkedin`)
}
