import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { agentId: string; title?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { agentId, title } = body
  if (!agentId) return NextResponse.json({ error: 'agentId is required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({
      user_id: userId,
      agent_id: agentId,
      title: title ?? 'Nouvelle conversation',
    })
    .select('*')
    .single()

  if (error || !data) {
    console.error('[conversations] insert error:', error?.message)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const agentSlug = searchParams.get('agentSlug')
  if (!agentSlug) return NextResponse.json({ error: 'agentSlug is required' }, { status: 400 })

  const { data: agent, error: agentError } = await supabaseAdmin
    .from('agents')
    .select('id')
    .eq('slug', agentSlug)
    .single()

  if (agentError || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_id', agent.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[conversations] fetch error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
