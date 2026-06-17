import 'server-only'
import { z } from 'zod'
import { captureLead } from '@/lib/leads'

const leadSchema = z.object({
  email: z.string().email(),
  whatsappNumber: z.string().min(6).max(20).optional(),
  segment: z.string().max(50).optional(),
  planInterest: z.string().max(50).optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Champs invalides', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const lead = await captureLead(parsed.data)
    return Response.json({ ok: true, leadId: lead.id })
  } catch (err) {
    console.error('[api/leads] capture failed:', err)
    return Response.json({ error: 'Échec de la capture du lead' }, { status: 500 })
  }
}
