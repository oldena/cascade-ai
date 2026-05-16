import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { buildOAuthState } from '@/lib/oauth-helpers'
import crypto from 'crypto'

export async function GET() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const state = buildOAuthState(userId)
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const fullState = Buffer.from(JSON.stringify({ userId, codeVerifier })).toString('base64url')

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`,
    response_type: 'code',
    scope: 'user.info.basic,video.upload,video.publish',
    state: fullState,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  redirect(`https://www.tiktok.com/v2/auth/authorize?${params}`)
}
