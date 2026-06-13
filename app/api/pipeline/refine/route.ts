import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { runId: string; agentSlug: string; stepOrder: number; instruction: string; language?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { runId, agentSlug, stepOrder, instruction, language } = body
  if (!runId || !agentSlug || stepOrder == null || !instruction?.trim()) {
    return Response.json({ error: 'runId, agentSlug, stepOrder and instruction required' }, { status: 400 })
  }

  // Verify ownership
  const { data: run } = await supabaseAdmin
    .from('pipeline_runs')
    .select('brief')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()
  if (!run) return Response.json({ error: 'Run not found' }, { status: 404 })

  // Fetch original step output + agent prompt in parallel
  const [stepRes, agentRes] = await Promise.all([
    supabaseAdmin.from('pipeline_steps').select('output').eq('run_id', runId).eq('step_order', stepOrder).single(),
    supabaseAdmin.from('agents').select('system_prompt').eq('slug', agentSlug).single(),
  ])

  const originalOutput = stepRes.data?.output ?? ''
  const basePrompt = agentRes.data?.system_prompt ?? `You are a specialist AI marketing agent.`

  const systemPrompt = `${basePrompt}

IMPORTANT: You MUST respond entirely in ${language ?? 'French (français)'}. Do not use any other language.

You are in REFINEMENT MODE. The user has reviewed your previous output and wants specific changes.
Produce an improved version based on the refinement instruction.

RULES:
- Output only the refined content — no preamble like "Here is the refined version"
- Keep the same structure (## headers, bullet points) as the original
- Apply the user instruction precisely and completely
- Minimum 400 words
- Preserve brand name and any product image suggestions`

  const userMessage = `Original brief:\n${run.brief}

Your previous output:
${originalOutput}

Refinement instruction: ${instruction}

Produce the refined version now.`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 40_000)

  let mistralRes: Response
  try {
    mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
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
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }

  if (!mistralRes.ok) {
    clearTimeout(timeout)
    const errText = await mistralRes.text().catch(() => mistralRes.status.toString())
    return Response.json({ error: `Mistral ${mistralRes.status}: ${errText}` }, { status: 500 })
  }

  const encoder = new TextEncoder()

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
              if (content) ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
            } catch { /* malformed */ }
          }
        }
        ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
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
