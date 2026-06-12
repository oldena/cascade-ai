import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const PIPELINE_STEPS = [
  { slug: 'noam',               name: 'Oumara',  label: 'CEO Agent',          order: 0  },
  { slug: 'market-researcher',  name: 'Lucas',   label: 'Market Researcher',  order: 1  },
  { slug: 'antoine',            name: 'Antoine', label: 'Brand Strategist',   order: 2  },
  { slug: 'offer-strategist',   name: 'Marco',   label: 'Offer Strategist',   order: 3  },
  { slug: 'funnel-architect',   name: 'Diana',   label: 'Funnel Architect',   order: 4  },
  { slug: 'social-strategist',  name: 'Sophie',  label: 'Social Strategist',  order: 5  },
  { slug: 'lea',                name: 'Léa',     label: 'Senior Copywriter',  order: 6  },
  { slug: 'mia',                name: 'Mia',     label: 'Creative Director',  order: 7  },
  { slug: 'video-scriptwriter', name: 'Camille', label: 'Video Scriptwriter', order: 8  },
  { slug: 'ugc-creator',        name: 'Jade',    label: 'UGC Creator',        order: 9  },
  { slug: 'youtube-strategist', name: 'Sam',     label: 'YouTube Strategist', order: 10 },
  { slug: 'ads-manager',        name: 'Max',     label: 'Ads Manager',        order: 11 },
  { slug: 'seo-specialist',     name: 'Lena',    label: 'SEO Specialist',     order: 12 },
  { slug: 'lead-gen',           name: 'Nina',    label: 'Lead Generation',    order: 13 },
  { slug: 'cold-outreach',      name: 'Victor',  label: 'Cold Outreach',      order: 14 },
  { slug: 'closer',             name: 'Rafael',  label: 'Sales Closer',       order: 15 },
  { slug: 'crm-manager',        name: 'Emma',    label: 'CRM Manager',        order: 16 },
  { slug: 'customer-success',   name: 'Zoé',     label: 'Customer Success',   order: 17 },
]

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { runId: string; stepOrder: number }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { runId, stepOrder } = body
  if (!runId || stepOrder == null) {
    return Response.json({ error: 'runId and stepOrder required' }, { status: 400 })
  }

  const step = PIPELINE_STEPS.find((s) => s.order === stepOrder)
  if (!step) {
    return Response.json({ error: `Unknown stepOrder: ${stepOrder}` }, { status: 400 })
  }

  // Verify ownership + fetch brief
  const { data: run } = await supabaseAdmin
    .from('pipeline_runs')
    .select('brief')
    .eq('id', runId)
    .eq('user_id', userId)
    .single()

  if (!run) {
    return Response.json({ error: 'Run not found' }, { status: 404 })
  }

  // Fetch agent system prompt
  const { data: agent } = await supabaseAdmin
    .from('agents')
    .select('system_prompt')
    .eq('slug', step.slug)
    .single()

  const basePrompt = agent?.system_prompt ?? `You are ${step.name}, a specialist AI agent.`
  const systemPrompt = `${basePrompt}

IMPORTANT: Detect the language of the user's brief and respond entirely in that same language. Do not switch languages under any circumstances.

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

  // Call Mistral (40s per-step timeout)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 40_000)

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
      throw new Error(`Mistral ${res.status}: ${errText}`)
    }

    const json = await res.json() as { choices: Array<{ message: { content: string } }> }
    const output = json.choices?.[0]?.message?.content ?? ''

    await supabaseAdmin
      .from('pipeline_steps')
      .update({ status: 'done', output, updated_at: new Date().toISOString() })
      .eq('run_id', runId)
      .eq('step_order', stepOrder)

    const isLast = stepOrder === PIPELINE_STEPS.length - 1
    if (isLast) {
      await supabaseAdmin
        .from('pipeline_runs')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', runId)
    }

    return Response.json({ output, isLast })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await supabaseAdmin
      .from('pipeline_steps')
      .update({ status: 'failed', output: msg, updated_at: new Date().toISOString() })
      .eq('run_id', runId)
      .eq('step_order', stepOrder)
    await supabaseAdmin
      .from('pipeline_runs')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', runId)
    return Response.json({ error: msg }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}
