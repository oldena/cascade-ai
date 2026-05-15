export const dynamic = 'force-dynamic'

import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 })
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const body = await req.text()

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses } = evt.data
    const email = email_addresses[0]?.email_address ?? ''
    const { error } = await supabaseAdmin.from('users').insert({
      id,
      email,
      plan: 'starter',
    })
    if (error) return new Response('DB insert failed', { status: 500 })
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses } = evt.data
    const email = email_addresses[0]?.email_address ?? ''
    const { error } = await supabaseAdmin.from('users').update({ email, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return new Response('DB update failed', { status: 500 })
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    if (id) {
      const { error } = await supabaseAdmin.from('users').delete().eq('id', id)
      if (error) return new Response('DB delete failed', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
