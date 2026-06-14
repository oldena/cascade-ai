import 'server-only'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Platform = 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'twitter'

const ENV_FALLBACKS: Record<Platform, { clientId: string; clientSecret: string }> = {
  facebook:  { clientId: process.env.FACEBOOK_APP_ID ?? '',    clientSecret: process.env.FACEBOOK_APP_SECRET ?? '' },
  instagram: { clientId: process.env.INSTAGRAM_APP_ID ?? '',   clientSecret: process.env.INSTAGRAM_APP_SECRET ?? '' },
  linkedin:  { clientId: process.env.LINKEDIN_CLIENT_ID ?? '', clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? '' },
  tiktok:    { clientId: process.env.TIKTOK_CLIENT_KEY ?? '',  clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? '' },
  twitter:   { clientId: process.env.TWITTER_CLIENT_ID ?? '',  clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '' },
}

export async function getOAuthCreds(platform: Platform): Promise<{ clientId: string; clientSecret: string }> {
  const { data } = await supabaseAdmin
    .from('platform_oauth_credentials')
    .select('client_id, client_secret')
    .eq('platform', platform)
    .single()

  const dbClientId = data?.client_id?.trim() ?? ''
  const dbClientSecret = data?.client_secret?.trim() ?? ''
  const fallback = ENV_FALLBACKS[platform]

  return {
    clientId: dbClientId || fallback.clientId,
    clientSecret: dbClientSecret || fallback.clientSecret,
  }
}
