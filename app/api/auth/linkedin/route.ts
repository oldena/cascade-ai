import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { buildOAuthState } from '@/lib/oauth-helpers'

export async function GET() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const state = buildOAuthState(userId)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`,
    state,
    scope: 'r_liteprofile w_member_social r_organization_social w_organization_social',
  })
  redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`)
}
