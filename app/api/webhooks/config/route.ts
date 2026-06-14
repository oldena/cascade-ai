export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('user_webhooks')
    .select('id, name, url, events, active, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as { name?: string; url?: string; events?: string[] }
  const { name, url, events = ['pipeline.completed'] } = body

  if (!name || !url) {
    return Response.json({ error: 'name and url are required' }, { status: 400 })
  }

  try { new URL(url) } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const secret = randomBytes(32).toString('hex')

  const { data, error } = await supabaseAdmin
    .from('user_webhooks')
    .insert({ user_id: userId, name, url, events, secret })
    .select('id, name, url, events, active, secret, created_at')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('user_webhooks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
