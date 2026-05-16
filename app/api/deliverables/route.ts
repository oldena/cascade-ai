import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    agentId: string
    conversationId?: string
    title: string
    content: string
    format: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { agentId, conversationId, title, content, format } = body
  if (!agentId || !title || !content || !format) {
    return NextResponse.json(
      { error: 'agentId, title, content, and format are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin
    .from('deliverables')
    .insert({
      user_id: userId,
      agent_id: agentId,
      conversation_id: conversationId ?? null,
      title,
      content,
      format,
    })
    .select('*')
    .single()

  if (error || !data) {
    console.error('[deliverables] insert error:', error?.message)
    return NextResponse.json({ error: 'Failed to save deliverable' }, { status: 500 })
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
    .from('deliverables')
    .select('*')
    .eq('user_id', userId)
    .eq('agent_id', agent.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[deliverables] fetch error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch deliverables' }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
