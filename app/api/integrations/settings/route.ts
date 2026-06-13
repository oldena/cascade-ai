import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('user_integrations')
    .select('metricool_token, metricool_username, meta_access_token, meta_ad_account_id')
    .eq('user_id', userId)
    .single()

  if (!data) return Response.json({ metricool_token: '', metricool_username: '', meta_access_token: '', meta_ad_account_id: '' })

  return Response.json({
    metricool_token: data.metricool_token ? '••••••••' : '',
    metricool_username: data.metricool_username ?? '',
    meta_access_token: data.meta_access_token ? '••••••••' : '',
    meta_ad_account_id: data.meta_ad_account_id ?? '',
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const fields: Record<string, string> = {}
  for (const key of ['metricool_token', 'metricool_username', 'meta_access_token', 'meta_ad_account_id'] as const) {
    if (typeof body[key] === 'string' && body[key].trim() !== '' && body[key] !== '••••••••') {
      fields[key] = body[key].trim()
    }
  }

  await supabaseAdmin
    .from('user_integrations')
    .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

  return Response.json({ ok: true })
}
