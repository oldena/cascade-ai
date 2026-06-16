import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getPipelineSteps, PIPELINE_DEFINITIONS, DEFAULT_PIPELINE } from '@/lib/pipeline-definitions'
import { checkSubscriptionActive } from '@/lib/subscription'

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

  let body: { brief: string; pipelineType?: string; clientId?: string }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { brief, pipelineType = DEFAULT_PIPELINE, clientId } = body
  if (!brief?.trim()) {
    return new Response(JSON.stringify({ error: 'brief is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const resolvedType = PIPELINE_DEFINITIONS[pipelineType] ? pipelineType : DEFAULT_PIPELINE
  const PIPELINE_STEPS = getPipelineSteps(resolvedType)

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

  const subscription = await checkSubscriptionActive(userId)
  if (!subscription.active) {
    const message = subscription.reason === 'trial_expired'
      ? 'Votre essai gratuit de 7 jours est terminé. Passez à un plan payant pour continuer.'
      : subscription.reason === 'subscription_expired'
      ? 'Votre abonnement a expiré. Renouvelez votre plan pour continuer.'
      : 'Aucun plan actif. Souscrivez un plan pour continuer.'
    return new Response(JSON.stringify({ error: message, code: subscription.reason ?? 'no_plan' }), {
      status: 402,
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
    .insert({ user_id: userId, brief, status: 'running', pipeline_type: resolvedType, ...(clientId ? { client_id: clientId } : {}) })
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
