import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createOAuthState } from '@/lib/oauth-helpers'

export async function GET() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const state = await createOAuthState(userId, 'instagram')
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
    scope: 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement',
    response_type: 'code',
    state,
  })
  redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`)
}
