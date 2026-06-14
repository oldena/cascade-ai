export const dynamic = 'force-dynamic'

import { validateApiKey } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const apiUser = await validateApiKey(request.headers.get('authorization'))
  if (!apiUser) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })

  const body = await request.json() as { brief?: string; language?: string }
  const { brief, language = 'fr' } = body

  if (!brief || brief.trim().length < 10) {
    return Response.json({ error: 'brief must be at least 10 characters' }, { status: 400 })
  }

  const { data: run, error } = await supabaseAdmin
    .from('pipeline_runs')
    .insert({
      user_id: apiUser.userId,
      brief: brief.trim(),
      language,
      status: 'pending',
    })
    .select('id, status, created_at')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return Response.json({
    run_id: run.id,
    status: run.status,
    created_at: run.created_at,
    poll_url: `${appUrl}/api/public/v1/runs/${run.id}`,
  }, { status: 201 })
}
