import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { to: string; subject: string; content: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { to, subject, content } = body
  if (!to || !subject || !content) {
    return Response.json({ error: 'Champs requis : to, subject, content' }, { status: 400 })
  }

  const { data: creds } = await supabaseAdmin
    .from('user_integrations')
    .select('resend_api_key, resend_from_email, resend_from_name')
    .eq('user_id', userId)
    .single()

  if (!creds?.resend_api_key) {
    return Response.json({ error: 'Email non configuré. Ajoutez votre clé Resend dans les intégrations.' }, { status: 422 })
  }

  const resend = new Resend(creds.resend_api_key)
  const from = creds.resend_from_name
    ? `${creds.resend_from_name} <${creds.resend_from_email ?? 'noreply@cascade-ai.com'}>`
    : (creds.resend_from_email ?? 'noreply@cascade-ai.com')

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html: `<div style="font-family:sans-serif;max-width:700px;margin:0 auto;white-space:pre-wrap">${content.replace(/\n/g, '<br>')}</div>`,
  })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
