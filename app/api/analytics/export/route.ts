import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const [{ data: runs = [] }, { data: steps = [] }, { data: clients = [] }] = await Promise.all([
    supabaseAdmin
      .from('pipeline_runs')
      .select('id, pipeline_type, status, brief, created_at, updated_at, client_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('pipeline_steps')
      .select('run_id, agent_slug, status, step_order, created_at, updated_at')
      .in('run_id', (await supabaseAdmin.from('pipeline_runs').select('id').eq('user_id', userId)).data?.map(r => r.id) ?? []),
    supabaseAdmin
      .from('client_profiles')
      .select('id, name')
      .eq('user_id', userId),
  ])

  const clientMap = new Map((clients ?? []).map((c: { id: string; name: string }) => [c.id, c.name]))

  // Build step duration map: key = run_id|step_order → duration ms
  const durationMap = new Map<string, number>()
  for (const s of steps ?? []) {
    if (s.created_at && s.updated_at) {
      const ms = new Date(s.updated_at).getTime() - new Date(s.created_at).getTime()
      durationMap.set(`${s.run_id}|${s.step_order}`, ms)
    }
  }

  const csvRows: string[] = [
    'run_id,pipeline_type,status,client,brief_excerpt,created_at,duration_ms',
  ]

  for (const run of runs ?? []) {
    const clientName = run.client_id ? (clientMap.get(run.client_id) ?? '') : ''
    const brief = (run.brief ?? '').replace(/"/g, '""').slice(0, 120)
    const createdMs = new Date(run.created_at).getTime()
    const runSteps = (steps ?? []).filter((s: { run_id: string }) => s.run_id === run.id)
    const totalDuration = runSteps.reduce((acc: number, s: { run_id: string; step_order: number }) => {
      return acc + (durationMap.get(`${s.run_id}|${s.step_order}`) ?? 0)
    }, 0)

    csvRows.push(`"${run.id}","${run.pipeline_type ?? ''}","${run.status}","${clientName}","${brief}","${new Date(createdMs).toISOString()}",${totalDuration}`)
  }

  const csv = csvRows.join('\n')
  const filename = `cascade-analytics-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
