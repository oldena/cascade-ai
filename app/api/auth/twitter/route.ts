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
  // Store verifier in cookie via state
  const state = await createOAuthState(userId, 'twitter', codeVerifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  redirect(`https://twitter.com/i/oauth2/authorize?${params}`)
}
