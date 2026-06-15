import 'server-only'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { brief: string; pipelineType?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { brief, pipelineType } = body
  if (!brief?.trim()) return Response.json({ error: 'brief required' }, { status: 400 })

  const prompt = `You are a brief quality evaluator for a marketing AI pipeline.

Evaluate the following brief on a scale of 1-10 and return ONLY valid JSON (no markdown, no commentary).

Brief: """
${brief.slice(0, 2000)}
"""

Pipeline type: ${pipelineType ?? 'marketing-general'}

Return exactly this JSON structure:
{
  "score": <number 1-10>,
  "label": "<Faible|Moyen|Bon|Excellent>",
  "suggestions": ["<suggestion 1 in French, max 12 words>", "<suggestion 2 in French, max 12 words>"]
}

Scoring criteria:
- 1-3 (Faible): Vague, no brand name, no context, no goal
- 4-6 (Moyen): Has a brand but lacks specifics (budget, target, differentiators)
- 7-8 (Bon): Clear brand, goal, target audience present
- 9-10 (Excellent): Brand + goal + target + budget + competitors + tone all present`

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        max_tokens: 200,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) return Response.json({ score: 5, label: 'Moyen', suggestions: [] })

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const raw = data.choices?.[0]?.message?.content ?? '{}'
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as { score?: number; label?: string; suggestions?: string[] }

    return Response.json({
      score: typeof parsed.score === 'number' ? Math.min(10, Math.max(1, parsed.score)) : 5,
      label: parsed.label ?? 'Moyen',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 2) : [],
    })
  } catch {
    return Response.json({ score: 5, label: 'Moyen', suggestions: [] })
  }
}
