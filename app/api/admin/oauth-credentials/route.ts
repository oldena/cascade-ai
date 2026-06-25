import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'tiktok', 'twitter'] as const

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('platform_oauth_credentials')
    .select('platform, client_id, client_secret')
    .in('platform', PLATFORMS)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result: Record<string, { client_id: string; client_secret: string }> = {}
  for (const row of data ?? []) {
    result[row.platform] = { client_id: row.client_id, client_secret: row.client_secret }
  }
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { platform, client_id, client_secret } = body

  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('platform_oauth_credentials')
    .upsert({ platform, client_id: client_id.trim(), client_secret: client_secret.trim(), updated_at: new Date().toISOString() }, { onConflict: 'platform' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
