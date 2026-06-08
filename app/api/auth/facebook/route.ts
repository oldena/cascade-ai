import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createOAuthState } from '@/lib/oauth-helpers'

export async function GET() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const state = await createOAuthState(userId, 'facebook')
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
    state,
    scope: 'pages_manage_posts,pages_read_engagement,public_profile',
    response_type: 'code',
  })
  redirect(`https://www.facebook.com/v20.0/dialog/oauth?${params}`)
}
