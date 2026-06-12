import 'server-only'
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

  // Return runId — client drives each step via POST /api/pipeline/step
  return new Response(JSON.stringify({ runId }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
