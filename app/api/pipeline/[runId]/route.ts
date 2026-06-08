import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADERS })
  }

  const { runId } = await params

  const { data: run } = await supabaseAdmin
    .from('pipeline_runs')
    .select('id')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()

  if (!run) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: JSON_HEADERS })
  }

  await supabaseAdmin.from('pipeline_steps').delete().eq('run_id', runId)
  await supabaseAdmin.from('pipeline_runs').delete().eq('id', runId)

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: JSON_HEADERS })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { runId } = await params

  if (!runId) {
    return new Response(JSON.stringify({ error: 'runId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch run and verify ownership
  const { data: run, error: runError } = await supabaseAdmin
    .from('pipeline_runs')
    .select('*')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()

  if (runError || !run) {
    return new Response(JSON.stringify({ error: 'Pipeline run not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch all steps for this run ordered by step_order
  const { data: steps, error: stepsError } = await supabaseAdmin
    .from('pipeline_steps')
    .select('*')
    .eq('run_id', runId)
    .order('step_order', { ascending: true })

  if (stepsError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch pipeline steps' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ run, steps: steps ?? [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
