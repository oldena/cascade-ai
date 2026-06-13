import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const METRICOOL_BASE = 'https://app.metricool.com/api/v2'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: creds } = await supabaseAdmin
    .from('user_integrations')
    .select('metricool_token, metricool_username')
    .eq('user_id', userId)
    .single()

  const token = creds?.metricool_token
  const username = creds?.metricool_username
  if (!token || !username) {
    return Response.json({ error: 'Metricool non configuré. Rendez-vous dans Intégrations pour renseigner vos identifiants.' }, { status: 503 })
  }

  let body: { content: string; networks: string[]; scheduledAt: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { content, networks, scheduledAt } = body
  if (!content?.trim() || !networks?.length || !scheduledAt) {
    return Response.json({ error: 'content, networks and scheduledAt required' }, { status: 400 })
  }

  const metricoolRes = await fetch(`${METRICOOL_BASE}/posts?token=${token}&user=${username}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: content,
      networks: networks.map((n) => n.toUpperCase()),
      date: scheduledAt,
      timezone: 'UTC',
      draft: false,
    }),
  })

  if (!metricoolRes.ok) {
    const errText = await metricoolRes.text().catch(() => metricoolRes.status.toString())
    return Response.json({ error: `Metricool ${metricoolRes.status}: ${errText}` }, { status: 500 })
  }

  const data = await metricoolRes.json()
  return Response.json({ success: true, postId: data?.id ?? null })
}
