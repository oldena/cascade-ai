import 'server-only'
import { supabaseAdmin } from '@/lib/supabase-admin'

// GET /api/pipeline/comments?runId=xxx
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const runId = searchParams.get('runId')
  if (!runId) return Response.json({ error: 'runId required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('pipeline_comments')
    .select('id, step_order, content, author_name, created_at')
    .eq('run_id', runId)
    .order('created_at', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ comments: data ?? [] })
}

// POST /api/pipeline/comments
export async function POST(req: Request) {
  let body: { runId: string; stepOrder?: number | null; content: string; authorName?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { runId, stepOrder, content, authorName } = body
  if (!runId || !content?.trim()) return Response.json({ error: 'runId and content required' }, { status: 400 })

  const { data: run } = await supabaseAdmin.from('pipeline_runs').select('id').eq('id', runId).single()
  if (!run) return Response.json({ error: 'Run not found' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('pipeline_comments')
    .insert({
      run_id: runId,
      step_order: stepOrder ?? null,
      content: content.trim(),
      author_name: (authorName ?? '').trim() || 'Anonyme',
    })
    .select('id, step_order, content, author_name, created_at')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ comment: data }, { status: 201 })
}
