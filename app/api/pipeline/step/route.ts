import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { fireOutboundWebhooks } from '@/lib/outbound-webhooks'
import { getPipelineSteps, PIPELINE_DEFINITIONS } from '@/lib/pipeline-definitions'
import { notifyPipelineComplete } from '@/lib/notify-pipeline'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { runId: string; stepOrder: number; language?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { runId, stepOrder, language } = body
  if (!runId || stepOrder == null) {
    return Response.json({ error: 'runId and stepOrder required' }, { status: 400 })
  }

  // Verify ownership + fetch brief + pipeline type + optional client
  const { data: run } = await supabaseAdmin
    .from('pipeline_runs')
    .select('brief, pipeline_type, client_id')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()

  if (!run) {
    return Response.json({ error: 'Run not found' }, { status: 404 })
  }

  const PIPELINE_STEPS = getPipelineSteps(run.pipeline_type ?? 'marketing-general')
  const step = PIPELINE_STEPS.find((s) => s.order === stepOrder)
  if (!step) {
    return Response.json({ error: `Unknown stepOrder: ${stepOrder}` }, { status: 400 })
  }

  // Fetch agent system prompt + company context (client takes priority over global)
  const clientId = (run as { client_id?: string | null }).client_id
  const [{ data: agent }, { data: companyRow }, { data: clientRow }] = await Promise.all([
    supabaseAdmin.from('agents').select('system_prompt').eq('slug', step.slug).single(),
    supabaseAdmin.from('user_integrations').select('company_context').eq('user_id', userId).single(),
    clientId
      ? supabaseAdmin.from('clients').select('company_context').eq('id', clientId).single()
      : Promise.resolve({ data: null }),
  ])

  const companyCtx =
    (clientRow as { company_context?: string | null } | null)?.company_context ||
    (companyRow as { company_context?: string | null } | null)?.company_context
  const basePrompt = agent?.system_prompt ?? `You are ${step.name}, a specialist AI agent.`
  const companyBlock = companyCtx ? `\n\nCONTEXTE CLIENT:\n${companyCtx}\n` : ''
  const systemPrompt = `${basePrompt}${companyBlock}

IMPORTANT: You MUST respond entirely in ${language ?? 'French (français)'}. Do not use any other language under any circumstances.

OUTPUT REQUIREMENTS (mandatory for every response):
- Provide detailed, advanced, professional-grade analysis (minimum 500-700 words)
- Always prominently feature the brand name in your headings and throughout the response
- Include at least 2 relevant product/brand image suggestions using this exact markdown format:
  ![Brand Product - Description](https://images.unsplash.com/photo-[relevant-query]?w=800&h=600&fit=crop)
  Use descriptive Unsplash photo IDs that match the product/brand category
- Structure your response with clear ## headers and bullet points
- Be specific, actionable, and comprehensive — never generic
- Include concrete examples, metrics, or strategies relevant to the brand
- End with a clear "## Next Steps" section with 3-5 prioritized actions`

  // Fetch last 2 completed steps for context
  const { data: prevSteps } = await supabaseAdmin
    .from('pipeline_steps')
    .select('agent_slug, output, step_order')
    .eq('run_id', runId)
    .eq('status', 'done')
    .order('step_order', { ascending: true })

  let contextBlock = ''
  if (prevSteps && prevSteps.length > 0) {
    const recent = prevSteps.slice(-2)
    contextBlock = "\n\n---\nPrevious agents' outputs:\n\n"
    for (const prev of recent) {
      const cfg = PIPELINE_STEPS.find((s) => s.slug === prev.agent_slug)
      const truncated = (prev.output ?? '').length > 300
        ? prev.output.slice(0, 300) + '…'
        : (prev.output ?? '')
      contextBlock += `=== ${cfg?.label ?? prev.agent_slug} (${cfg?.name ?? ''}) ===\n${truncated}\n\n`
    }
  }

  const userMessage = `Original brief:\n${run.brief}${contextBlock}`

  // Mark step running
  await supabaseAdmin
    .from('pipeline_steps')
    .update({ status: 'running', updated_at: new Date().toISOString() })
    .eq('run_id', runId)
    .eq('step_order', stepOrder)

  // Call Mistral with streaming (40s timeout)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 40_000)

  let mistralRes: Response
  try {
    mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        max_tokens: 1500,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeout)
    const msg = err instanceof Error ? err.message : String(err)
    await supabaseAdmin.from('pipeline_steps').update({ status: 'failed', output: msg, updated_at: new Date().toISOString() }).eq('run_id', runId).eq('step_order', stepOrder)
    await supabaseAdmin.from('pipeline_runs').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', runId)
    return Response.json({ error: msg }, { status: 500 })
  }

  if (!mistralRes.ok) {
    clearTimeout(timeout)
    const errText = await mistralRes.text().catch(() => mistralRes.status.toString())
    const msg = `Mistral ${mistralRes.status}: ${errText}`
    await supabaseAdmin.from('pipeline_steps').update({ status: 'failed', output: msg, updated_at: new Date().toISOString() }).eq('run_id', runId).eq('step_order', stepOrder)
    await supabaseAdmin.from('pipeline_runs').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', runId)
    return Response.json({ error: msg }, { status: 500 })
  }

  const encoder = new TextEncoder()
  let fullOutput = ''

  const stream = new ReadableStream({
    async start(ctrl) {
      const reader = mistralRes.body!.getReader()
      const decoder = new TextDecoder()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          for (const line of chunk.split('\n')) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data: ')) continue
            const data = trimmed.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> }
              const content = parsed.choices?.[0]?.delta?.content ?? ''
              if (content) {
                fullOutput += content
                ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
            } catch { /* malformed SSE line */ }
          }
        }

        await supabaseAdmin.from('pipeline_steps').update({ status: 'done', output: fullOutput, updated_at: new Date().toISOString() }).eq('run_id', runId).eq('step_order', stepOrder)
        const isLast = stepOrder === PIPELINE_STEPS.length - 1
        if (isLast) {
          await supabaseAdmin.from('pipeline_runs').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', runId)
          const pipelineName = PIPELINE_DEFINITIONS[run.pipeline_type ?? 'marketing-general']?.name ?? run.pipeline_type ?? 'Pipeline'
          notifyPipelineComplete(userId, pipelineName, runId).catch(console.error)
          fireOutboundWebhooks(userId, 'pipeline.completed', {
            run_id: runId,
            user_id: userId,
            status: 'done',
            created_at: new Date().toISOString(),
          }).catch(console.error)
        }
        ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, isLast })}\n\n`))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        await supabaseAdmin.from('pipeline_steps').update({ status: 'failed', output: msg, updated_at: new Date().toISOString() }).eq('run_id', runId).eq('step_order', stepOrder)
        await supabaseAdmin.from('pipeline_runs').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', runId)
        ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
      } finally {
        clearTimeout(timeout)
        ctrl.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
