export const dynamic = 'force-dynamic'

import { validateApiKey } from '@/lib/api-auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const apiUser = await validateApiKey(request.headers.get('authorization'))
  if (!apiUser) return Response.json({ error: 'Invalid or missing API key' }, { status: 401 })

  const { id } = await params

  const { data: run, error } = await supabaseAdmin
    .from('pipeline_runs')
    .select('id, brief, status, created_at, updated_at')
    .eq('id', id)
    .eq('user_id', apiUser.userId)
    .single()

  if (error || !run) return Response.json({ error: 'Run not found' }, { status: 404 })

  const { data: steps } = await supabaseAdmin
    .from('pipeline_steps')
    .select('agent_slug, agent_name, step_order, status, output')
    .eq('run_id', id)
    .order('step_order')

  return Response.json({ ...run, steps: steps ?? [] })
}
