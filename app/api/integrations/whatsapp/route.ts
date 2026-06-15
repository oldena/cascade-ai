import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { to: string; message: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { to, message } = body
  if (!to || !message) {
    return Response.json({ error: 'Champs requis : to, message' }, { status: 400 })
  }

  const { data: creds } = await supabaseAdmin
    .from('user_integrations')
    .select('whatsapp_token, whatsapp_phone_id')
    .eq('user_id', userId)
    .single()

  if (!creds?.whatsapp_token || !creds?.whatsapp_phone_id) {
    return Response.json({ error: 'WhatsApp non configuré. Ajoutez vos identifiants Meta Business dans les intégrations.' }, { status: 422 })
  }

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${creds.whatsapp_phone_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.whatsapp_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { body: message },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    return Response.json({ error: err.error?.message ?? 'Erreur WhatsApp' }, { status: res.status })
  }

  return Response.json({ ok: true })
}
