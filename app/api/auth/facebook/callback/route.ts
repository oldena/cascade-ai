import 'server-only'
import { NextResponse } from 'next/server'
import { validateOAuthState, upsertSocialAccount } from '@/lib/oauth-helpers'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=facebook_denied`)
  }

  const stateData = await validateOAuthState(state, 'facebook')
  if (!stateData) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=invalid_state`)
  const { userId } = stateData

  // Exchange code for token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v20.0/oauth/access_token?` +
    new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
      code,
    })
  )

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=facebook_token`)
  }

  const tokenData = await tokenRes.json() as { access_token: string; expires_in?: number }
  const accessToken = tokenData.access_token

  // Fetch user profile
  const profileRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,picture.type(large)&access_token=${accessToken}`
  )
  if (!profileRes.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=facebook_profile`)
  }

  const profile = await profileRes.json() as {
    id: string
    name?: string
    picture?: { data?: { url?: string } }
  }

  await upsertSocialAccount(userId, 'facebook', {
    access_token: accessToken,
    expires_in: tokenData.expires_in,
    platform_user_id: profile.id,
    display_name: profile.name ?? 'Facebook User',
    avatar_url: profile.picture?.data?.url ?? '',
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=facebook`)
}
