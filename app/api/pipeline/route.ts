import 'server-only'
import { after } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'


const PIPELINE_STEPS = [
  // CEO
  { slug: 'noam',               name: 'Oumara',  label: 'CEO Agent',          order: 0  },
  // Strategy Division
  { slug: 'market-researcher',  name: 'Lucas',   label: 'Market Researcher',  order: 1  },
  { slug: 'antoine',            name: 'Antoine', label: 'Brand Strategist',   order: 2  },
  { slug: 'offer-strategist',   name: 'Marco',   label: 'Offer Strategist',   order: 3  },
  { slug: 'funnel-architect',   name: 'Diana',   label: 'Funnel Architect',   order: 4  },
  // Content Division
  { slug: 'social-strategist',  name: 'Sophie',  label: 'Social Strategist',  order: 5  },
  { slug: 'lea',                name: 'Léa',     label: 'Senior Copywriter',  order: 6  },
  { slug: 'mia',                name: 'Mia',     label: 'Creative Director',  order: 7  },
  { slug: 'video-scriptwriter', name: 'Camille', label: 'Video Scriptwriter', order: 8  },
  { slug: 'ugc-creator',        name: 'Jade',    label: 'UGC Creator',        order: 9  },
  { slug: 'youtube-strategist', name: 'Sam',     label: 'YouTube Strategist', order: 10 },
  // Acquisition Division
  { slug: 'ads-manager',        name: 'Max',     label: 'Ads Manager',        order: 11 },
  { slug: 'seo-specialist',     name: 'Lena',    label: 'SEO Specialist',     order: 12 },
  { slug: 'lead-gen',           name: 'Nina',    label: 'Lead Generation',    order: 13 },
  { slug: 'cold-outreach',      name: 'Victor',  label: 'Cold Outreach',      order: 14 },
  // Sales Division
  { slug: 'closer',             name: 'Rafael',  label: 'Sales Closer',       order: 15 },
  { slug: 'crm-manager',        name: 'Emma',    label: 'CRM Manager',        order: 16 },
  { slug: 'customer-success',   name: 'Zoé',     label: 'Customer Success',   order: 17 },
]

export async function POST(req: Request) {
  if (!process.env.MISTRAL_API_KEY) {
    return new Response(JSON.stringify({ error: 'MISTRAL_API_KEY manquant dans .env.local — redémarrez le serveur.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Quick key validation — fail fast before creating any DB rows
  {
    const testRes = await fetch('https://api.mistral.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}` },
    }).catch(() => null)
    if (!testRes || !testRes.ok) {
      const status = testRes?.status ?? 'unreachable'
      return new Response(JSON.stringify({ error: `MISTRAL_API_KEY invalide ou Mistral inaccessible (${status}). Vérifiez la clé.` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

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

  // Fetch all agent system prompts
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

  // Create all pipeline_steps rows (all pending)
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

  // ---------------------------------------------------------------------------
  // Background pipeline — runs after response is sent via next/server after()
  // ---------------------------------------------------------------------------
  after(async () => {
    try {
      const accumulatedOutputs: Array<{ label: string; name: string; output: string }> = []

      for (const step of PIPELINE_STEPS) {
        const basePrompt =
          agentPromptMap.get(step.slug) ?? `You are ${step.name}, a specialist AI agent.`
        const systemPrompt = `${basePrompt}\n\nIMPORTANT: Detect the language of the user's brief and respond entirely in that same language. Do not switch languages under any circumstances.`

        // Mark step running in DB (fire-and-forget — don't block pipeline)
        void supabaseAdmin
          .from('pipeline_steps')
          .update({ status: 'running', updated_at: new Date().toISOString() })
          .eq('run_id', runId)
          .eq('step_order', step.order)

        // Build context from previous steps (cap to last 2)
        const recentOutputs = accumulatedOutputs.slice(-2)
        let contextBlock = ''
        if (recentOutputs.length > 0) {
          contextBlock = "\n\n---\nPrevious agents' outputs:\n\n"
          for (const prev of recentOutputs) {
            const truncated = prev.output.length > 300
              ? prev.output.slice(0, 300) + '…'
              : prev.output
            contextBlock += `=== ${prev.label} (${prev.name}) ===\n${truncated}\n\n`
          }
        }

        const userMessage = `Original brief:\n${brief}${contextBlock}`
        let fullOutput = ''

        // Per-step timeout: 40s max
        const controller = new AbortController()
        const stepTimeout = setTimeout(() => controller.abort(), 40_000)

        try {
          const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'mistral-small-latest',
              max_tokens: 512,
              stream: false,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
              ],
            }),
            signal: controller.signal,
          })

          if (!res.ok) {
            const errText = await res.text().catch(() => res.status.toString())
            throw new Error(`Mistral API error ${res.status}: ${errText}`)
          }

          const json = await res.json() as { choices: Array<{ message: { content: string } }> }
          fullOutput = json.choices?.[0]?.message?.content ?? ''
        } finally {
          clearTimeout(stepTimeout)
        }

        // Final write for this step
        await supabaseAdmin
          .from('pipeline_steps')
          .update({
            status: 'done',
            output: fullOutput,
            updated_at: new Date().toISOString(),
          })
          .eq('run_id', runId)
          .eq('step_order', step.order)

        accumulatedOutputs.push({ label: step.label, name: step.name, output: fullOutput })
      }

      // Mark run done
      await supabaseAdmin
        .from('pipeline_runs')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', runId)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[pipeline] error:', msg)
      await supabaseAdmin
        .from('pipeline_runs')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', runId)
    }
  })

  // Return runId immediately — client polls GET /api/pipeline/[runId]
  return new Response(JSON.stringify({ runId }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
