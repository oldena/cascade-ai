import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { runId: string; stepOrder: number; feedback: 'up' | 'down' | null }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { runId, stepOrder, feedback } = body
  if (!runId || stepOrder == null) return Response.json({ error: 'runId and stepOrder required' }, { status: 400 })
  if (feedback !== 'up' && feedback !== 'down' && feedback !== null) {
    return Response.json({ error: 'feedback must be up, down, or null' }, { status: 400 })
  }

  // Verify ownership
  const { data: run } = await supabaseAdmin
    .from('pipeline_runs')
    .select('id')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()

  if (!run) return Response.json({ error: 'Run not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('pipeline_steps')
    .update({ feedback, updated_at: new Date().toISOString() })
    .eq('run_id', runId)
    .eq('step_order', stepOrder)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
