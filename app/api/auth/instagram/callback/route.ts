import 'server-only'
import { NextResponse } from 'next/server'
import { validateOAuthState, upsertSocialAccount } from '@/lib/oauth-helpers'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=instagram_denied`)
  }

  const stateData = await validateOAuthState(state, 'instagram')
  if (!stateData) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=invalid_state`)
  const { userId } = stateData

  // Exchange code for token
  const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token')
  tokenUrl.searchParams.set('client_id', process.env.INSTAGRAM_APP_ID!)
  tokenUrl.searchParams.set('client_secret', process.env.INSTAGRAM_APP_SECRET!)
  tokenUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`)
  tokenUrl.searchParams.set('code', code)

  const tokenResponse = await fetch(tokenUrl.toString())
  if (!tokenResponse.ok) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=instagram_token`)
  }
  const tokenData = await tokenResponse.json() as {
    access_token: string
    token_type?: string
  }
  const accessToken = tokenData.access_token

  // Get user info
  const meRes = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name,picture`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!meRes.ok) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=instagram_profile`)
  const me = await meRes.json() as {
    id: string
    name?: string
    picture?: { data?: { url?: string } }
  }

  // Get Instagram business account
  const igAccountsRes = await fetch(
    `https://graph.facebook.com/v19.0/${me.id}/accounts?fields=instagram_business_account{id,name,profile_picture_url}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  const igAccounts = await igAccountsRes.json() as {
    data?: Array<{
      instagram_business_account?: {
        id?: string
        name?: string
        profile_picture_url?: string
      }
    }>
  }
  const igAccount = igAccounts.data?.[0]?.instagram_business_account

  await upsertSocialAccount(userId, 'instagram', {
    access_token: accessToken,
    platform_user_id: igAccount?.id ?? me.id,
    display_name: igAccount?.name ?? me.name ?? 'Instagram User',
    avatar_url: igAccount?.profile_picture_url ?? me.picture?.data?.url ?? '',
  })

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?connected=instagram`)
}
