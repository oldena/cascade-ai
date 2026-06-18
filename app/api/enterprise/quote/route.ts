export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEnterpriseQuoteEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? 'contact@cascadeagentic.com'

const TEAM_SIZES = ['1-5', '6-20', '21-100', '100+'] as const
const USE_CASES = [
  'Agence multi-clients',
  'Équipe marketing interne',
  'Automatisation réseaux sociaux',
  'Génération de leads B2B',
  'Content marketing à grande échelle',
  'Autre',
] as const

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const rl = checkRateLimit(`enterprise-quote:${ip}`, 3_600_000, 3)
  if (!rl.allowed) return Response.json({ error: 'Trop de demandes. Réessayez dans 1h.' }, { status: 429 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const name = typeof b.name === 'string' ? b.name.trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : ''
  const company = typeof b.company === 'string' ? b.company.trim() : ''
  const teamSize = typeof b.team_size === 'string' ? b.team_size : ''
  const useCase = typeof b.use_case === 'string' ? b.use_case : ''
  const message = typeof b.message === 'string' ? b.message.slice(0, 1000) : undefined

  if (!name || name.length > 100) return Response.json({ error: 'Nom requis (max 100 chars)' }, { status: 400 })
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Email invalide' }, { status: 400 })
  if (!company || company.length > 200) return Response.json({ error: 'Entreprise requise (max 200 chars)' }, { status: 400 })
  if (!TEAM_SIZES.includes(teamSize as typeof TEAM_SIZES[number])) return Response.json({ error: 'Taille équipe invalide' }, { status: 400 })
  if (!USE_CASES.includes(useCase as typeof USE_CASES[number])) return Response.json({ error: "Cas d'usage invalide" }, { status: 400 })

  const { error } = await supabaseAdmin.from('enterprise_quotes').insert({
    name, email, company, team_size: teamSize, use_case: useCase, message,
  })

  if (error) {
    console.error('[enterprise/quote] insert error:', error)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  await sendEnterpriseQuoteEmail(ADMIN_EMAIL, { name, email, company, teamSize, useCase, message })

  return Response.json({ success: true }, { status: 201 })
}
