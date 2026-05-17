import 'server-only'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase-admin'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const PIPELINE_STEPS = [
  { slug: 'noam', name: 'Noam', label: 'CEO Agent', order: 0 },
  { slug: 'antoine', name: 'Antoine', label: 'Brand Strategist', order: 1 },
  { slug: 'social-strategist', name: 'Sophie', label: 'Social Strategist', order: 2 },
  { slug: 'lea', name: 'Léa', label: 'Copywriter', order: 3 },
  { slug: 'mia', name: 'Mia', label: 'Creative Designer', order: 4 },
  { slug: 'platform-specialist', name: 'Alex', label: 'Platform Specialists', order: 5 },
  { slug: 'publisher-agent', name: 'Pablo', label: 'Publisher', order: 6 },
  { slug: 'leo', name: 'Léo', label: 'Social Analyst', order: 7 },
  { slug: 'optimizer', name: 'Eva', label: 'Optimization Loop', order: 8 },
]

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: { brief: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { brief } = body
  if (!brief?.trim()) {
    return new Response(JSON.stringify({ error: 'brief is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verify user exists
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch all agent system prompts in one query
  const { data: agents, error: agentsError } = await supabaseAdmin
    .from('agents')
    .select('slug, system_prompt')
    .in('slug', PIPELINE_STEPS.map((s) => s.slug))

  if (agentsError || !agents) {
    return new Response(JSON.stringify({ error: 'Failed to load agents' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const agentPromptMap = new Map(agents.map((a) => [a.slug, a.system_prompt]))

  // Create pipeline_run row
  const { data: run, error: runError } = await supabaseAdmin
    .from('pipeline_runs')
    .insert({ user_id: userId, brief, status: 'running' })
    .select('id')
    .single()

  if (runError || !run) {
    return new Response(JSON.stringify({ error: 'Failed to create pipeline run' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const runId = run.id

  // Create all 9 pipeline_steps rows (all pending)
  const stepsToInsert = PIPELINE_STEPS.map((step) => ({
    run_id: runId,
    agent_slug: step.slug,
    agent_name: step.name,
    step_order: step.order,
    status: 'pending',
    output: '',
  }))

  const { error: stepsError } = await supabaseAdmin
    .from('pipeline_steps')
    .insert(stepsToInsert)

  if (stepsError) {
    await supabaseAdmin
      .from('pipeline_runs')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', runId)
    return new Response(JSON.stringify({ error: 'Failed to create pipeline steps' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Stream SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        const accumulatedOutputs: Array<{ label: string; name: string; output: string }> = []

        for (const step of PIPELINE_STEPS) {
          const systemPrompt =
            agentPromptMap.get(step.slug) ?? `You are ${step.name}, a specialist AI agent.`

          // Update step status to running
          await supabaseAdmin
            .from('pipeline_steps')
            .update({ status: 'running', updated_at: new Date().toISOString() })
            .eq('run_id', runId)
            .eq('step_order', step.order)

          send({ type: 'step_start', stepOrder: step.order, agentSlug: step.slug, agentName: step.name })

          // Build context from previous steps
          let contextBlock = ''
          if (accumulatedOutputs.length > 0) {
            contextBlock = "\n\n---\nPrevious agents' outputs:\n\n"
            for (const prev of accumulatedOutputs) {
              contextBlock += `=== ${prev.label} (${prev.name}) ===\n${prev.output}\n\n`
            }
          }

          const userMessage = `Original brief:\n${brief}${contextBlock}`

          let fullOutput = ''

          const response = await anthropic.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [{ role: 'user', content: userMessage }],
          })

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              fullOutput += text
              send({ type: 'chunk', stepOrder: step.order, text })
            }
          }

          // Update step: done + output
          await supabaseAdmin
            .from('pipeline_steps')
            .update({
              status: 'done',
              output: fullOutput,
              updated_at: new Date().toISOString(),
            })
            .eq('run_id', runId)
            .eq('step_order', step.order)

          send({ type: 'step_done', stepOrder: step.order, output: fullOutput })

          accumulatedOutputs.push({ label: step.label, name: step.name, output: fullOutput })
        }

        // Mark run as done
        await supabaseAdmin
          .from('pipeline_runs')
          .update({ status: 'done', updated_at: new Date().toISOString() })
          .eq('id', runId)

        send({ type: 'pipeline_done', runId })
        controller.close()
      } catch (err) {
        console.error('[pipeline] streaming error:', err)

        await supabaseAdmin
          .from('pipeline_runs')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', runId)

        send({ type: 'error', message: 'Pipeline execution failed' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
