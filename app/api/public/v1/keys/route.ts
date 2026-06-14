export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { randomBytes, createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, revoked_at, created_at')
    .eq('user_id', userId)
    .is('revoked_at', null)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await request.json() as { name?: string }
  if (!name) return Response.json({ error: 'name is required' }, { status: 400 })

  const rawKey = `csk_${randomBytes(32).toString('hex')}`
  const keyHash = createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 12)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({ user_id: userId, name, key_hash: keyHash, key_prefix: keyPrefix })
    .select('id, name, key_prefix, created_at')
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Return full key only on creation — never shown again
  return Response.json({ ...data, key: rawKey }, { status: 201 })
}

export async function DELETE(request: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ success: true })
}
