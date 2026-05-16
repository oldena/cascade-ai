import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createOAuthState } from '@/lib/oauth-helpers'
import { randomBytes, createHash } from 'crypto'

export async function GET() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')
  const state = await createOAuthState(userId, 'tiktok', codeVerifier)

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`,
    response_type: 'code',
    scope: 'user.info.basic,video.upload,video.publish',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  redirect(`https://www.tiktok.com/v2/auth/authorize?${params}`)
}
