import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { buildOAuthState } from '@/lib/oauth-helpers'
import crypto from 'crypto'

export async function GET() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Twitter OAuth 2.0 PKCE
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const state = buildOAuthState(userId)

  // Store codeVerifier in state (MVP approach — use Redis/KV in production)
  const fullState = Buffer.from(JSON.stringify({ userId, codeVerifier, nonce: state })).toString('base64url')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    scope: 'tweet.read tweet.write users.read offline.access',
    state: fullState,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  redirect(`https://twitter.com/i/oauth2/authorize?${params}`)
}
