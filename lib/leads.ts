import 'server-only'
import { Resend } from 'resend'
import { supabaseAdmin } from './supabase-admin'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@cascade.app'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cascade-ai.com'

// Platform's own WhatsApp Business credentials (Meta), used for lead follow-up — distinct from per-user creds in user_integrations
const WHATSAPP_TOKEN = process.env.CASCADE_WHATSAPP_TOKEN
const WHATSAPP_PHONE_ID = process.env.CASCADE_WHATSAPP_PHONE_ID

export type Lead = {
  id: string
  email: string
  whatsapp_number: string | null
  segment: string | null
  plan_interest: string | null
  status: 'new' | 'contacted' | 'converted' | 'unsubscribed'
  followup_count: number
  last_contacted_at: string | null
  created_at: string
}

export async function captureLead(input: {
  email: string
  whatsappNumber?: string
  segment?: string
  planInterest?: string
}): Promise<Lead> {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .upsert(
      {
        email: input.email.toLowerCase().trim(),
        whatsapp_number: input.whatsappNumber?.replace(/[^\d+]/g, '') || null,
        segment: input.segment ?? null,
        plan_interest: input.planInterest ?? null,
      },
      { onConflict: 'email' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)

  await sendWelcomeMessage(data as Lead)
  return data as Lead
}

async function sendWelcomeMessage(lead: Lead): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM,
      to: lead.email,
      subject: 'Bienvenue sur Cascade AI 🎯',
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:8px">Merci pour votre intérêt 👋</h2>
  <p>Cascade AI orchestre 18 agents IA pour transformer un brief en campagne complète en quelques minutes.</p>
  <p><a href="${APP_URL}/sign-up" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600">Démarrer gratuitement</a></p>
  <p style="color:#666;font-size:13px;margin-top:24px">Cascade AI</p>
</body>
</html>`,
    })
  } catch (err) {
    console.error('[leads] welcome email failed:', err)
  }
}

async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return false
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { body: message },
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[leads] whatsapp send failed:', err)
    return false
  }
}

const FOLLOWUP_STAGES = [
  { afterDays: 1, subject: '18 agents IA, 3 minutes', html: '<p>Avez-vous eu le temps de tester Cascade AI ? Brief → campagne complète en 3-8 min.</p>', whatsapp: 'Bonjour 👋 Avez-vous eu le temps de tester Cascade AI ? 18 agents IA transforment votre brief en campagne complète en quelques minutes. Essai gratuit 7 jours : ' },
  { afterDays: 3, subject: 'Pourquoi les agences choisissent Cascade AI', html: '<p>Gestion de plusieurs clients, génération de contenu SEO, campagnes ads — tout orchestré par IA. Découvrez comment.</p>', whatsapp: '🚀 Cascade AI gère vos campagnes clients de A à Z avec 18 agents IA spécialisés. Essai gratuit 7 jours, sans engagement : ' },
  { afterDays: 7, subject: 'Dernière chance — essai gratuit 7 jours', html: '<p>Votre essai gratuit de 7 jours est toujours disponible. Lancez votre première cascade aujourd\'hui.</p>', whatsapp: '⏰ Dernier rappel : votre essai gratuit Cascade AI de 7 jours vous attend. Commencez ici : ' },
] as const

export async function runLeadFollowups(): Promise<{ processed: number }> {
  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select('*')
    .in('status', ['new', 'contacted'])
    .lt('followup_count', FOLLOWUP_STAGES.length)

  if (!leads?.length) return { processed: 0 }

  let processed = 0
  const now = Date.now()

  for (const lead of leads as Lead[]) {
    const stage = FOLLOWUP_STAGES[lead.followup_count]
    const reference = lead.last_contacted_at ?? lead.created_at
    const dueAt = new Date(reference).getTime() + stage.afterDays * 24 * 60 * 60 * 1000
    if (now < dueAt) continue

    const signupUrl = `${APP_URL}/sign-up?utm_source=relance&utm_stage=${lead.followup_count + 1}`

    await resend.emails.send({
      from: FROM,
      to: lead.email,
      subject: stage.subject,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:600px;margin:0 auto;padding:24px">${stage.html}<p><a href="${signupUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-weight:600">Commencer gratuitement</a></p></body></html>`,
    }).catch((err) => console.error('[leads] followup email failed:', err))

    if (lead.whatsapp_number) {
      await sendWhatsAppMessage(lead.whatsapp_number, `${stage.whatsapp}${signupUrl}`)
    }

    await supabaseAdmin
      .from('leads')
      .update({
        status: 'contacted',
        followup_count: lead.followup_count + 1,
        last_contacted_at: new Date().toISOString(),
      })
      .eq('id', lead.id)

    processed += 1
  }

  return { processed }
}
